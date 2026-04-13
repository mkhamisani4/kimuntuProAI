/**
 * AI Tools
 * Export all tool implementations and utilities
 */

// Web Search
export {
  webSearch,
  buildWebSearchTools,
  buildWebSearchToolSpec,
  resetWebSearch,
  type WebSearchOptions,
  type WebSearchResponse,
  type WebSearchResult,
} from './webSearch';

export {
  webSearchWithOpenAI,
  buildOpenAIWebSearchTools,
  buildOpenAIWebSearchToolSpec,
  resetWebSearchState,
} from './openaiWebSearch';

export {
  RateLimiter,
  TTLCache,
  normalizeQuery,
  buildCacheKey,
} from './rateLimitCache';

// Finance Tools
export {
  calcARPU,
  calcGrossMargin,
  calcCAC,
  calcLTV,
  calcPaybackMonths,
  buildFinancialModel,
  validateFinancialInputs,
} from './finance';

export {
  buildFinanceToolSpec,
  buildFinanceTools,
  getFinanceToolHandler,
} from './financeTool';
