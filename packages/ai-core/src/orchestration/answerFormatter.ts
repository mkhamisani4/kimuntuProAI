/**
 * Answer Formatter for Business Track Executor
 * Handles message assembly and response parsing with citations
 */

import type {
  AssistantRequest,
  AssistantSource,
  PlannerOutput,
} from '@kimuntupro/shared';
import type { RetrievedChunk, PackedContext } from '../retrieval/context.js';
import type { WebSearchResult } from '../tools/openaiWebSearch.js';
import type { ChatMessage } from '../llm/client.js';
import type { BusinessTrackFinancialModel } from '@kimuntupro/shared';

/**
 * Context prepared for executor
 */
export interface ExecutorContext {
  ragContext?: PackedContext;
  webSearchResults?: WebSearchResult[];
  financeModel?: BusinessTrackFinancialModel;
}

/**
 * Parsed executor response with sections and citations
 */
export interface ParsedExecutorResponse {
  sections: Record<string, string>;
  sources: AssistantSource[];
  rawOutput: string;
}

/**
 * Build system prompt for executor
 *
 * @returns System prompt
 */
export function buildExecutorSystemPrompt(): string {
  return `You are the Business Track Executor for KimuntuPro AI Assistant.

Your role is to generate comprehensive business documents with accurate information and proper citations.

CRITICAL RULES:
1. Produce ONLY the sections requested by the Planner
2. Use markdown headings (##) for each section with EXACT names as specified (no abbreviations)
3. Be concise and actionable - aim for clarity over verbosity
4. ALWAYS cite sources using bracketed numbers: [R1] for RAG sources, [W1] for web sources
5. NEVER fabricate numbers or financial metrics - use provided FINANCE_JSON or request calculations
6. Include a "## Sources" section at the end listing all citations
7. When using financial data, cite where the numbers came from (assumptions, calculations, or sources)
8. Do NOT abbreviate section names (e.g., use "Ideal Customer Profile" not "ICP")

CITATION FORMAT:
- RAG sources (internal documents): [R1], [R2], etc.
- Web sources (external): [W1], [W2], etc.
- Always provide context when citing: "According to [R1], the market size is..."
- ONLY use citation markers that correspond to available sources (do not exceed the count provided)

STYLE GUIDE:
- Use bullet points for lists
- Include specific numbers and metrics when available
- Highlight key risks and assumptions
- Be realistic about challenges - avoid overselling
- Focus on actionable insights over generic advice`;
}

/**
 * Build developer prompt with section requirements
 *
 * @param plan - Planner output
 * @returns Developer prompt
 */
export function buildExecutorDeveloperPrompt(plan: PlannerOutput): string {
  const sectionList = plan.sections.map((s) => `- ${s}`).join('\n');
  const sectionNamesOnly = plan.sections.map((s) => `"${s}"`).join(', ');

  return `REQUIRED SECTIONS (in order):
${sectionList}

CRITICAL: You MUST use these EXACT section names as headings. Do NOT abbreviate or paraphrase.
For example:
- Use "## Ideal Customer Profile" NOT "## ICP" or "## Customer Profile"
- Use "## Go-To-Market Strategy" NOT "## GTM Strategy" or "## Market Strategy"
- Use "## Key Performance Indicators" NOT "## KPIs" or "## Metrics"

Expected section headings: ${sectionNamesOnly}

FORMATTING RULES:
- Use ## for section headings (markdown level 2)
- Each section should be 2-4 paragraphs (unless it requires more detail)
- The "Sources" section must list all [R#] and [W#] citations used
- Section names must match EXACTLY as listed above

CONTENT REQUIREMENTS:
${plan.metrics_needed.length > 0 ? `- Include financial metrics: ${plan.metrics_needed.join(', ')}` : ''}
${plan.requires_retrieval ? '- Prioritize information from RAG_CONTEXT (internal sources)' : ''}
${plan.requires_web_search ? '- Include current market data from WEB_CONTEXT' : ''}
- All claims must be cited or clearly marked as assumptions
- Provide specific, actionable recommendations`;
}

/**
 * Build user message with all context
 *
 * @param request - Original request
 * @param plan - Planner output
 * @param context - Prepared context (RAG, web, finance)
 * @returns User message
 */
export function buildExecutorUserMessage(
  request: AssistantRequest,
  plan: PlannerOutput,
  context: ExecutorContext
): string {
  const parts: string[] = [];

  // Request JSON
  parts.push('=== REQUEST ===');
  parts.push(JSON.stringify({
    assistant: request.assistant,
    input: request.input,
    extra: request.extra || {},
  }, null, 2));
  parts.push('');

  // Planner output
  parts.push('=== PLANNER OUTPUT ===');
  parts.push(JSON.stringify({
    sections: plan.sections,
    query_terms: plan.query_terms,
    metrics_needed: plan.metrics_needed,
  }, null, 2));
  parts.push('');

  // RAG context
  if (context.ragContext && context.ragContext.context.length > 0) {
    const ragSourceCount = context.ragContext.citations?.length || 0;
    parts.push('=== RAG_CONTEXT (Internal Sources) ===');
    parts.push(context.ragContext.context);
    parts.push('');
    if (ragSourceCount > 0) {
      const ragMarkers = Array.from({ length: ragSourceCount }, (_, i) => `[R${i + 1}]`).join(', ');
      parts.push(`IMPORTANT: You have ${ragSourceCount} RAG source(s) available: ${ragMarkers}`);
      parts.push('Do NOT use citation markers beyond this range (e.g., do NOT use [R${ragSourceCount + 1}] or higher).');
    } else {
      parts.push('When referencing RAG sources, use [R1], [R2], etc. based on the citation numbers above.');
    }
    parts.push('');
  } else {
    parts.push('=== RAG_CONTEXT ===');
    parts.push('No internal documents available. Do NOT use [R#] citations.');
    parts.push('');
  }

  // Web search results
  if (context.webSearchResults && context.webSearchResults.length > 0) {
    const webSourceCount = context.webSearchResults.length;
    parts.push('=== WEB_CONTEXT (External Sources) ===');
    context.webSearchResults.forEach((result, idx) => {
      parts.push(`[W${idx + 1}] ${result.title}`);
      parts.push(`URL: ${result.url}`);
      parts.push(`Snippet: ${result.snippet}`);
      parts.push('');
    });
    const webMarkers = Array.from({ length: webSourceCount }, (_, i) => `[W${i + 1}]`).join(', ');
    parts.push(`IMPORTANT: You have ${webSourceCount} web source(s) available: ${webMarkers}`);
    parts.push(`Do NOT use citation markers beyond this range (e.g., do NOT use [W${webSourceCount + 1}] or higher).`);
    parts.push('');
  } else if (plan.requires_web_search) {
    parts.push('=== WEB_CONTEXT ===');
    parts.push('No web search results available. Use general knowledge but mark as assumptions.');
    parts.push('Do NOT use [W#] citations.');
    parts.push('');
  }

  // Finance model
  if (context.financeModel) {
    parts.push('=== FINANCE_JSON (Pre-computed Metrics) ===');
    parts.push(JSON.stringify(context.financeModel, null, 2));
    parts.push('');
    parts.push('Use these numbers in your financial sections. You may also call finance_calc tool for variations.');
    parts.push('');
  }

  // Instructions
  parts.push('=== INSTRUCTIONS ===');
  parts.push(`Generate a complete ${request.assistant} document with the sections listed above.`);
  parts.push('');
  parts.push('Remember:');
  parts.push('- Use ## for section headings');
  parts.push('- Cite all sources with [R#] or [W#]');
  parts.push('- Include a "## Sources" section at the end');
  parts.push('- Be specific and actionable');
  parts.push('- Never invent numbers - use FINANCE_JSON or call finance_calc');

  return parts.join('\n');
}

/**
 * Build complete message array for executor
 *
 * @param request - Original request
 * @param plan - Planner output
 * @param context - Prepared context
 * @returns Message array
 */
export function buildExecutorMessages(
  request: AssistantRequest,
  plan: PlannerOutput,
  context: ExecutorContext
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: buildExecutorSystemPrompt(),
    },
    {
      role: 'developer',
      content: buildExecutorDeveloperPrompt(plan),
    },
    {
      role: 'user',
      content: buildExecutorUserMessage(request, plan, context),
    },
  ];
}

/**
 * Parse executor response into sections
 * Extracts markdown sections using ## headings
 *
 * @param rawOutput - Raw model output
 * @returns Parsed sections
 */
export function parseSections(rawOutput: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Split by ## headings
  const lines = rawOutput.split('\n');
  let currentSection: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    // Check for section heading (## Section Name)
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      // Start new section
      currentSection = headingMatch[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Extract citation markers from text
 * Finds all [R1], [W2], etc. patterns
 *
 * @param text - Text to search
 * @returns Array of citation markers
 */
export function extractCitationMarkers(text: string): string[] {
  const markers = text.match(/\[([RW]\d+)\]/g) || [];
  return [...new Set(markers.map((m) => m.slice(1, -1)))]; // Remove brackets and dedupe
}

/**
 * Build source objects from RAG chunks
 *
 * @param chunks - Retrieved chunks
 * @returns AssistantSource array
 */
export function buildRAGSources(chunks: RetrievedChunk[]): AssistantSource[] {
  return chunks.map((chunk) => ({
    type: 'rag' as const,
    title: chunk.metadata.document_name,
    docId: chunk.metadata.document_id,
    snippet: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
  }));
}

/**
 * Build source objects from web search results
 *
 * @param results - Web search results
 * @returns AssistantSource array
 */
export function buildWebSources(results: WebSearchResult[]): AssistantSource[] {
  return results.map((result) => ({
    type: 'web' as const,
    title: result.title,
    url: result.url,
    snippet: result.snippet,
  }));
}

/**
 * Map citation markers to actual sources
 * Returns only the sources that were actually cited
 *
 * @param rawOutput - Raw model output
 * @param ragSources - Available RAG sources
 * @param webSources - Available web sources
 * @returns Used sources in order
 */
export function mapCitationsToSources(
  rawOutput: string,
  ragSources: AssistantSource[],
  webSources: AssistantSource[]
): AssistantSource[] {
  const markers = extractCitationMarkers(rawOutput);
  const usedSources: AssistantSource[] = [];
  const seen = new Set<string>();

  for (const marker of markers) {
    const type = marker[0]; // 'R' or 'W'
    const index = parseInt(marker.slice(1), 10) - 1; // Convert to 0-indexed

    let source: AssistantSource | undefined;

    if (type === 'R' && index >= 0 && index < ragSources.length) {
      source = ragSources[index];
    } else if (type === 'W' && index >= 0 && index < webSources.length) {
      source = webSources[index];
    }

    if (source) {
      // Deduplicate by creating a unique key
      const key = `${source.type}:${source.title || source.url || ''}`;
      if (!seen.has(key)) {
        usedSources.push(source);
        seen.add(key);
      }
    }
  }

  return usedSources;
}

/**
 * Parse executor response with full citation mapping
 *
 * @param rawOutput - Raw model output
 * @param context - Executor context
 * @returns Parsed response
 */
export function parseExecutorResponse(
  rawOutput: string,
  context: ExecutorContext
): ParsedExecutorResponse {
  // Parse sections
  const sections = parseSections(rawOutput);

  // Build source arrays
  const ragSources = context.ragContext?.citations
    ? context.ragContext.citations.map((c) => ({
        type: 'rag' as const,
        title: c.source,
        snippet: c.excerpt || '',
        docId: undefined,
      }))
    : [];

  const webSources = context.webSearchResults
    ? buildWebSources(context.webSearchResults)
    : [];

  // Map citations to sources
  const sources = mapCitationsToSources(rawOutput, ragSources, webSources);

  return {
    sections,
    sources,
    rawOutput,
  };
}

/**
 * Validate that all required sections are present
 *
 * @param sections - Parsed sections
 * @param requiredSections - Required section names
 * @returns Validation result
 */
export function validateSections(
  sections: Record<string, string>,
  requiredSections: string[]
): { valid: boolean; missing: string[] } {
  const sectionNames = Object.keys(sections);
  const missing: string[] = [];

  for (const required of requiredSections) {
    // Case-insensitive match
    const found = sectionNames.some(
      (name) => name.toLowerCase() === required.toLowerCase()
    );

    if (!found) {
      missing.push(required);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
