/**
 * LLM Model Configuration
 * Defines model capabilities, token limits, and default settings
 */
/**
 * Model configurations by ID
 */
export const MODEL_CONFIGS = {
    'gpt-4o-mini': {
        id: 'gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        maxInputTokens: 120000,
        maxOutputTokens: 16384,
        capabilities: {
            supportsTools: true,
            supportsStructured: true,
            supportsCaching: true,
            supportsVision: false,
        },
        defaultTemperature: 0.7,
        contextWindow: 128000,
    },
    'gpt-4o': {
        id: 'gpt-4o',
        displayName: 'GPT-4o',
        maxInputTokens: 120000,
        maxOutputTokens: 16384,
        capabilities: {
            supportsTools: true,
            supportsStructured: true,
            supportsCaching: true,
            supportsVision: true,
        },
        defaultTemperature: 0.7,
        contextWindow: 128000,
    },
    'gpt-4o-2024-08-06': {
        id: 'gpt-4o-2024-08-06',
        displayName: 'GPT-4o (2024-08-06)',
        maxInputTokens: 120000,
        maxOutputTokens: 16384,
        capabilities: {
            supportsTools: true,
            supportsStructured: true,
            supportsCaching: true,
            supportsVision: true,
        },
        defaultTemperature: 0.7,
        contextWindow: 128000,
    },
    'gpt-4-turbo': {
        id: 'gpt-4-turbo',
        displayName: 'GPT-4 Turbo',
        maxInputTokens: 120000,
        maxOutputTokens: 4096,
        capabilities: {
            supportsTools: true,
            supportsStructured: false,
            supportsCaching: false,
            supportsVision: true,
        },
        defaultTemperature: 0.7,
        contextWindow: 128000,
    },
    'gpt-3.5-turbo': {
        id: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        maxInputTokens: 16000,
        maxOutputTokens: 4096,
        capabilities: {
            supportsTools: true,
            supportsStructured: false,
            supportsCaching: false,
            supportsVision: false,
        },
        defaultTemperature: 0.7,
        contextWindow: 16385,
    },
};
/**
 * Default model for mini/cheap operations
 */
export const DEFAULT_MODEL_MINI = 'gpt-4o-mini';
/**
 * Default model for escalation/complex operations
 */
export const DEFAULT_MODEL_ESCALATION = 'gpt-4o';
/**
 * Get model configuration by ID
 * @param modelId - Model identifier
 * @returns Model configuration
 * @throws Error if model not found
 */
export function getModelConfig(modelId) {
    const config = MODEL_CONFIGS[modelId];
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
export function modelSupports(modelId, capability) {
    try {
        const config = getModelConfig(modelId);
        return config.capabilities[capability];
    }
    catch {
        return false;
    }
}
/**
 * Get model ID from environment or use default
 * @param envKey - Environment variable key (MODEL_MINI or MODEL_ESCALATION)
 * @param defaultModel - Fallback model
 * @returns Model ID
 */
export function getModelFromEnv(envKey, defaultModel) {
    const envValue = process.env[envKey];
    if (!envValue) {
        return defaultModel;
    }
    // Validate that env model exists in config
    if (MODEL_CONFIGS[envValue]) {
        return envValue;
    }
    console.warn(`Invalid model in ${envKey}: ${envValue}, using default: ${defaultModel}`);
    return defaultModel;
}
//# sourceMappingURL=models.js.map