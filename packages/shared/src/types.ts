/**
 * Shared TypeScript Types for KimuntuPro AI
 * Used across ai-core, Business Track UI, and API routes
 */

// ============================================================================
// ASSISTANT TYPES
// ============================================================================

/**
 * Available AI assistant types for Business Track
 * All assistants are integrated into /app/dashboard/business/ai-assistant/
 */
export type AssistantType =
  | 'streamlined_plan'
  | 'exec_summary'
  | 'financial_overview'
  | 'market_analysis';

/**
 * Request payload for AI assistant from Business Track UI
 * Sent to /app/api/ai/answer
 */
export interface AssistantRequest {
  assistant: AssistantType;
  input: string;
  tenantId: string;
  userId: string;
  extra?: Record<string, any>; // For #109 financial inputs, etc.
}

/**
 * Source citation for assistant response
 * Distinguishes RAG vs web search sources
 */
export interface AssistantSource {
  type: 'rag' | 'web';
  title?: string;
  url?: string;
  docId?: string;
  snippet: string;
}

/**
 * Response from AI assistant to Business Track UI
 */
export interface AssistantResponse {
  assistant: AssistantType;
  sections: Record<string, string>; // e.g., { "Problem": "...", "Solution": "..." }
  sources: AssistantSource[];
  rawModelOutput: string;
  metadata?: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    cost: number;
    toolInvocations?: {
      retrieval?: number;
      webSearch?: number;
      finance?: number;
    };
  };
}

// ============================================================================
// PLANNER TYPES (Stage A)
// ============================================================================

/**
 * Input to Stage A Planner
 */
export interface PlannerInput {
  assistant: AssistantType;
  input: string;
  tenantId: string;
  userId: string;
  extra?: Record<string, any>;
}

/**
 * Structured output from Stage A Planner
 * Used by executor to determine retrieval and tool usage
 */
export interface PlannerOutput {
  task: AssistantType;
  requires_retrieval: boolean;
  requires_web_search: boolean;
  query_terms: string[];
  sections: string[];
  metrics_needed: string[];
  escalate_model: boolean;
}

// ============================================================================
// USAGE LOGGING TYPES
// ============================================================================

/**
 * Tool invocation counts for a single request
 */
export interface ToolInvocations {
  retrieval: number;
  webSearch: number;
  finance: number;
}

/**
 * Usage metrics for cost tracking and metering
 * Logged to database after each assistant call
 */
export interface UsageMetric {
  model: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  latencyMs: number;
  toolInvocations: ToolInvocations;
}

/**
 * Complete usage log entry (matches database schema)
 */
export interface UsageLogEntry extends UsageMetric {
  id: string;
  tenantId: string;
  userId: string;
  assistantType: AssistantType | null;
  createdAt: Date;
}

/**
 * Quota check result
 */
export interface QuotaCheckResult {
  ok: boolean;
  reason?: string;
  resetsAtISO?: string;
  currentUsage?: {
    tokens: number;
    costCents: number;
  };
}

/**
 * Usage analytics summary
 */
export interface UsageAnalyticsSummary {
  assistant: string;
  calls: number;
  tokens: number;
  costCents: number;
}

/**
 * Quota error (thrown when quota exceeded)
 */
export class QuotaError extends Error {
  constructor(
    message: string,
    public resetsAtISO?: string,
    public currentUsage?: { tokens: number; costCents: number }
  ) {
    super(message);
    this.name = 'QuotaError';
  }
}

// ============================================================================
// WEB SEARCH TYPES
// ============================================================================

/**
 * Single web search result
 */
export interface WebSearchResultItem {
  title: string;
  snippet: string;
  url: string;
}

/**
 * Web search tool response
 * Normalized across providers (Tavily, SerpAPI, Bing, MCP)
 */
export interface WebSearchResult {
  query: string;
  results: WebSearchResultItem[];
}

/**
 * Web search provider configuration
 */
export type WebSearchProvider = 'tavily' | 'serpapi' | 'bing' | 'mcp';

export interface WebSearchConfig {
  provider: WebSearchProvider;
  apiKey: string;
  rateLimit: number;
  maxResults: number;
}

// ============================================================================
// FINANCE TOOL TYPES
// ============================================================================

/**
 * Unit economics calculations (legacy)
 * @deprecated Use BusinessTrackUnitEconomics for comprehensive metrics
 */
export interface UnitEconomics {
  grossMargin: number;
  contributionMargin: number;
  breakEvenUnits: number;
}

/**
 * Monthly financial projection (legacy)
 * @deprecated Use BusinessTrackProjection for comprehensive metrics
 */
export interface FinancialProjection {
  month: number;
  revenue: number;
  cogs: number;
  grossMargin: number;
}

/**
 * Complete financial model output (legacy)
 * @deprecated Use BusinessTrackFinancialModel for comprehensive metrics
 */
export interface FinancialModel {
  unitEconomics: UnitEconomics;
  projections: FinancialProjection[];
}

/**
 * Input for unit economics calculation (legacy)
 */
export interface UnitEconomicsInput {
  pricePerUnit: number;
  cogsPerUnit: number;
  fixedCosts: number;
}

/**
 * Input for revenue projection (legacy)
 */
export interface RevenueProjectionInput {
  initialRevenue: number;
  growthRate: number; // Monthly growth rate (e.g., 0.1 = 10%)
  months: number;
  cogsPercentage: number; // COGS as % of revenue
}

// ============================================================================
// BUSINESS TRACK FINANCE TYPES (Step 6)
// ============================================================================

/**
 * Comprehensive unit economics for Business Track
 */
export interface BusinessTrackUnitEconomics {
  arpuMonthly: number;
  grossMarginPct: number;
  cac: number;
  ltv: number;
  paybackMonths: number | 'Infinity';
  ltvCacRatio?: number;
}

/**
 * Monthly projection row for Business Track
 */
export interface BusinessTrackProjection {
  month: number;
  customersEnd: number;
  newCustomers: number;
  churnedCustomers: number;
  revenue: number;
  cogs: number;
  grossMargin: number;
  grossMarginPct: number;
  cac: number;
}

/**
 * Complete Business Track financial model output
 */
export interface BusinessTrackFinancialModel {
  unitEconomics: BusinessTrackUnitEconomics;
  projections: BusinessTrackProjection[];
  assumptions: Record<string, string | number>;
}

/**
 * Financial inputs for Business Track model
 */
export interface FinancialInputs {
  // Pricing & costs
  arpuMonthly?: number;
  acv?: number;
  cogsPct: number;
  variableCostPerUser?: number;

  // Funnel & growth
  startingCustomers: number;
  newCustomersPerMonth: number;
  churnRateMonthly: number;
  expansionPctMonthly?: number;

  // Sales/marketing & CAC
  salesMarketingSpendMonthly: number;
  customersAcquiredPerMonth?: number;
  assumedCAC?: number;

  // Horizon
  months: number;
}

// ============================================================================
// RETRIEVAL (RAG) TYPES
// ============================================================================

/**
 * Retrieved chunk from vector/BM25 search
 */
export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  content: string;
  score: number;
  metadata?: {
    title?: string;
    url?: string;
    tags?: string[];
  };
}

/**
 * Retrieval request parameters
 */
export interface RetrievalRequest {
  query: string;
  tenantId: string;
  topK?: number;
  minScore?: number;
}

/**
 * Retrieval response
 */
export interface RetrievalResult {
  chunks: RetrievedChunk[];
  totalTokens: number;
}

// ============================================================================
// FEATURE FLAG TYPES
// ============================================================================

/**
 * Feature flag names
 */
export type FeatureFlagName =
  | 'ai_assistant_enabled'
  | 'streamlined_plan_enabled'
  | 'exec_summary_enabled'
  | 'market_analysis_enabled';

/**
 * Feature flag entry
 */
export interface FeatureFlag {
  flagName: FeatureFlagName;
  enabled: boolean;
  tenantId: string | null; // null = global
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * API error response
 */
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

/**
 * Error codes
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  INVALID_INPUT = 'INVALID_INPUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  LLM_ERROR = 'LLM_ERROR',
}

// ============================================================================
// WEBSITE BUILDER TYPES
// ============================================================================

/**
 * Wizard input data structure (6 steps)
 */
export interface WizardInput {
  // Step 1: Brand Basics
  companyName?: string | 'ai_choose';
  tagline?: string | 'ai_fill';
  brandVoice?: 'professional' | 'casual' | 'luxury' | 'playful' | 'friendly' | 'ai_choose';
  logoUrl?: string | null;

  // Step 2: Business Overview
  shortDescription?: string | 'ai_fill';
  aboutUs?: string | 'ai_fill';
  industry?: string | 'ai_fill';
  keyServices?: string[] | 'ai_fill';

  // Step 3: Hero & CTA
  heroHeadline?: string | 'ai_fill';
  heroSubheadline?: string | 'ai_fill';
  primaryCtaText?: string | 'ai_fill';
  mainGoal?: 'consult' | 'buy' | 'signup' | 'contact' | 'learn_more' | 'ai_choose';

  // Step 4: Sections & Layout
  sectionsMode?: 'manual' | 'ai_choose'; // Controls whether user manually selects sections or AI chooses
  enabledSections: {
    features: boolean;
    services: boolean;
    about: boolean;
    testimonials: boolean;
    pricing: boolean;
    faq: boolean;
    contact: boolean;
  };
  layoutStyle?: 'minimal' | 'modern' | 'bold' | 'playful' | 'ai_choose';

  // Step 5: Contact & Social
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };

  // Step 6: Visual Style
  colorTheme?: string;
  fontStyle?: string;
}

/**
 * Generated site specification (internal structured representation)
 */
export interface SiteSpec {
  meta: {
    title: string;
    description: string;
  };

  branding: {
    companyName: string;
    tagline: string;
    logoUrl: string | null;
    brandVoice: string;
  };

  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaAction: string;
  };

  sections: SiteSection[];

  contact: {
    email?: string;
    phone?: string;
    location?: string;
  };

  social: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };

  styling: {
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fontFamily: {
      heading: string;
      body: string;
    };
  };
}

/**
 * Individual website section
 */
export interface SiteSection {
  id: string;
  title: string;
  content: Record<string, any>;
  order: number;
}

/**
 * Website generation request payload
 */
export interface WebsiteGenerationRequest {
  tenantId: string;
  userId: string;
  businessPlanId?: string | null;
  wizardInput: WizardInput;
}

/**
 * Website generation response
 */
export interface WebsiteGenerationResponse {
  success: true;
  websiteId: string;
  status: 'generating' | 'ready' | 'failed';
  message: string;
}

// ============================================================================
// LOGO GENERATOR TYPES
// ============================================================================

/**
 * Logo design brief generated by LLM
 * Captures brand personality and design direction
 */
export interface LogoDesignBrief {
  // Brand attributes
  brandAdjectives: string[]; // e.g., ["modern", "trustworthy", "innovative"]
  brandPersonality: string; // e.g., "Professional yet approachable"

  // Visual direction
  logoType: 'wordmark' | 'lettermark' | 'icon' | 'combination';
  iconConcepts: string[]; // e.g., ["abstract geometric", "mountain peak", "shield"]

  // Color palette (hex codes)
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };

  // Typography suggestions (SYSTEM FONTS ONLY)
  fontSuggestions: {
    heading: 'Arial' | 'Times New Roman' | 'Courier New' | 'Helvetica' | 'Georgia' | 'Verdana' | 'Tahoma' | 'Trebuchet MS';
    tagline?: 'Arial' | 'Times New Roman' | 'Courier New' | 'Helvetica' | 'Georgia' | 'Verdana' | 'Tahoma' | 'Trebuchet MS';
  };

  // Reasoning
  rationale: string; // Why these design choices fit the business
}

/**
 * Single primitive shape in a logo
 * DECISION: Support <path> but keep prompts simple to avoid complexity
 */
export type LogoShape =
  | { type: 'rectangle'; x: number; y: number; width: number; height: number; fill: string; rx?: number }
  | { type: 'circle'; cx: number; cy: number; r: number; fill: string }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number }
  | { type: 'polygon'; points: string; fill: string } // e.g., "0,0 50,50 100,0" for triangle
  | { type: 'path'; d: string; fill: string; stroke?: string; strokeWidth?: number }; // Simple SVG paths only

/**
 * Text element in a logo
 * DECISION: System fonts only for maximum portability
 */
export interface LogoText {
  content: string; // The actual text (company name, tagline, etc.)
  x: number;
  y: number;
  fontSize: number;
  fontFamily: 'Arial' | 'Times New Roman' | 'Courier New' | 'Helvetica' | 'Georgia' | 'Verdana' | 'Tahoma' | 'Trebuchet MS';
  fontWeight: 400 | 700 | 'normal' | 'bold';
  fill: string; // Text color (hex)
  textAnchor?: 'start' | 'middle' | 'end';
  letterSpacing?: number;
}

/**
 * Complete logo specification (JSON structure for SVG rendering)
 * DECISION: Fixed canvas size 500x500
 */
export interface LogoSpec {
  version: '1.0'; // Schema version for future compatibility

  // Canvas metadata (FIXED SIZE)
  canvas: {
    width: 500; // Fixed
    height: 500; // Fixed
    backgroundColor: string; // hex color or 'transparent'
  };

  // Logo elements (render in order)
  shapes: LogoShape[];
  texts: LogoText[];

  // Metadata
  metadata: {
    conceptName: string; // e.g., "Concept 1: Mountain Shield"
    description: string; // Short description of the concept
    generatedAt: Date;
  };
}

/**
 * Logo version history entry
 * Represents a saved snapshot of a logo at a specific point in time
 */
export interface LogoVersion {
  versionId: string; // Unique ID for this version (timestamp-based)
  spec: LogoSpec; // The logo spec at this point in time
  label?: string; // Optional user-provided label (e.g., "Final draft", "Client feedback")
  savedAt: Date;
}

/**
 * Logo document persisted in Firestore
 * DECISION: Primary logo enforcement (only one isPrimary=true per user)
 */
export interface LogoDocument {
  id?: string;
  tenantId: string;
  userId: string;

  // Business relationship
  // DECISION: Fetch from assistant_results collection
  businessPlanId: string | null; // Reference to assistant_results doc (streamlined_plan)
  companyName: string;

  // Design process
  brief: LogoDesignBrief;
  concepts: LogoSpec[]; // 2-3 concepts generated by LLM

  // User's working version
  currentSpec: LogoSpec; // The spec currently loaded in editor
  isPrimary: boolean; // Only one logo per user can be primary

  // Version history (Phase 3 Feature 4)
  versions?: LogoVersion[]; // Array of saved versions (most recent first)

  // Generation metadata
  generationMetadata: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
    generatedAt: Date;
  } | null;

  createdAt?: Date;
  updatedAt?: Date;
}
