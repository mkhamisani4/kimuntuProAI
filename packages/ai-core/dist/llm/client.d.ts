/**
 * OpenAI Client Wrapper
 * Robust LLM client with retries, caching, structured outputs, and tool support
 */
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { z } from 'zod';
import { type ModelId } from './models.js';
import type { AssistantType } from '@kimuntupro/shared';
/**
 * Chat message type
 */
export type ChatMessage = ChatCompletionMessageParam;
/**
 * Chat response with metrics
 */
export interface ChatResponse {
    text: string;
    raw: any;
    tokensIn: number;
    tokensOut: number;
    model: string;
    latencyMs: number;
    cachedInputApplied: boolean;
    costCents: number;
}
/**
 * Structured chat response
 */
export interface StructuredChatResponse<T> {
    data: T;
    raw: any;
    tokensIn: number;
    tokensOut: number;
    model: string;
    latencyMs: number;
    cachedInputApplied: boolean;
    costCents: number;
}
/**
 * Tool call result
 */
export interface ToolCallResult {
    name: string;
    arguments: Record<string, any>;
    result: any;
}
/**
 * Chat with tools response
 */
export interface ChatWithToolsResponse {
    text: string;
    toolCalls: ToolCallResult[];
    toolInvocations: Record<string, number>;
    raw: any;
    tokensIn: number;
    tokensOut: number;
    model: string;
    latencyMs: number;
    costCents: number;
}
/**
 * Tool spec
 */
export type ToolSpec = ChatCompletionTool;
/**
 * Tool handler function
 */
export type ToolHandler = (args: Record<string, any>) => Promise<any> | any;
/**
 * Usage callback
 */
export type UsageCallback = (metrics: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    latencyMs: number;
    toolInvocations?: Record<string, number>;
}) => void | Promise<void>;
/**
 * Telemetry metadata for usage tracking
 */
export interface TelemetryMetadata {
    tenantId: string;
    userId: string;
    assistant: AssistantType;
    requestId?: string;
    meta?: Record<string, any>;
}
/**
 * Logger interface
 */
export interface Logger {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
}
/**
 * OpenAI client configuration
 */
export interface OpenAIClientConfig {
    apiKey?: string;
    modelMini?: ModelId;
    modelEscalation?: ModelId;
    maxTokensPlanner?: number;
    maxTokensExecutor?: number;
    enablePromptCaching?: boolean;
    maxRetries?: number;
    timeoutMs?: number;
    logger?: Logger;
    onUsage?: UsageCallback;
    circuitBreakerThreshold?: number;
    circuitBreakerResetMs?: number;
}
/**
 * OpenAI Client wrapper with advanced features
 */
export declare class OpenAIClient {
    private client;
    private modelMini;
    private modelEscalation;
    private maxTokensPlanner;
    private maxTokensExecutor;
    private enablePromptCaching;
    private maxRetries;
    private timeoutMs;
    private logger;
    private onUsage?;
    private circuitBreaker;
    private circuitBreakerThreshold;
    private circuitBreakerResetMs;
    private recentIdempotencyKeys;
    constructor(config?: OpenAIClientConfig);
    /**
     * Chat completion
     */
    chat(opts: {
        model?: string;
        messages: ChatMessage[];
        maxOutputTokens?: number;
        temperature?: number;
        cacheTag?: string;
        idempotencyKey?: string;
        timeoutMs?: number;
        telemetry?: TelemetryMetadata;
    }): Promise<ChatResponse>;
    /**
     * Chat with structured output
     */
    chatStructured<T>(opts: {
        schema: z.ZodType<T>;
        schemaName: string;
        schemaDescription?: string;
        model?: string;
        messages: ChatMessage[];
        maxOutputTokens?: number;
        temperature?: number;
        cacheTag?: string;
        idempotencyKey?: string;
        telemetry?: TelemetryMetadata;
    }): Promise<StructuredChatResponse<T>>;
    /**
     * Chat with tools
     */
    chatWithTools(opts: {
        model?: string;
        messages: ChatMessage[];
        tools: ToolSpec[];
        toolHandlers: Record<string, ToolHandler>;
        maxOutputTokens?: number;
        temperature?: number;
        maxToolCalls?: number;
        telemetry?: TelemetryMetadata;
    }): Promise<ChatWithToolsResponse>;
    /**
     * Check if circuit breaker is open
     */
    private checkCircuitBreaker;
    /**
     * Record successful request
     */
    private recordSuccess;
    /**
     * Record failed request
     */
    private recordFailure;
    /**
     * Check if error is retryable
     */
    private isRetryableError;
    /**
     * Get retry delay with exponential backoff
     */
    private getRetryDelayMs;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Add idempotency key to recent set (with TTL cleanup)
     */
    private addIdempotencyKey;
    /**
     * Get configuration (useful for testing/inspection)
     */
    getConfig(): {
        modelMini: ModelId;
        modelEscalation: ModelId;
        maxTokensPlanner: number;
        maxTokensExecutor: number;
        enablePromptCaching: boolean;
        maxRetries: number;
        timeoutMs: number;
    };
}
//# sourceMappingURL=client.d.ts.map