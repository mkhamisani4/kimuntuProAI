/**
 * Next.js API Middleware for Quota Enforcement (Step 11)
 * Provides withQuotaGuard wrapper for planner and executor routes
 */

import { NextRequest, NextResponse } from 'next/server';
import type { PlannerInput, AssistantRequest } from '@kimuntupro/shared';
import { QuotaError } from '@kimuntupro/shared';
import { checkQuotaMiddleware } from '@kimuntupro/ai-core/orchestration/middleware';
import { deriveHeuristics } from '@kimuntupro/ai-core/orchestration/planner';

/**
 * Route handler type for Next.js API routes
 */
export type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Quota guard options
 */
export interface QuotaGuardOptions {
  /**
   * Type of guard to apply
   * - "planner": For /api/ai/plan route
   * - "executor": For /api/ai/answer route
   */
  for: 'planner' | 'executor';
}

/**
 * Extract quota check parameters from request
 *
 * @param req - Next.js request
 * @param guardType - Type of guard
 * @returns Quota check params or error response
 */
async function extractQuotaParams(
  req: NextRequest,
  guardType: 'planner' | 'executor'
): Promise<
  | { ok: true; tenantId: string; userId: string; inputLength: number; plan: any }
  | { ok: false; response: NextResponse }
> {
  // Parse request body
  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'invalid_request', message: 'Invalid JSON body' },
        { status: 400 }
      ),
    };
  }

  // Extract common fields (prioritize body, fallback to headers, then demo defaults)
  const tenantId = body.tenantId || req.headers.get('x-tenant-id') || 'demo-tenant';
  const userId = body.userId || req.headers.get('x-user-id');

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'missing_auth', message: 'User authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  // Extract input based on guard type
  let inputLength = 0;
  let plan: any = null;

  if (guardType === 'planner') {
    // Planner route: body is PlannerInput
    const plannerInput = body as PlannerInput;
    inputLength = plannerInput.input?.length || 0;

    // Derive heuristics for quota estimation
    plan = {
      requires_retrieval: deriveHeuristics(plannerInput).suggested_requires_retrieval,
      requires_web_search: deriveHeuristics(plannerInput).suggested_requires_web_search,
      escalate_model: false, // Conservative default for preflight
    };
  } else {
    // Executor route: supports two formats
    // 1. New format: { assistant, input, extra } - used by /api/ai/answer
    // 2. Old format: { plan, request } - backwards compatibility

    if (body.assistant && body.input) {
      // New assistant-based format
      inputLength = body.input?.length || 0;

      // Derive heuristics for quota estimation
      plan = {
        requires_retrieval: deriveHeuristics(body).suggested_requires_retrieval,
        requires_web_search: deriveHeuristics(body).suggested_requires_web_search,
        escalate_model: false,
      };
    } else {
      // Old two-stage format
      const request = body.request as AssistantRequest;
      plan = body.plan;

      if (!request || !plan) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: 'invalid_request', message: 'Missing plan or request' },
            { status: 400 }
          ),
        };
      }

      inputLength = request.input?.length || 0;
    }
  }

  return {
    ok: true,
    tenantId,
    userId,
    inputLength,
    plan,
  };
}

/**
 * Wrap a Next.js route handler with quota enforcement
 * Checks quotas before allowing request to proceed
 *
 * @param handler - Next.js route handler
 * @param options - Quota guard options
 * @returns Wrapped handler with quota checks
 *
 * @example
 * export const POST = withQuotaGuard(async (req) => {
 *   // Your route logic here
 * }, { for: 'planner' });
 */
export function withQuotaGuard(
  handler: RouteHandler,
  options: QuotaGuardOptions
): RouteHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Clone the request so we can read the body multiple times
    const reqClone = req.clone();

    // Extract quota params from request
    const params = await extractQuotaParams(reqClone, options.for);

    if (!params.ok) {
      return params.response;
    }

    // Check quotas using middleware
    const quotaCheck = await checkQuotaMiddleware({
      plan: params.plan,
      tenantId: params.tenantId,
      userId: params.userId,
      inputLength: params.inputLength,
    });

    if (!quotaCheck.ok) {
      // Return 429 with quota error details
      return NextResponse.json(
        {
          error: 'quota_exceeded',
          message: quotaCheck.error,
          resetsAt: quotaCheck.resetsAtISO,
        },
        {
          status: 429,
          headers: {
            'Retry-After': quotaCheck.resetsAtISO
              ? Math.ceil(
                  (new Date(quotaCheck.resetsAtISO).getTime() - Date.now()) / 1000
                ).toString()
              : '3600',
          },
        }
      );
    }

    // Quota check passed - proceed with handler (using original request)
    try {
      return await handler(req);
    } catch (error: any) {
      // Catch QuotaError that might be thrown during execution
      if (error instanceof QuotaError || error.name === 'QuotaError') {
        return NextResponse.json(
          {
            error: 'quota_exceeded',
            message: error.message,
            resetsAt: error.resetsAtISO,
          },
          {
            status: 429,
            headers: {
              'Retry-After': error.resetsAtISO
                ? Math.ceil(
                    (new Date(error.resetsAtISO).getTime() - Date.now()) / 1000
                  ).toString()
                : '3600',
            },
          }
        );
      }

      // Re-throw other errors
      throw error;
    }
  };
}
