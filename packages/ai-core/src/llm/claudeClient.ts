/**
 * Anthropic Claude Client
 * Dedicated client for Claude Sonnet 4.5 website generation
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude response with metrics
 */
export interface ClaudeResponse {
  text: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
  latencyMs: number;
  costCents: number;
}

/**
 * Claude client configuration
 */
export interface ClaudeClientConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  maxRetries?: number;
}

/**
 * Calculate cost for Claude Sonnet 4.5
 * Pricing as of 2025: $3/MTok input, $15/MTok output
 */
function calculateClaudeCost(tokensIn: number, tokensOut: number): number {
  const inputCostPerMillion = 3.0;
  const outputCostPerMillion = 15.0;

  const inputCost = (tokensIn / 1_000_000) * inputCostPerMillion;
  const outputCost = (tokensOut / 1_000_000) * outputCostPerMillion;

  return (inputCost + outputCost) * 100; // Convert to cents
}

/**
 * Claude Client for website generation
 */
export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private maxRetries: number;

  constructor(config: ClaudeClientConfig = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.client = new Anthropic({
      apiKey,
    });

    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 8000;
    this.temperature = config.temperature ?? 0.7;
    this.maxRetries = config.maxRetries ?? 3;
  }

  /**
   * Generate completion with Claude
   */
  async complete(opts: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<ClaudeResponse> {
    const startTime = Date.now();
    const maxTokens = opts.maxTokens || this.maxTokens;
    const temperature = opts.temperature ?? this.temperature;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: maxTokens,
          temperature,
          system: opts.systemPrompt,
          messages: [
            {
              role: 'user',
              content: opts.userPrompt,
            },
          ],
        });

        const latencyMs = Date.now() - startTime;
        const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
        const tokensIn = response.usage.input_tokens;
        const tokensOut = response.usage.output_tokens;
        const costCents = calculateClaudeCost(tokensIn, tokensOut);

        console.log(`[Claude] Generated response in ${latencyMs}ms - Input: ${tokensIn} tokens, Output: ${tokensOut} tokens, Cost: ${costCents.toFixed(2)}¢`);

        return {
          text,
          tokensIn,
          tokensOut,
          model: this.model,
          latencyMs,
          costCents,
        };
      } catch (error: any) {
        lastError = error;

        // Check if retryable
        const isRetryable =
          error.status === 429 || // Rate limit
          error.status === 500 || // Server error
          error.status === 503 || // Service unavailable
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNRESET';

        if (isRetryable && attempt < this.maxRetries - 1) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 32000) + Math.random() * 1000;
          console.warn(`[Claude] Retry attempt ${attempt + 1}/${this.maxRetries} after ${delayMs}ms: ${error.message}`);
          await this.sleep(delayMs);
          continue;
        }

        break;
      }
    }

    throw lastError || new Error('Claude completion failed');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current configuration
   */
  public getConfig() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      maxRetries: this.maxRetries,
    };
  }
}
