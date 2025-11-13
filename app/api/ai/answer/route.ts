/**
 * POST /api/ai/answer
 * Business Track AI Assistant Entry Point
 * Runs streamlined_plan, exec_summary, or market_analysis end-to-end
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  runStreamlinedPlanAssistant,
  runExecSummaryAssistant,
  runMarketAnalysisAssistant,
} from '@kimuntupro/ai-core/assistants';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import type { AssistantType } from '@kimuntupro/shared';
import {
  createRequestContext,
  calculateLatency,
  logRequestEnd,
  logRequestError,
} from '@kimuntupro/ai-core/logging';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import {
  saveAssistantResult,
  generateTitle,
  generateSummary,
} from '@kimuntupro/db';

/**
 * Handle POST request to /api/ai/answer
 * Accepts { assistant, input, extra } and runs the appropriate assistant
 */
async function handleAnswer(req: NextRequest): Promise<NextResponse> {
  let requestContext;

  try {
    // Parse request body
    const body = await req.json();

    // Extract assistant type, input, and optional extra fields
    const assistant: AssistantType = body.assistant;
    const input: string = body.input;
    const extra: Record<string, any> | undefined = body.extra;

    // Get tenant and user from request body (already validated by middleware)
    const tenantId: string = body.tenantId || 'demo-tenant';
    const userId: string = body.userId;

    // Validate inputs
    if (!assistant || !input) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Missing required fields: assistant, input',
        },
        { status: 400 }
      );
    }

    // Validate assistant type
    const validAssistants: AssistantType[] = ['streamlined_plan', 'exec_summary', 'market_analysis'];
    if (!validAssistants.includes(assistant)) {
      return NextResponse.json(
        {
          error: 'invalid_assistant',
          message: `Invalid assistant type. Must be one of: ${validAssistants.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Phase 5: Create request context with structured logging
    requestContext = createRequestContext(assistant, tenantId, userId);

    // Switch on assistant type and call appropriate handler
    let response;
    switch (assistant) {
      case 'streamlined_plan':
        response = await runStreamlinedPlanAssistant({
          assistant,
          input,
          extra,
          tenantId,
          userId,
        });
        break;

      case 'exec_summary':
        response = await runExecSummaryAssistant({
          assistant,
          input,
          extra,
          tenantId,
          userId,
        });
        break;

      case 'market_analysis':
        response = await runMarketAnalysisAssistant({
          assistant,
          input,
          extra,
          tenantId,
          userId,
        });
        break;

      default:
        return NextResponse.json(
          {
            error: 'not_implemented',
            message: `Assistant ${assistant} not yet implemented`,
          },
          { status: 501 }
        );
    }

    // Phase 5: Calculate latency and log metrics
    const latencyMs = calculateLatency(requestContext);
    const tokensTotal = response.metadata.tokensUsed;
    const tokensIn = Math.floor(tokensTotal * 0.4); // Estimate (typical 40/60 split)
    const tokensOut = tokensTotal - tokensIn;
    const costCents = Math.round(response.metadata.cost * 100);

    // Log request completion
    logRequestEnd(requestContext.requestId, assistant, {
      tenantId,
      userId,
      model: response.metadata.model,
      costCents,
      latencyMs,
      tokensIn,
      tokensOut,
    });

    // Record usage to database (Phase 5)
    await logRequestUsage({
      tenantId,
      userId,
      assistant,
      model: response.metadata.model,
      tokensIn,
      tokensOut,
      costCents,
      latencyMs,
      toolInvocations: response.metadata.toolInvocations || {},
      requestId: requestContext.requestId,
    });

    // Save assistant result for Recent Activity (Phase B)
    let resultId: string | undefined;
    try {
      resultId = await saveAssistantResult({
        tenantId,
        userId,
        assistant: assistant as any,
        title: generateTitle(input, assistant),
        summary: generateSummary(response.sections),
        sections: response.sections,
        sources: response.sources,
        metadata: {
          model: response.metadata.model,
          tokensUsed: tokensIn + tokensOut,
          latencyMs,
          cost: response.metadata.cost,
        },
      });
      console.log(`[Phase B] Saved assistant result: ${resultId}`);
    } catch (error: any) {
      // Don't fail the request if saving result fails
      console.error('[Phase B] Failed to save assistant result:', error);
    }

    // Return simplified response format for UI
    const responseData = {
      ok: true,
      sections: response.sections,
      sources: response.sources,
      meta: {
        model: response.metadata.model,
        tokensIn,
        tokensOut,
        costCents,
        latencyMs,
        timestamp: new Date().toISOString(), // Phase 4: For data freshness badge
        toolInvocations: response.metadata.toolInvocations || {}, // Debug: Show tool usage
        resultId, // Phase B: ID for loading saved result
      },
    };

    // Add request ID to response headers (Phase 5)
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'X-Request-ID': requestContext.requestId,
      },
    });
  } catch (error: any) {
    console.error('Answer route error:', error);

    // Phase 5: Log error with structured logging
    if (requestContext) {
      logRequestError(
        requestContext.requestId,
        requestContext.assistant,
        error,
        error.name || 'UNKNOWN_ERROR',
        {
          tenantId: requestContext.tenantId,
          userId: requestContext.userId,
          latencyMs: calculateLatency(requestContext),
        }
      );
    }

    // Check for QuotaError (should be caught by middleware, but double-check)
    if (error.name === 'QuotaError') {
      const errorResponse = {
        error: 'quota_exceeded',
        message: error.message,
        resetsAt: error.resetsAtISO,
      };

      return NextResponse.json(errorResponse, {
        status: 429,
        headers: requestContext
          ? { 'X-Request-ID': requestContext.requestId }
          : {},
      });
    }

    // Return generic error response
    const errorResponse = {
      error: 'internal_error',
      message: error.message || 'Failed to generate response',
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: requestContext
        ? { 'X-Request-ID': requestContext.requestId }
        : {},
    });
  }
}

// Export POST handler with quota guard
export const POST = withQuotaGuard(handleAnswer, { for: 'executor' });
