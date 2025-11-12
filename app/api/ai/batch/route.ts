/**
 * POST /api/ai/batch
 * Business Track AI Batch Processing
 * Handles multiple plan + execute operations in a single request
 */

import { NextRequest, NextResponse } from 'next/server';
import { planWithQuotaCheck } from '@kimuntupro/ai-core/orchestration/planner';
import { execute } from '@kimuntupro/ai-core/orchestration/executor';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import type { PlannerInput, AssistantRequest } from '@kimuntupro/shared';

/**
 * Batch request item
 */
interface BatchRequestItem {
  id: string;
  plannerInput: PlannerInput;
}

/**
 * Batch response item
 */
interface BatchResponseItem {
  id: string;
  success: boolean;
  plan?: any;
  response?: any;
  error?: string;
}

/**
 * Handle POST request to /api/ai/batch
 * Processes multiple AI requests in parallel with quota enforcement
 */
async function handleBatch(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();

    // Extract batch items
    const items: BatchRequestItem[] = body.items || [];
    const tenantId: string = body.tenantId || req.headers.get('x-tenant-id') || '';
    const userId: string = body.userId || req.headers.get('x-user-id') || '';

    // Validate inputs
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Missing or empty items array',
        },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const maxBatchSize = Number(process.env.MAX_BATCH_SIZE || 10);
    if (items.length > maxBatchSize) {
      return NextResponse.json(
        {
          error: 'batch_too_large',
          message: `Batch size exceeds maximum of ${maxBatchSize} items`,
        },
        { status: 400 }
      );
    }

    // Process each item in parallel
    const results: BatchResponseItem[] = await Promise.all(
      items.map(async (item) => {
        try {
          // Plan with quota check
          const plan = await planWithQuotaCheck(item.plannerInput);

          // Build request from planner input
          const request: AssistantRequest = {
            assistant: item.plannerInput.assistant,
            input: item.plannerInput.input,
            extra: item.plannerInput.extra,
          };

          // Execute with quota check
          const response = await execute({
            plan,
            request,
            tenantId,
            userId,
          });

          return {
            id: item.id,
            success: true,
            plan,
            response,
          };
        } catch (error: any) {
          console.error(`Batch item ${item.id} failed:`, error);

          return {
            id: item.id,
            success: false,
            error: error.message || 'Processing failed',
          };
        }
      })
    );

    // Return batch results
    return NextResponse.json(
      {
        success: true,
        results,
        summary: {
          total: results.length,
          succeeded: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Batch route error:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to process batch',
      },
      { status: 500 }
    );
  }
}

// Export POST handler with quota guard
// Note: Batch uses executor guard since it includes execution
export const POST = withQuotaGuard(handleBatch, { for: 'executor' });
