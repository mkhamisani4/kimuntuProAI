/**
 * Policy Validation for Business Track AI Assistant
 * Main orchestrator for all validation checks
 */

import type { AssistantResponse, AssistantSource, AssistantType } from '@kimuntupro/shared';
import type { ExecutorContext } from '../orchestration/answerFormatter.js';
import {
  validateCitations as validateCitationsInternal,
  findSection,
  type ValidationIssue,
} from './citations.js';
import { validateNumbers } from './numbers.js';
import { validateSourcesForInjection, stripInjection } from './injection.js';
import { buildDisclaimer } from './disclaimers.js';

/**
 * Policy validation result
 */
export interface PolicyValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  appendedDisclaimer?: string;
}

/**
 * Policy issue (re-export)
 */
export type PolicyIssue = ValidationIssue;

/**
 * Load policy configuration from environment
 */
function loadPolicyConfig(): {
  recentMonths: number;
  requireSources: boolean;
  strictNumbers: boolean;
  blockPII: boolean;
} {
  return {
    recentMonths: Number(process.env.POLICY_RECENT_MONTHS ?? 9),
    requireSources: process.env.POLICY_REQUIRE_SOURCES !== 'false',
    strictNumbers: process.env.POLICY_STRICT_NUMBERS !== 'false',
    blockPII: process.env.POLICY_BLOCK_PII_IN_OUTPUT !== 'false',
  };
}

/**
 * Validate recency of web sources for current claims
 *
 * @param response - Assistant response
 * @param webSources - Web sources
 * @param requiresWebSearch - Whether web search was used
 * @param recentMonths - Recency requirement in months
 * @returns Validation issues
 */
function validateRecency(
  response: AssistantResponse,
  webSources: AssistantSource[],
  requiresWebSearch: boolean,
  recentMonths: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!requiresWebSearch || webSources.length === 0) {
    return issues;
  }

  const text = response.rawModelOutput.toLowerCase();

  // Detect current/recent claims
  const recencyPatterns = [
    /\bcurrent\b/,
    /\bnow\b/,
    /\blatest\b/,
    /\brecent\b/,
    /\btrends?\b/,
    /202[0-9]/,  // Year references
  ];

  const hasRecencyClaim = recencyPatterns.some((pattern) => pattern.test(text));

  if (hasRecencyClaim) {
    // Check if we have any recent sources
    // Note: AssistantSource doesn't have publishedAt yet
    // This is a placeholder for future enhancement when we add date tracking

    issues.push({
      code: 'UNSUPPORTED_RECENCY',
      message: `Response contains current/recent claims but source dates are not verified (requires sources within ${recentMonths} months)`,
      meta: { recentMonths },
      severity: 'warning',
    });
  }

  return issues;
}

/**
 * Validate for PII leakage
 *
 * @param response - Assistant response
 * @param blockPII - Whether to block PII
 * @returns Validation issues
 */
function validatePII(
  response: AssistantResponse,
  blockPII: boolean
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!blockPII) {
    return issues;
  }

  const text = response.rawModelOutput;

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailPattern) || [];

  // US phone pattern (simple)
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const phones = text.match(phonePattern) || [];

  if (emails.length > 0) {
    issues.push({
      code: 'PII_LEAKAGE',
      message: `Found ${emails.length} email address(es) in output`,
      meta: { type: 'email', count: emails.length },
      severity: 'warning',
    });
  }

  if (phones.length > 0) {
    issues.push({
      code: 'PII_LEAKAGE',
      message: `Found ${phones.length} phone number(s) in output`,
      meta: { type: 'phone', count: phones.length },
      severity: 'warning',
    });
  }

  return issues;
}

/**
 * Validate required sections exist and are non-empty
 *
 * @param response - Assistant response
 * @param requiredSections - Required section names
 * @returns Validation issues
 */
function validateRequiredSections(
  response: AssistantResponse,
  requiredSections: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const required of requiredSections) {
    const section = findSection(response, required);

    if (!section || section.trim().length === 0) {
      issues.push({
        code: 'EMPTY_REQUIRED_SECTION',
        message: `Required section '${required}' is missing or empty`,
        meta: { sectionName: required },
        severity: 'warning',
      });
    }
  }

  return issues;
}

/**
 * Validate executor output against policies
 *
 * @param response - Assistant response
 * @param context - Executor context
 * @returns Validation result
 */
export function validateOutput(
  response: AssistantResponse,
  context: ExecutorContext & {
    assistant: AssistantType;
    requiresWebSearch?: boolean;
    requiredSections?: string[];
  }
): PolicyValidationResult {
  const config = loadPolicyConfig();
  const issues: ValidationIssue[] = [];

  // Extract sources by type
  const webSources = response.sources.filter((s) => s.type === 'web');

  // 1. Citation validation
  const citationIssues = validateCitationsInternal(response, {
    requireSourcesSection: config.requireSources,
  });
  issues.push(...citationIssues);

  // 2. Number validation
  const numberIssues = validateNumbers(
    context.assistant,
    response.rawModelOutput,
    context.financeModel,
    config.strictNumbers
  );
  issues.push(...numberIssues);

  // 3. Prompt injection detection
  const injectionIssues = validateSourcesForInjection(response.sources);
  issues.push(...injectionIssues);

  // 4. Recency validation
  const recencyIssues = validateRecency(
    response,
    webSources,
    context.requiresWebSearch || false,
    config.recentMonths
  );
  issues.push(...recencyIssues);

  // 5. PII validation
  const piiIssues = validatePII(response, config.blockPII);
  issues.push(...piiIssues);

  // 6. Required sections validation
  if (context.requiredSections && context.requiredSections.length > 0) {
    const sectionIssues = validateRequiredSections(response, context.requiredSections);
    issues.push(...sectionIssues);
  }

  // Determine validity (no errors)
  const valid = !issues.some((i) => i.severity === 'error');

  // Build disclaimer
  const disclaimer = buildDisclaimer(
    context.assistant,
    issues,
    {
      webSources,
      hasFinanceData: !!context.financeModel,
    }
  );

  return {
    valid,
    issues,
    appendedDisclaimer: disclaimer || undefined,
  };
}

/**
 * Check if response contains proper citations
 *
 * @param response - Assistant response
 * @returns Validation result
 */
export function validateCitations(response: AssistantResponse): PolicyValidationResult {
  const config = loadPolicyConfig();

  const issues = validateCitationsInternal(response, {
    requireSourcesSection: config.requireSources,
  });

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
  };
}

/**
 * Check for potential hallucinations or unsupported claims
 *
 * @param response - Assistant response
 * @param context - Executor context
 * @returns Validation result
 */
export function validateFactualConsistency(
  response: AssistantResponse,
  context: ExecutorContext
): PolicyValidationResult {
  const issues: ValidationIssue[] = [];

  // Check for unsupported numbers
  const numberIssues = validateNumbers(
    'streamlined_plan', // Default to general validation
    response.rawModelOutput,
    context.financeModel
  );

  issues.push(...numberIssues);

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
  };
}

/**
 * Validate financial metrics for accuracy
 *
 * @param response - Assistant response
 * @param context - Executor context
 * @returns Validation result
 */
export function validateFinancialMetrics(
  response: AssistantResponse,
  context: ExecutorContext
): PolicyValidationResult {
  const config = loadPolicyConfig();

  const issues = validateNumbers(
    'financial_overview',
    response.rawModelOutput,
    context.financeModel,
    config.strictNumbers
  );

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
  };
}

/**
 * Sanitize response by stripping injection markers
 *
 * @param response - Assistant response
 * @returns Sanitized response
 */
export function sanitizeResponse(response: AssistantResponse): AssistantResponse {
  const sanitizedSections: Record<string, string> = {};

  for (const [key, value] of Object.entries(response.sections)) {
    sanitizedSections[key] = stripInjection(value);
  }

  return {
    ...response,
    sections: sanitizedSections,
    rawModelOutput: stripInjection(response.rawModelOutput),
  };
}
