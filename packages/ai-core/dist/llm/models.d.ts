/**
 * LLM Model Configuration
 * Defines model capabilities, token limits, and default settings
 */
/**
 * Supported model IDs
 */
export type ModelId = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4o-2024-08-06' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
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
export declare const MODEL_CONFIGS: Record<ModelId, ModelConfig>;
/**
 * Default model for mini/cheap operations
 */
export declare const DEFAULT_MODEL_MINI: ModelId;
/**
 * Default model for escalation/complex operations
 */
export declare const DEFAULT_MODEL_ESCALATION: ModelId;
/**
 * Get model configuration by ID
 * @param modelId - Model identifier
 * @returns Model configuration
 * @throws Error if model not found
 */
export declare function getModelConfig(modelId: string): ModelConfig;
/**
 * Check if model supports a specific capability
 * @param modelId - Model identifier
 * @param capability - Capability to check
 * @returns True if supported
 */
export declare function modelSupports(modelId: string, capability: keyof ModelCapabilities): boolean;
/**
 * Get model ID from environment or use default
 * @param envKey - Environment variable key (MODEL_MINI or MODEL_ESCALATION)
 * @param defaultModel - Fallback model
 * @returns Model ID
 */
export declare function getModelFromEnv(envKey: 'MODEL_MINI' | 'MODEL_ESCALATION', defaultModel: ModelId): ModelId;
//# sourceMappingURL=models.d.ts.map