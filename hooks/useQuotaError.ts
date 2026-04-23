'use client';

/**
 * Shared handler for AI quota errors returned by Next API routes.
 * Toasts a friendly message and returns true so the caller can early-exit.
 */

import { useRouter } from 'next/navigation';
import { toast } from '@/components/ai/Toast';

type ApiError = {
  status?: number;
  error?: string;
  message?: string;
  resetsAt?: string;
};

export function isQuotaError(status: number | undefined, body: ApiError | undefined): boolean {
  return status === 429 || body?.error === 'quota_exceeded';
}

export function useQuotaError() {
  const router = useRouter();

  /**
   * Handle a possible quota error. Returns true if it was a quota error and was
   * handled (toast shown); returns false if the caller should handle the error
   * itself.
   */
  function handleQuotaError(
    status: number | undefined,
    body: ApiError | undefined,
    opts: { toastId?: string; redirectToPricing?: boolean } = {}
  ): boolean {
    if (!isQuotaError(status, body)) return false;
    const message =
      body?.message ||
      'You have reached your usage quota. Please upgrade your plan or wait until your quota resets.';
    toast.error(message, { id: opts.toastId, duration: 6000 });
    if (opts.redirectToPricing) {
      router.push('/dashboard/business/pricing');
    }
    return true;
  }

  return { handleQuotaError, isQuotaError };
}
