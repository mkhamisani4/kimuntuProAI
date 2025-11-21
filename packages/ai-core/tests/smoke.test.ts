import { describe, it, expect } from 'vitest';
import {
  OpenAIClient,
  getModelConfig,
  getCostCents,
  DEFAULT_MODEL_MINI,
} from '../src/index.js';

describe('ai-core smoke tests', () => {
  it('should export OpenAIClient', () => {
    expect(OpenAIClient).toBeDefined();
    expect(typeof OpenAIClient).toBe('function');
  });

  it('should export model utilities', () => {
    expect(getModelConfig).toBeDefined();
    expect(DEFAULT_MODEL_MINI).toBe('gpt-4o-mini');

    const config = getModelConfig('gpt-4o-mini');
    expect(config.id).toBe('gpt-4o-mini');
    expect(config.capabilities.supportsTools).toBe(true);
  });

  it('should export cost utilities', () => {
    expect(getCostCents).toBeDefined();

    const cost = getCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 1000,
      tokensOut: 1000,
    });

    expect(cost).toBeGreaterThan(0);
  });

  it('should require API key for OpenAIClient', () => {
    expect(() => new OpenAIClient()).toThrow('OPENAI_API_KEY is required');
  });
});
