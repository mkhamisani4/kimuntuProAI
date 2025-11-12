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

/**
 * Handle POST request to /api/ai/answer
 * Accepts { assistant, input, extra } and runs the appropriate assistant
 */
async function handleAnswer(req: NextRequest): Promise<NextResponse> {
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

    // Return simplified response format for UI
    return NextResponse.json(
      {
        ok: true,
        sections: response.sections,
        sources: response.sources,
        meta: {
          model: response.metadata.model,
          tokensIn: response.metadata.tokensUsed, // Total tokens (in + out)
          tokensOut: 0, // Not separately tracked in current metadata
          costCents: Math.round(response.metadata.cost * 100),
          latencyMs: response.metadata.latencyMs,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Answer route error:', error);

    // Check for QuotaError (should be caught by middleware, but double-check)
    if (error.name === 'QuotaError') {
      return NextResponse.json(
        {
          error: 'quota_exceeded',
          message: error.message,
          resetsAt: error.resetsAtISO,
        },
        { status: 429 }
      );
    }

    // Return generic error response
    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}

// Export POST handler with quota guard
export const POST = withQuotaGuard(handleAnswer, { for: 'executor' });
