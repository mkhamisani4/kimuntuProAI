/**
 * POST /api/ai/plan
 * Business Track AI Planner (Stage A)
 * Returns structured plan for executor
 */

import { NextRequest, NextResponse } from 'next/server';
import { planWithQuotaCheck, validatePlannerInput } from '@kimuntupro/ai-core/orchestration/planner';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import type { PlannerInput } from '@kimuntupro/shared';

/**
 * Handle POST request to /api/ai/plan
 * Creates a structured plan for the Business Track AI assistant
 */
async function handlePlan(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();

    // Validate planner input
    const validation = validatePlannerInput(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'validation_failed',
          message: 'Invalid planner input',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const input: PlannerInput = validation.data!;

    // Call planner with quota check
    const plan = await planWithQuotaCheck(input);

    // Return plan
    return NextResponse.json(
      {
        success: true,
        plan,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Plan route error:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to generate plan',
      },
      { status: 500 }
    );
  }
}

// Export POST handler with quota guard
export const POST = withQuotaGuard(handlePlan, { for: 'planner' });
