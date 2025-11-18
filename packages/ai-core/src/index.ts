/**
 * @kimuntupro/ai-core
 * Core AI orchestration for KimuntuPro AI Assistant
 */

// Export LLM client and utilities
export {
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
  type OpenAIClientConfig,
} from './llm/client.js';

export {
  ClaudeClient,
  type ClaudeResponse,
  type ClaudeClientConfig,
} from './llm/claudeClient.js';

export {
  generateWebsite,
  editWebsite,
  type WebsiteGenerationResult,
} from './generators/websiteGenerator.js';

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
} from './llm/models.js';

export {
  getCostCents,
  estimateCostCents,
  formatCost,
  exceedsMaxCost,
  getModelPricing,
  type ModelPricing,
} from './llm/costs.js';

export {
  asJsonSchema,
  parseStructured,
  extractJsonFromMarkdown,
} from './llm/structured.js';

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
} from './tools/index.js';

// Export orchestration
export {
  plan,
  deriveHeuristics,
  validatePlannerInput,
} from './orchestration/planner.js';

export {
  getPlannerSystemPrompt,
  getPlannerDeveloperPrompt,
  buildPlannerUserMessage,
  PLANNER_SYSTEM_V1,
  PLANNER_DEVELOPER_V1,
} from './orchestration/prompts.js';

// Export executor
export {
  execute,
  validateExecuteOptions,
  type ExecuteOptions,
  type ExecuteResult,
} from './orchestration/executor.js';

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
} from './orchestration/answerFormatter.js';

// Export policy validation
export {
  validateOutput,
  validateCitations,
  validateFactualConsistency,
  validateFinancialMetrics,
  type PolicyValidationResult,
  type PolicyIssue,
} from './policy/validator.js';

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
} from './retrieval/index.js';
