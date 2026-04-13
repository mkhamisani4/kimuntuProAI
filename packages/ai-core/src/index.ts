/**
 * @kimuntupro/ai-core
 * Core AI orchestration for KimuntuPro AI Assistant
 */

// Export LLM client and utilities
export {
  AnthropicClient,
  OpenAIClient,
  type ChatMessage,
  type ChatResponse,
  type StructuredChatResponse,
  type ToolCallResult,
  type ChatWithToolsResponse,
  type ToolSpec,
  type ToolHandler,
  type UsageCallback,
  type Logger,
  type AnthropicClientConfig,
  type OpenAIClientConfig,
} from './llm/client';

export {
  ClaudeClient,
  type ClaudeResponse,
  type ClaudeClientConfig,
} from './llm/claudeClient';

export {
  generateWebsite,
  editWebsite,
  type WebsiteGenerationResult,
} from './generators/websiteGenerator';

export {
  generateLogoBrief,
  generateLogoConcepts,
  refineLogo,
  generateLogoVariations,
} from './generators/logoGenerator';

export {
  type ModelId,
  type ModelCapabilities,
  type ModelConfig,
  MODEL_CONFIGS,
  DEFAULT_MODEL_MINI,
  DEFAULT_MODEL_ESCALATION,
  getModelConfig,
  modelSupports,
  getModelFromEnv,
} from './llm/models';

export {
  getCostCents,
  estimateCostCents,
  formatCost,
  exceedsMaxCost,
  getModelPricing,
  type ModelPricing,
} from './llm/costs';

export {
  asJsonSchema,
  parseStructured,
  extractJsonFromMarkdown,
  buildStructuredPromptInstructions,
} from './llm/structured';

// Export tools
export {
  // Web Search
  webSearch,
  buildWebSearchTools,
  buildWebSearchToolSpec,
  resetWebSearch,
  type WebSearchOptions,
  type WebSearchResponse,
  type WebSearchResult,
  webSearchWithOpenAI,
  buildOpenAIWebSearchTools,
  buildOpenAIWebSearchToolSpec,
  RateLimiter,
  TTLCache,
  normalizeQuery,
  buildCacheKey,
  // Finance Tools
  calcARPU,
  calcGrossMargin,
  calcCAC,
  calcLTV,
  calcPaybackMonths,
  buildFinancialModel,
  validateFinancialInputs,
  buildFinanceToolSpec,
  buildFinanceTools,
  getFinanceToolHandler,
} from './tools';

// Export orchestration
export {
  plan,
  deriveHeuristics,
  validatePlannerInput,
} from './orchestration/planner';

export {
  getPlannerSystemPrompt,
  getPlannerDeveloperPrompt,
  buildPlannerUserMessage,
  PLANNER_SYSTEM_V1,
  PLANNER_DEVELOPER_V1,
} from './orchestration/prompts';

// Export executor
export {
  execute,
  validateExecuteOptions,
  type ExecuteOptions,
  type ExecuteResult,
} from './orchestration/executor';

export {
  buildExecutorSystemPrompt,
  buildExecutorDeveloperPrompt,
  buildExecutorUserMessage,
  buildExecutorMessages,
  parseSections,
  extractCitationMarkers,
  buildRAGSources,
  buildWebSources,
  mapCitationsToSources,
  parseExecutorResponse,
  validateSections,
  type ExecutorContext,
  type ParsedExecutorResponse,
} from './orchestration/answerFormatter';

// Export policy validation
export {
  validateOutput,
  validateCitations,
  validateFactualConsistency,
  validateFinancialMetrics,
  type PolicyValidationResult,
  type PolicyIssue,
} from './policy/validator';

// Export retrieval system
export {
  // Context packing
  estimateTokens,
  packContext,
  buildCitation,
  validateChunks,
  type RetrievedChunk,
  type PackedContext,
  type Citation,
  // Reranking
  fuseRRF,
  fuseWeighted,
  deduplicateChunks,
  applyScoreThreshold,
  truncateTopK,
  normalizeScores,
  rerankPipeline,
  type SearchResult,
  type RRFConfig,
  DEFAULT_RRF_CONFIG,
  // Hybrid retrieval
  retrieveHybrid,
  retrieveVectorOnly,
  validateRetrievalOptions,
  type HybridRetrievalOptions,
  type HybridRetrievalResult,
  type BM25QueryFn,
  type VectorQueryFn,
  type EmbeddingFn,
} from './retrieval';
