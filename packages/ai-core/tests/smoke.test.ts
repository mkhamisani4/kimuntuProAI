import { describe, it, expect } from 'vitest';
import {
  AnthropicClient,
  getModelConfig,
  getCostCents,
  DEFAULT_MODEL_MINI,
} from '../src/index.js';

describe('ai-core smoke tests', () => {
  it('should export AnthropicClient', () => {
    expect(AnthropicClient).toBeDefined();
    expect(typeof AnthropicClient).toBe('function');
  });

  it('should export model utilities', () => {
    expect(getModelConfig).toBeDefined();
    expect(DEFAULT_MODEL_MINI).toBe('claude-haiku-4-5-20251001');

    const config = getModelConfig('claude-haiku-4-5-20251001');
    expect(config.id).toBe('claude-haiku-4-5-20251001');
    expect(config.capabilities.supportsTools).toBe(true);
  });

  it('should export cost utilities', () => {
    expect(getCostCents).toBeDefined();

    const cost = getCostCents({
      model: 'claude-haiku-4-5-20251001',
      tokensIn: 1000,
      tokensOut: 1000,
    });

    expect(cost).toBeGreaterThan(0);
  });

  it('should require API key for AnthropicClient', () => {
    expect(() => new AnthropicClient()).toThrow('ANTHROPIC_API_KEY is required');
  });
});
