/**
 * Structured Logging Module (Phase 5)
 * Provides observability for AI assistant requests with request ID tracking
 */

import { randomUUID } from 'crypto';
import type { AssistantType } from '@kimuntupro/shared';

/**
 * Log stage types
 */
export type LogStage = 'start' | 'end' | 'error' | 'quota_check' | 'policy_validation';

/**
 * Log metadata
 */
export interface LogMetadata {
  request_id: string;
  assistant?: AssistantType | string;
  tenantId?: string;
  userId?: string;
  model?: string;
  costCents?: number;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  error?: string;
  errorCode?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  stage: LogStage;
  level: 'info' | 'warn' | 'error';
  message: string;
  meta: LogMetadata;
}

/**
 * Generate a new request ID
 *
 * @returns UUID v4 string
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Log a structured request event to console (JSON format)
 *
 * @param reqId - Request ID
 * @param stage - Log stage (start, end, error, etc.)
 * @param meta - Additional metadata
 */
export function logRequest(
  reqId: string,
  stage: LogStage,
  meta: Partial<Omit<LogMetadata, 'request_id'>> = {}
): void {
  const timestamp = new Date().toISOString();
  const level = stage === 'error' ? 'error' : 'info';

  const entry: LogEntry = {
    timestamp,
    stage,
    level,
    message: buildLogMessage(stage, meta),
    meta: {
      request_id: reqId,
      ...meta,
    },
  };

  // Log to console in JSON format
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

/**
 * Build human-readable log message from stage and metadata
 *
 * @param stage - Log stage
 * @param meta - Metadata
 * @returns Log message
 */
function buildLogMessage(stage: LogStage, meta: Partial<LogMetadata>): string {
  switch (stage) {
    case 'start':
      return `[${meta.assistant || 'unknown'}] Request started for tenant=${meta.tenantId}, user=${meta.userId}`;

    case 'end':
      return `[${meta.assistant || 'unknown'}] Request completed in ${meta.latencyMs}ms, cost=${meta.costCents}¢, tokens=${meta.tokensIn}/${meta.tokensOut}`;

    case 'error':
      return `[${meta.assistant || 'unknown'}] Request failed: ${meta.error || 'Unknown error'} (code=${meta.errorCode || 'UNKNOWN'})`;

    case 'quota_check':
      return `[${meta.assistant || 'unknown'}] Quota check for tenant=${meta.tenantId}, user=${meta.userId}`;

    case 'policy_validation':
      return `[${meta.assistant || 'unknown'}] Policy validation completed`;

    default:
      return `[${meta.assistant || 'unknown'}] ${stage}`;
  }
}

/**
 * Log request start
 *
 * @param reqId - Request ID
 * @param assistant - Assistant type
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export function logRequestStart(
  reqId: string,
  assistant: AssistantType | string,
  tenantId: string,
  userId: string
): void {
  logRequest(reqId, 'start', {
    assistant,
    tenantId,
    userId,
  });
}

/**
 * Log request completion
 *
 * @param reqId - Request ID
 * @param assistant - Assistant type
 * @param meta - Completion metadata
 */
export function logRequestEnd(
  reqId: string,
  assistant: AssistantType | string,
  meta: {
    tenantId: string;
    userId: string;
    model: string;
    costCents: number;
    latencyMs: number;
    tokensIn: number;
    tokensOut: number;
  }
): void {
  logRequest(reqId, 'end', {
    assistant,
    ...meta,
  });
}

/**
 * Log request error
 *
 * @param reqId - Request ID
 * @param assistant - Assistant type
 * @param error - Error object or message
 * @param errorCode - Error code (e.g., 'QUOTA_EXCEEDED', 'POLICY_ERROR')
 * @param meta - Additional metadata
 */
export function logRequestError(
  reqId: string,
  assistant: AssistantType | string,
  error: Error | string,
  errorCode?: string,
  meta?: {
    tenantId?: string;
    userId?: string;
    latencyMs?: number;
  }
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  logRequest(reqId, 'error', {
    assistant,
    error: errorMessage,
    errorCode: errorCode || 'UNKNOWN_ERROR',
    errorStack,
    ...meta,
  });
}

/**
 * Log quota check
 *
 * @param reqId - Request ID
 * @param assistant - Assistant type
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param passed - Whether quota check passed
 */
export function logQuotaCheck(
  reqId: string,
  assistant: AssistantType | string,
  tenantId: string,
  userId: string,
  passed: boolean
): void {
  logRequest(reqId, 'quota_check', {
    assistant,
    tenantId,
    userId,
    quotaCheckPassed: passed,
  });
}

/**
 * Log policy validation
 *
 * @param reqId - Request ID
 * @param assistant - Assistant type
 * @param valid - Whether validation passed
 * @param issueCount - Number of validation issues
 */
export function logPolicyValidation(
  reqId: string,
  assistant: AssistantType | string,
  valid: boolean,
  issueCount: number
): void {
  logRequest(reqId, 'policy_validation', {
    assistant,
    policyValid: valid,
    policyIssueCount: issueCount,
  });
}

/**
 * Create a request context object with ID
 * Useful for passing through multiple functions
 *
 * @param assistant - Assistant type
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Request context
 */
export interface RequestContext {
  requestId: string;
  assistant: AssistantType | string;
  tenantId: string;
  userId: string;
  startTime: number;
}

export function createRequestContext(
  assistant: AssistantType | string,
  tenantId: string,
  userId: string
): RequestContext {
  const requestId = generateRequestId();
  const startTime = Date.now();

  logRequestStart(requestId, assistant, tenantId, userId);

  return {
    requestId,
    assistant,
    tenantId,
    userId,
    startTime,
  };
}

/**
 * Calculate latency from request context
 *
 * @param context - Request context
 * @returns Latency in milliseconds
 */
export function calculateLatency(context: RequestContext): number {
  return Date.now() - context.startTime;
}
