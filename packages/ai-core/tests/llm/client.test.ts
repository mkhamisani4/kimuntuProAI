import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { OpenAIClient, type ChatMessage } from '../../src/llm/client.js';
import { getCostCents } from '../../src/llm/costs.js';

// Create mock function
const mockCreate = vi.fn();

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe('OpenAI Client', () => {
  let client: OpenAIClient;

  beforeEach(() => {
    // Set required env vars
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.MODEL_MINI = 'gpt-4o-mini';
    process.env.MODEL_ESCALATION = 'gpt-4o';

    // Reset mock
    mockCreate.mockReset();

    // Create client
    client = new OpenAIClient({
      maxRetries: 2,
      timeoutMs: 5000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('chat()', () => {
    it('should complete basic chat', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help?',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ];

      const response = await client.chat({ messages });

      expect(response.text).toBe('Hello! How can I help?');
      expect(response.tokensIn).toBe(10);
      expect(response.tokensOut).toBe(20);
      expect(response.model).toBe('gpt-4o-mini');
      expect(response.costCents).toBeGreaterThanOrEqual(0); // Small token counts may round to 0
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should use specified model', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 10 },
      });

      await client.chat({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
        })
      );
    });

    it('should enforce max tokens', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 10 },
      });

      await client.chat({
        messages: [{ role: 'user', content: 'Test' }],
        maxOutputTokens: 1000,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1000,
        })
      );
    });

    it('should set custom temperature', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 10 },
      });

      await client.chat({
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.3,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3,
        })
      );
    });

    it('should retry on 429 error', async () => {
      const error = new Error('Rate limited');
      (error as any).status = 429;

      mockCreate
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Success' } }],
          usage: { prompt_tokens: 10, completion_tokens: 10 },
        });

      const response = await client.chat({
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(response.text).toBe('Success');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const error = new Error('Server error');
      (error as any).status = 500;

      mockCreate.mockRejectedValue(error);

      await expect(
        client.chat({
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('Server error');

      expect(mockCreate).toHaveBeenCalledTimes(2); // Initial + 1 retry (maxRetries=2)
    });

    it('should prevent duplicate idempotency keys', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 10 },
      });

      await client.chat({
        messages: [{ role: 'user', content: 'Test' }],
        idempotencyKey: 'unique-key-1',
      });

      await expect(
        client.chat({
          messages: [{ role: 'user', content: 'Test' }],
          idempotencyKey: 'unique-key-1',
        })
      ).rejects.toThrow('Duplicate request');
    });

    it('should call usage callback', async () => {
      const usageCallback = vi.fn();
      const clientWithCallback = new OpenAIClient({
        onUsage: usageCallback,
      });

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50 },
      });

      await clientWithCallback.chat({
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(usageCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          tokensIn: 100,
          tokensOut: 50,
          costCents: expect.any(Number),
          latencyMs: expect.any(Number),
        })
      );
    });
  });

  describe('chatStructured()', () => {
    const testSchema = z.object({
      answer: z.string(),
      confidence: z.number(),
    });

    it('should return structured output', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                answer: 'Paris',
                confidence: 0.95,
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 10,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const response = await client.chatStructured({
        schema: testSchema,
        schemaName: 'TestResponse',
        messages: [{ role: 'user', content: 'What is the capital of France?' }],
      });

      expect(response.data.answer).toBe('Paris');
      expect(response.data.confidence).toBe(0.95);
      expect(response.tokensIn).toBe(20);
      expect(response.tokensOut).toBe(10);
    });

    it('should handle markdown-wrapped JSON', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '```json\n{"answer": "London", "confidence": 0.9}\n```',
            },
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 10,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const response = await client.chatStructured({
        schema: testSchema,
        schemaName: 'TestResponse',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(response.data.answer).toBe('London');
    });

    it('should validate schema', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                answer: 'Paris',
                // missing confidence
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 10,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      await expect(
        client.chatStructured({
          schema: testSchema,
          schemaName: 'TestResponse',
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('validation failed');
    });

    it('should throw if model does not support structured outputs', async () => {
      await expect(
        client.chatStructured({
          model: 'gpt-3.5-turbo',
          schema: testSchema,
          schemaName: 'TestResponse',
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('does not support structured outputs');
    });
  });

  describe('chatWithTools()', () => {
    const mockTools = [
      {
        type: 'function' as const,
        function: {
          name: 'get_weather',
          description: 'Get weather',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string' },
            },
          },
        },
      },
    ];

    const mockHandlers = {
      get_weather: vi.fn().mockResolvedValue({ temperature: 72, condition: 'sunny' }),
    };

    it('should execute tool and continue conversation', async () => {
      // First response: tool call
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call_1',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: JSON.stringify({ location: 'San Francisco' }),
                  },
                },
              ],
            },
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 20 },
      });

      // Second response: final answer
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'The weather in San Francisco is sunny and 72°F.',
            },
          },
        ],
        usage: { prompt_tokens: 80, completion_tokens: 15 },
      });

      const response = await client.chatWithTools({
        messages: [{ role: 'user', content: 'What is the weather?' }],
        tools: mockTools,
        toolHandlers: mockHandlers,
      });

      expect(response.text).toContain('sunny');
      expect(response.toolCalls).toHaveLength(1);
      expect(response.toolCalls[0].name).toBe('get_weather');
      expect(response.toolInvocations.get_weather).toBe(1);
      expect(mockHandlers.get_weather).toHaveBeenCalledWith({ location: 'San Francisco' });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should cap max tool calls', async () => {
      // Always return tool calls
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call_1',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: JSON.stringify({ location: 'Test' }),
                  },
                },
              ],
            },
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 20 },
      });

      const response = await client.chatWithTools({
        messages: [{ role: 'user', content: 'Test' }],
        tools: mockTools,
        toolHandlers: mockHandlers,
        maxToolCalls: 2,
      });

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(response.text).toContain('Max tool calls');
    });

    it('should throw if model does not support tools', async () => {
      await expect(
        client.chatWithTools({
          model: 'invalid-model',
          messages: [{ role: 'user', content: 'Test' }],
          tools: mockTools,
          toolHandlers: mockHandlers,
        })
      ).rejects.toThrow();
    });

    it('should track tool invocations', async () => {
      mockCreate
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    id: 'call_1',
                    type: 'function',
                    function: {
                      name: 'get_weather',
                      arguments: JSON.stringify({ location: 'SF' }),
                    },
                  },
                  {
                    id: 'call_2',
                    type: 'function',
                    function: {
                      name: 'get_weather',
                      arguments: JSON.stringify({ location: 'LA' }),
                    },
                  },
                ],
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 20 },
        })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Done',
              },
            },
          ],
          usage: { prompt_tokens: 80, completion_tokens: 10 },
        });

      const response = await client.chatWithTools({
        messages: [{ role: 'user', content: 'Test' }],
        tools: mockTools,
        toolHandlers: mockHandlers,
      });

      expect(response.toolInvocations.get_weather).toBe(2);
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after threshold failures', async () => {
      const clientWithLowThreshold = new OpenAIClient({
        circuitBreakerThreshold: 2,
        maxRetries: 1,
      });

      const error = new Error('Network error');
      mockCreate.mockRejectedValue(error);

      // First failure
      await expect(
        clientWithLowThreshold.chat({
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow();

      // Second failure
      await expect(
        clientWithLowThreshold.chat({
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow();

      // Circuit should be open now
      await expect(
        clientWithLowThreshold.chat({
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('Circuit breaker is open');
    });
  });
});

describe('Cost Calculation', () => {
  it('should calculate cost correctly for gpt-4o-mini', () => {
    const cost = getCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 1000,
      tokensOut: 500,
    });

    // 1000 * 0.015/1k + 500 * 0.06/1k = 0.015 + 0.03 = 0.045 cents
    // Rounded to 2 decimals: 0.05 (Math.round rounds 0.045 up to 0.05)
    expect(cost).toBe(0.05);
  });

  it('should calculate cost with cached inputs', () => {
    const cost = getCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 1000,
      tokensOut: 500,
      cachedInputTokens: 800,
    });

    // 200 regular * 0.015/1k + 800 cached * 0.0075/1k + 500 out * 0.06/1k
    // = 0.003 + 0.006 + 0.03 = 0.039 cents
    // Rounded to 2 decimals: 0.04
    expect(cost).toBe(0.04);
  });

  it('should handle zero tokens', () => {
    const cost = getCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 0,
      tokensOut: 0,
    });

    expect(cost).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    const cost = getCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 123,
      tokensOut: 456,
    });

    // Should be rounded to 2 decimals
    expect(cost.toString()).toMatch(/^\d+\.\d{0,2}$/);
  });
});
