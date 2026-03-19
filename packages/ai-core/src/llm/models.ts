/**
 * LLM Model Configuration
 * Defines model capabilities, token limits, and default settings
 * Anthropic Claude models
 */

/**
 * Supported model IDs
 */
export type ModelId = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-5-20250929' | 'claude-opus-4-20250514';

/**
 * Model capability flags
 */
export interface ModelCapabilities {
  supportsTools: boolean;
  supportsStructured: boolean;
  supportsCaching: boolean;
  supportsVision: boolean;
}

/**
 * Model configuration
 */
export interface ModelConfig {
  id: ModelId;
  displayName: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  capabilities: ModelCapabilities;
  defaultTemperature: number;
  contextWindow: number;
}

/**
 * Model configurations by ID
 */
export const MODEL_CONFIGS: Record<ModelId, ModelConfig> = {
  'claude-haiku-4-5-20251001': {
    id: 'claude-haiku-4-5-20251001',
    displayName: 'Claude Haiku 4.5',
    maxInputTokens: 200000,
    maxOutputTokens: 8192,
    capabilities: {
      supportsTools: true,
      supportsStructured: true,
      supportsCaching: true,
      supportsVision: true,
    },
    defaultTemperature: 0.7,
    contextWindow: 200000,
  },
  'claude-sonnet-4-5-20250929': {
    id: 'claude-sonnet-4-5-20250929',
    displayName: 'Claude Sonnet 4.5',
    maxInputTokens: 200000,
    maxOutputTokens: 16384,
    capabilities: {
      supportsTools: true,
      supportsStructured: true,
      supportsCaching: true,
      supportsVision: true,
    },
    defaultTemperature: 0.7,
    contextWindow: 200000,
  },
  'claude-opus-4-20250514': {
    id: 'claude-opus-4-20250514',
    displayName: 'Claude Opus 4',
    maxInputTokens: 200000,
    maxOutputTokens: 32768,
    capabilities: {
      supportsTools: true,
      supportsStructured: true,
      supportsCaching: true,
      supportsVision: true,
    },
    defaultTemperature: 0.7,
    contextWindow: 200000,
  },
};

/**
 * Default model for mini/cheap operations
 */
export const DEFAULT_MODEL_MINI: ModelId = 'claude-haiku-4-5-20251001';

/**
 * Default model for escalation/complex operations
 */
export const DEFAULT_MODEL_ESCALATION: ModelId = 'claude-sonnet-4-5-20250929';

/**
 * Get model configuration by ID
 * @param modelId - Model identifier
 * @returns Model configuration
 * @throws Error if model not found
 */
export function getModelConfig(modelId: string): ModelConfig {
  const config = MODEL_CONFIGS[modelId as ModelId];
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return config;
}

/**
 * Check if model supports a specific capability
 * @param modelId - Model identifier
 * @param capability - Capability to check
 * @returns True if supported
 */
export function modelSupports(
  modelId: string,
  capability: keyof ModelCapabilities
): boolean {
  try {
    const config = getModelConfig(modelId);
    return config.capabilities[capability];
  } catch {
    return false;
  }
}

/**
 * Get model ID from environment or use default
 * @param envKey - Environment variable key (MODEL_MINI or MODEL_ESCALATION)
 * @param defaultModel - Fallback model
 * @returns Model ID
 */
export function getModelFromEnv(
  envKey: 'MODEL_MINI' | 'MODEL_ESCALATION',
  defaultModel: ModelId
): ModelId {
  const envValue = process.env[envKey];
  if (!envValue) {
    return defaultModel;
  }

  // Validate that env model exists in config
  if (MODEL_CONFIGS[envValue as ModelId]) {
    return envValue as ModelId;
  }

  console.warn(`Invalid model in ${envKey}: ${envValue}, using default: ${defaultModel}`);
  return defaultModel;
}
