'use client';

import { useAuth } from '@/hooks/useAuth';

export function getTenantId(user: { uid?: string } | null | undefined): string | null {
  return user?.uid ?? null;
}

export function useTenant(): {
  tenantId: string | null;
  userId: string | null;
  loading: boolean;
} {
  const { user, loading } = useAuth();
  const uid = user?.uid ?? null;
  return {
    tenantId: uid,
    userId: uid,
    loading,
  };
}
