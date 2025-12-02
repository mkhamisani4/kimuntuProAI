/**
 * Unit Tests for Structured Logging Module (Phase 5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateRequestId,
  logRequest,
  logRequestStart,
  logRequestEnd,
  logRequestError,
  logQuotaCheck,
  logPolicyValidation,
  createRequestContext,
  calculateLatency,
  type LogStage,
  type LogMetadata,
} from '../logger.js';

describe('Structured Logging Module', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateRequestId', () => {
    it('generates a valid UUID v4', () => {
      const reqId = generateRequestId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(reqId).toMatch(uuidRegex);
    });

    it('generates unique IDs on subsequent calls', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      const id3 = generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('logRequest', () => {
    it('logs structured JSON to console', () => {
      const reqId = 'test-req-123';
      const stage: LogStage = 'start';
      const meta = {
        assistant: 'streamlined_plan',
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      logRequest(reqId, stage, meta);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData).toMatchObject({
        stage: 'start',
        level: 'info',
        meta: {
          request_id: reqId,
          assistant: 'streamlined_plan',
          tenantId: 'tenant-1',
          userId: 'user-1',
        },
      });
      expect(loggedData.timestamp).toBeDefined();
      expect(loggedData.message).toContain('Request started');
    });

    it('logs errors to console.error', () => {
      const reqId = 'test-req-456';
      const stage: LogStage = 'error';
      const meta = {
        assistant: 'market_analysis',
        error: 'Rate limit exceeded',
        errorCode: 'QUOTA_EXCEEDED',
      };

      logRequest(reqId, stage, meta);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData).toMatchObject({
        stage: 'error',
        level: 'error',
        meta: {
          request_id: reqId,
          error: 'Rate limit exceeded',
          errorCode: 'QUOTA_EXCEEDED',
        },
      });
    });

    it('includes timestamp in ISO format', () => {
      const reqId = 'test-req-789';
      logRequest(reqId, 'start', {});

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      const timestamp = loggedData.timestamp;

      // Check ISO 8601 format
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('includes all metadata fields', () => {
      const reqId = 'test-req-complete';
      const meta: Partial<LogMetadata> = {
        assistant: 'exec_summary',
        tenantId: 'tenant-2',
        userId: 'user-2',
        model: 'gpt-4o-mini',
        costCents: 25,
        latencyMs: 3500,
        tokensIn: 1500,
        tokensOut: 2000,
      };

      logRequest(reqId, 'end', meta);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        ...meta,
      });
    });
  });

  describe('logRequestStart', () => {
    it('logs request start with correct stage', () => {
      const reqId = 'start-123';
      const assistant = 'streamlined_plan';
      const tenantId = 'tenant-start';
      const userId = 'user-start';

      logRequestStart(reqId, assistant, tenantId, userId);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.stage).toBe('start');
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        assistant,
        tenantId,
        userId,
      });
      expect(loggedData.message).toContain('Request started');
    });
  });

  describe('logRequestEnd', () => {
    it('logs request completion with performance metrics', () => {
      const reqId = 'end-456';
      const assistant = 'market_analysis';
      const meta = {
        tenantId: 'tenant-end',
        userId: 'user-end',
        model: 'claude-3-opus',
        costCents: 45,
        latencyMs: 5000,
        tokensIn: 2000,
        tokensOut: 3000,
      };

      logRequestEnd(reqId, assistant, meta);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.stage).toBe('end');
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        assistant,
        ...meta,
      });
      expect(loggedData.message).toContain('Request completed');
      expect(loggedData.message).toContain('5000ms');
      expect(loggedData.message).toContain('45¢');
    });
  });

  describe('logRequestError', () => {
    it('logs Error object with stack trace', () => {
      const reqId = 'error-789';
      const assistant = 'exec_summary';
      const error = new Error('Database connection failed');
      const errorCode = 'DB_ERROR';

      logRequestError(reqId, assistant, error, errorCode, {
        tenantId: 'tenant-error',
        userId: 'user-error',
        latencyMs: 1000,
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.stage).toBe('error');
      expect(loggedData.level).toBe('error');
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        assistant,
        error: 'Database connection failed',
        errorCode: 'DB_ERROR',
        tenantId: 'tenant-error',
        userId: 'user-error',
        latencyMs: 1000,
      });
      expect(loggedData.meta.errorStack).toBeDefined();
      expect(loggedData.meta.errorStack).toContain('Error: Database connection failed');
    });

    it('logs string error without stack trace', () => {
      const reqId = 'error-string';
      const assistant = 'streamlined_plan';
      const error = 'Invalid input format';

      logRequestError(reqId, assistant, error, 'VALIDATION_ERROR');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        error: 'Invalid input format',
        errorCode: 'VALIDATION_ERROR',
      });
      expect(loggedData.meta.errorStack).toBeUndefined();
    });

    it('uses default error code when not provided', () => {
      const reqId = 'error-default';
      const assistant = 'market_analysis';
      const error = 'Unknown failure';

      logRequestError(reqId, assistant, error);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.meta.errorCode).toBe('UNKNOWN_ERROR');
    });
  });

  describe('logQuotaCheck', () => {
    it('logs successful quota check', () => {
      const reqId = 'quota-pass';
      const assistant = 'streamlined_plan';
      const tenantId = 'tenant-quota';
      const userId = 'user-quota';

      logQuotaCheck(reqId, assistant, tenantId, userId, true);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.stage).toBe('quota_check');
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        assistant,
        tenantId,
        userId,
        quotaCheckPassed: true,
      });
    });

    it('logs failed quota check', () => {
      const reqId = 'quota-fail';
      const assistant = 'exec_summary';
      const tenantId = 'tenant-quota-fail';
      const userId = 'user-quota-fail';

      logQuotaCheck(reqId, assistant, tenantId, userId, false);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.meta.quotaCheckPassed).toBe(false);
    });
  });

  describe('logPolicyValidation', () => {
    it('logs successful policy validation', () => {
      const reqId = 'policy-valid';
      const assistant = 'market_analysis';

      logPolicyValidation(reqId, assistant, true, 0);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.stage).toBe('policy_validation');
      expect(loggedData.meta).toMatchObject({
        request_id: reqId,
        assistant,
        policyValid: true,
        policyIssueCount: 0,
      });
    });

    it('logs failed policy validation with issue count', () => {
      const reqId = 'policy-invalid';
      const assistant = 'streamlined_plan';

      logPolicyValidation(reqId, assistant, false, 3);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.meta).toMatchObject({
        policyValid: false,
        policyIssueCount: 3,
      });
    });
  });

  describe('createRequestContext', () => {
    it('creates context with generated request ID', () => {
      const assistant = 'exec_summary';
      const tenantId = 'tenant-context';
      const userId = 'user-context';

      const context = createRequestContext(assistant, tenantId, userId);

      expect(context.requestId).toBeDefined();
      expect(context.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(context.assistant).toBe(assistant);
      expect(context.tenantId).toBe(tenantId);
      expect(context.userId).toBe(userId);
      expect(context.startTime).toBeGreaterThan(0);
    });

    it('logs request start automatically', () => {
      const assistant = 'streamlined_plan';
      const tenantId = 'tenant-auto';
      const userId = 'user-auto';

      createRequestContext(assistant, tenantId, userId);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.stage).toBe('start');
      expect(loggedData.meta).toMatchObject({
        assistant,
        tenantId,
        userId,
      });
    });

    it('captures start time for latency calculation', () => {
      const beforeTime = Date.now();
      const context = createRequestContext('market_analysis', 'tenant', 'user');
      const afterTime = Date.now();

      expect(context.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(context.startTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('calculateLatency', () => {
    it('calculates correct latency in milliseconds', async () => {
      const context = createRequestContext('streamlined_plan', 'tenant', 'user');

      // Wait 50ms
      await new Promise((resolve) => setTimeout(resolve, 50));

      const latency = calculateLatency(context);

      expect(latency).toBeGreaterThanOrEqual(50);
      expect(latency).toBeLessThan(100); // Allow some variance
    });

    it('returns 0 latency for immediate calculation', () => {
      const context = createRequestContext('exec_summary', 'tenant', 'user');
      const latency = calculateLatency(context);

      expect(latency).toBeGreaterThanOrEqual(0);
      expect(latency).toBeLessThan(10); // Should be very fast
    });
  });

  describe('Log Message Formatting', () => {
    it('formats start message correctly', () => {
      logRequest('req-1', 'start', {
        assistant: 'streamlined_plan',
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.message).toContain('[streamlined_plan]');
      expect(loggedData.message).toContain('Request started');
      expect(loggedData.message).toContain('tenant=tenant-1');
      expect(loggedData.message).toContain('user=user-1');
    });

    it('formats end message with metrics', () => {
      logRequest('req-2', 'end', {
        assistant: 'market_analysis',
        latencyMs: 2500,
        costCents: 30,
        tokensIn: 1000,
        tokensOut: 1500,
      });

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.message).toContain('[market_analysis]');
      expect(loggedData.message).toContain('Request completed');
      expect(loggedData.message).toContain('2500ms');
      expect(loggedData.message).toContain('30¢');
      expect(loggedData.message).toContain('1000/1500');
    });

    it('formats error message with error details', () => {
      logRequest('req-3', 'error', {
        assistant: 'exec_summary',
        error: 'Quota exceeded',
        errorCode: 'QUOTA_EXCEEDED',
      });

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.message).toContain('[exec_summary]');
      expect(loggedData.message).toContain('Request failed');
      expect(loggedData.message).toContain('Quota exceeded');
      expect(loggedData.message).toContain('QUOTA_EXCEEDED');
    });
  });
});
