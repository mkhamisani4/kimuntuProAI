/**
 * OpenAI Client Wrapper
 * Robust LLM client with retries, caching, structured outputs, and tool support
 */
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { getModelConfig, getModelFromEnv, DEFAULT_MODEL_MINI, DEFAULT_MODEL_ESCALATION } from './models.js';
import { getCostCents } from './costs.js';
import { asJsonSchema, parseStructured, extractJsonFromMarkdown } from './structured.js';
import { emitUsage, buildUsageFromClientEvent } from '../usage/meter.js';
/**
 * Default console logger
 */
const defaultLogger = {
    debug: () => { }, // Silent in production
    info: (msg, ...args) => console.log(msg, ...args),
    warn: (msg, ...args) => console.warn(msg, ...args),
    error: (msg, ...args) => console.error(msg, ...args),
};
/**
 * OpenAI Client wrapper with advanced features
 */
export class OpenAIClient {
    client;
    modelMini;
    modelEscalation; // Available for future escalation logic
    maxTokensPlanner; // Available for planner-specific limits
    maxTokensExecutor;
    enablePromptCaching; // Available for future caching implementation
    maxRetries;
    timeoutMs; // Configured in OpenAI client constructor
    logger;
    onUsage;
    circuitBreaker;
    circuitBreakerThreshold;
    circuitBreakerResetMs;
    recentIdempotencyKeys;
    constructor(config = {}) {
        // Read from environment with fallbacks
        const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is required');
        }
        this.client = new OpenAI({
            apiKey,
            timeout: config.timeoutMs || Number(process.env.TIMEOUT_MS) || 120000,
        });
        this.modelMini = config.modelMini || getModelFromEnv('MODEL_MINI', DEFAULT_MODEL_MINI);
        this.modelEscalation =
            config.modelEscalation || getModelFromEnv('MODEL_ESCALATION', DEFAULT_MODEL_ESCALATION);
        this.maxTokensPlanner = config.maxTokensPlanner || Number(process.env.MAX_TOKENS_PLANNER) || 4000;
        this.maxTokensExecutor = config.maxTokensExecutor || Number(process.env.MAX_TOKENS_EXECUTOR) || 8000;
        this.enablePromptCaching =
            config.enablePromptCaching ?? process.env.ENABLE_PROMPT_CACHING === 'true';
        this.maxRetries = config.maxRetries ?? 3;
        this.timeoutMs = config.timeoutMs || 120000;
        this.logger = config.logger || defaultLogger;
        this.onUsage = config.onUsage;
        // Circuit breaker
        this.circuitBreakerThreshold = config.circuitBreakerThreshold ?? 5;
        this.circuitBreakerResetMs = config.circuitBreakerResetMs ?? 60000;
        this.circuitBreaker = {
            failureCount: 0,
            lastFailureTime: 0,
            isOpen: false,
        };
        // Idempotency key deduplication (short window)
        this.recentIdempotencyKeys = new Set();
    }
    /**
     * Chat completion
     */
    async chat(opts) {
        const startTime = Date.now();
        const model = opts.model || this.modelMini;
        const modelConfig = getModelConfig(model);
        // Generate requestId if telemetry provided but no requestId
        const requestId = opts.telemetry?.requestId || (opts.telemetry ? randomUUID() : undefined);
        // Check circuit breaker
        this.checkCircuitBreaker();
        // Check idempotency
        if (opts.idempotencyKey && this.recentIdempotencyKeys.has(opts.idempotencyKey)) {
            throw new Error(`Duplicate request with idempotency key: ${opts.idempotencyKey}`);
        }
        // Enforce token limits
        const maxTokens = Math.min(opts.maxOutputTokens || this.maxTokensExecutor, modelConfig.maxOutputTokens);
        try {
            // Retry logic
            let lastError = null;
            for (let attempt = 0; attempt < this.maxRetries; attempt++) {
                try {
                    const completion = await this.client.chat.completions.create({
                        model,
                        messages: opts.messages,
                        max_tokens: maxTokens,
                        temperature: opts.temperature ?? modelConfig.defaultTemperature,
                        ...(opts.idempotencyKey && { idempotency_key: opts.idempotencyKey }),
                    });
                    const latencyMs = Date.now() - startTime;
                    const text = completion.choices[0]?.message?.content || '';
                    const tokensIn = completion.usage?.prompt_tokens || 0;
                    const tokensOut = completion.usage?.completion_tokens || 0;
                    const cachedInputApplied = false; // TODO: Detect from response headers when available
                    const costCents = getCostCents({
                        model,
                        tokensIn,
                        tokensOut,
                        cachedInputTokens: cachedInputApplied ? Math.floor(tokensIn * 0.8) : 0,
                    });
                    // Record success
                    this.recordSuccess();
                    if (opts.idempotencyKey) {
                        this.addIdempotencyKey(opts.idempotencyKey);
                    }
                    // Callback for usage tracking
                    if (this.onUsage) {
                        await this.onUsage({
                            model,
                            tokensIn,
                            tokensOut,
                            costCents,
                            latencyMs,
                        });
                    }
                    // Emit usage to database (Step 11)
                    if (opts.telemetry) {
                        const metrics = buildUsageFromClientEvent({
                            model,
                            tokensIn,
                            tokensOut,
                            latencyMs,
                            cachedInputTokens: cachedInputApplied ? Math.floor(tokensIn * 0.8) : 0,
                        });
                        await emitUsage({
                            tenantId: opts.telemetry.tenantId,
                            userId: opts.telemetry.userId,
                            assistant: opts.telemetry.assistant,
                            metrics,
                            requestId,
                            meta: opts.telemetry.meta,
                        }).catch((err) => {
                            // Log error but don't fail the request
                            this.logger.error('Failed to emit usage:', err);
                        });
                    }
                    return {
                        text,
                        raw: completion,
                        tokensIn,
                        tokensOut,
                        model,
                        latencyMs,
                        cachedInputApplied,
                        costCents,
                    };
                }
                catch (error) {
                    lastError = error;
                    // Check if retryable
                    if (this.isRetryableError(error) && attempt < this.maxRetries - 1) {
                        const delayMs = this.getRetryDelayMs(attempt);
                        this.logger.warn(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delayMs}ms: ${error.message}`);
                        await this.sleep(delayMs);
                        continue;
                    }
                    // Not retryable or max retries reached
                    break;
                }
            }
            // All retries failed
            this.recordFailure();
            throw lastError || new Error('Chat completion failed');
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    /**
     * Chat with structured output
     */
    async chatStructured(opts) {
        const model = opts.model || this.modelMini;
        const modelConfig = getModelConfig(model);
        if (!modelConfig.capabilities.supportsStructured) {
            throw new Error(`Model ${model} does not support structured outputs`);
        }
        const startTime = Date.now();
        const responseFormat = asJsonSchema(opts.schema, opts.schemaName, opts.schemaDescription);
        // Generate requestId if telemetry provided but no requestId
        const requestId = opts.telemetry?.requestId || (opts.telemetry ? randomUUID() : undefined);
        // Check circuit breaker
        this.checkCircuitBreaker();
        // Check idempotency
        if (opts.idempotencyKey && this.recentIdempotencyKeys.has(opts.idempotencyKey)) {
            throw new Error(`Duplicate request with idempotency key: ${opts.idempotencyKey}`);
        }
        try {
            let lastError = null;
            for (let attempt = 0; attempt < this.maxRetries; attempt++) {
                try {
                    const completion = await this.client.chat.completions.create({
                        model,
                        messages: opts.messages,
                        max_tokens: opts.maxOutputTokens || this.maxTokensExecutor,
                        temperature: opts.temperature ?? modelConfig.defaultTemperature,
                        ...responseFormat,
                        ...(opts.idempotencyKey && { idempotency_key: opts.idempotencyKey }),
                    });
                    const latencyMs = Date.now() - startTime;
                    const rawText = completion.choices[0]?.message?.content || '{}';
                    // Extract JSON from markdown if needed
                    const jsonText = extractJsonFromMarkdown(rawText);
                    // Parse and validate
                    const data = parseStructured(jsonText, opts.schema);
                    const tokensIn = completion.usage?.prompt_tokens || 0;
                    const tokensOut = completion.usage?.completion_tokens || 0;
                    const cachedInputApplied = false;
                    const costCents = getCostCents({ model, tokensIn, tokensOut });
                    // Record success
                    this.recordSuccess();
                    if (opts.idempotencyKey) {
                        this.addIdempotencyKey(opts.idempotencyKey);
                    }
                    // Usage callback
                    if (this.onUsage) {
                        await this.onUsage({
                            model,
                            tokensIn,
                            tokensOut,
                            costCents,
                            latencyMs,
                        });
                    }
                    // Emit usage to database (Step 11)
                    if (opts.telemetry) {
                        const metrics = buildUsageFromClientEvent({
                            model,
                            tokensIn,
                            tokensOut,
                            latencyMs,
                            cachedInputTokens: cachedInputApplied ? Math.floor(tokensIn * 0.8) : 0,
                        });
                        await emitUsage({
                            tenantId: opts.telemetry.tenantId,
                            userId: opts.telemetry.userId,
                            assistant: opts.telemetry.assistant,
                            metrics,
                            requestId,
                            meta: opts.telemetry.meta,
                        }).catch((err) => {
                            this.logger.error('Failed to emit usage:', err);
                        });
                    }
                    return {
                        data,
                        raw: completion,
                        tokensIn,
                        tokensOut,
                        model,
                        latencyMs,
                        cachedInputApplied,
                        costCents,
                    };
                }
                catch (error) {
                    lastError = error;
                    if (this.isRetryableError(error) && attempt < this.maxRetries - 1) {
                        const delayMs = this.getRetryDelayMs(attempt);
                        this.logger.warn(`Structured output retry ${attempt + 1}: ${error.message}`);
                        await this.sleep(delayMs);
                        continue;
                    }
                    break;
                }
            }
            this.recordFailure();
            throw lastError || new Error('Structured chat failed');
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    /**
     * Chat with tools
     */
    async chatWithTools(opts) {
        const model = opts.model || this.modelMini;
        const modelConfig = getModelConfig(model);
        if (!modelConfig.capabilities.supportsTools) {
            throw new Error(`Model ${model} does not support tools`);
        }
        const maxToolCalls = opts.maxToolCalls ?? 3;
        const toolInvocations = {};
        const toolCalls = [];
        let messages = [...opts.messages];
        let totalTokensIn = 0;
        let totalTokensOut = 0;
        const startTime = Date.now();
        // Generate requestId if telemetry provided but no requestId
        const requestId = opts.telemetry?.requestId || (opts.telemetry ? randomUUID() : undefined);
        this.checkCircuitBreaker();
        try {
            for (let iteration = 0; iteration < maxToolCalls; iteration++) {
                const completion = await this.client.chat.completions.create({
                    model,
                    messages,
                    tools: opts.tools,
                    max_tokens: opts.maxOutputTokens || this.maxTokensExecutor,
                    temperature: opts.temperature ?? modelConfig.defaultTemperature,
                });
                const tokensIn = completion.usage?.prompt_tokens || 0;
                const tokensOut = completion.usage?.completion_tokens || 0;
                totalTokensIn += tokensIn;
                totalTokensOut += tokensOut;
                const choice = completion.choices[0];
                if (!choice) {
                    throw new Error('No completion choice returned');
                }
                // Add assistant message
                messages.push(choice.message);
                // Check for tool calls
                const toolCallsInResponse = choice.message.tool_calls;
                if (!toolCallsInResponse || toolCallsInResponse.length === 0) {
                    // No more tool calls, return final message
                    const latencyMs = Date.now() - startTime;
                    const costCents = getCostCents({ model, tokensIn: totalTokensIn, tokensOut: totalTokensOut });
                    this.recordSuccess();
                    if (this.onUsage) {
                        await this.onUsage({
                            model,
                            tokensIn: totalTokensIn,
                            tokensOut: totalTokensOut,
                            costCents,
                            latencyMs,
                            toolInvocations,
                        });
                    }
                    // Emit usage to database (Step 11)
                    if (opts.telemetry) {
                        const metrics = buildUsageFromClientEvent({
                            model,
                            tokensIn: totalTokensIn,
                            tokensOut: totalTokensOut,
                            latencyMs,
                            toolInvocations,
                        });
                        await emitUsage({
                            tenantId: opts.telemetry.tenantId,
                            userId: opts.telemetry.userId,
                            assistant: opts.telemetry.assistant,
                            metrics,
                            requestId,
                            meta: opts.telemetry.meta,
                        }).catch((err) => {
                            this.logger.error('Failed to emit usage:', err);
                        });
                    }
                    return {
                        text: choice.message.content || '',
                        toolCalls,
                        toolInvocations,
                        raw: completion,
                        tokensIn: totalTokensIn,
                        tokensOut: totalTokensOut,
                        model,
                        latencyMs,
                        costCents,
                    };
                }
                // Execute tool calls
                for (const toolCall of toolCallsInResponse) {
                    const toolName = toolCall.function.name;
                    const handler = opts.toolHandlers[toolName];
                    if (!handler) {
                        this.logger.warn(`No handler for tool: ${toolName}`);
                        continue;
                    }
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const result = await handler(args);
                        // Track invocations
                        toolInvocations[toolName] = (toolInvocations[toolName] || 0) + 1;
                        // Record tool call
                        toolCalls.push({
                            name: toolName,
                            arguments: args,
                            result,
                        });
                        // Add tool result message
                        messages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify(result),
                        });
                    }
                    catch (error) {
                        this.logger.error(`Tool execution failed: ${toolName}`, error);
                        messages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({ error: 'Tool execution failed' }),
                        });
                    }
                }
            }
            // Max tool calls reached
            this.logger.warn(`Max tool calls (${maxToolCalls}) reached`);
            const latencyMs = Date.now() - startTime;
            const costCents = getCostCents({ model, tokensIn: totalTokensIn, tokensOut: totalTokensOut });
            this.recordSuccess();
            return {
                text: 'Max tool calls reached',
                toolCalls,
                toolInvocations,
                raw: {},
                tokensIn: totalTokensIn,
                tokensOut: totalTokensOut,
                model,
                latencyMs,
                costCents,
            };
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    /**
     * Check if circuit breaker is open
     */
    checkCircuitBreaker() {
        if (this.circuitBreaker.isOpen) {
            const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailureTime;
            if (timeSinceFailure < this.circuitBreakerResetMs) {
                throw new Error('Circuit breaker is open. Too many recent failures.');
            }
            // Reset circuit breaker
            this.circuitBreaker.isOpen = false;
            this.circuitBreaker.failureCount = 0;
            this.logger.info('Circuit breaker reset');
        }
    }
    /**
     * Record successful request
     */
    recordSuccess() {
        if (this.circuitBreaker.failureCount > 0) {
            this.circuitBreaker.failureCount = Math.max(0, this.circuitBreaker.failureCount - 1);
        }
    }
    /**
     * Record failed request
     */
    recordFailure() {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        if (this.circuitBreaker.failureCount >= this.circuitBreakerThreshold) {
            this.circuitBreaker.isOpen = true;
            this.logger.error('Circuit breaker opened due to consecutive failures');
        }
    }
    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        // Rate limit errors (429)
        if (error.status === 429)
            return true;
        // Server errors (5xx)
        if (error.status >= 500 && error.status < 600)
            return true;
        // Timeout errors
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET')
            return true;
        return false;
    }
    /**
     * Get retry delay with exponential backoff
     */
    getRetryDelayMs(attempt) {
        const baseDelay = 1000; // 1 second
        const maxDelay = 32000; // 32 seconds
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        // Add jitter
        return delay + Math.random() * 1000;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Add idempotency key to recent set (with TTL cleanup)
     */
    addIdempotencyKey(key) {
        this.recentIdempotencyKeys.add(key);
        // Clean up after 5 minutes
        setTimeout(() => {
            this.recentIdempotencyKeys.delete(key);
        }, 300000);
    }
    /**
     * Get configuration (useful for testing/inspection)
     */
    getConfig() {
        return {
            modelMini: this.modelMini,
            modelEscalation: this.modelEscalation,
            maxTokensPlanner: this.maxTokensPlanner,
            maxTokensExecutor: this.maxTokensExecutor,
            enablePromptCaching: this.enablePromptCaching,
            maxRetries: this.maxRetries,
            timeoutMs: this.timeoutMs,
        };
    }
}
//# sourceMappingURL=client.js.map