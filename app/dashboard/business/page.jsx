'use client';
// Force rebuild

import { useAuth } from '@/hooks/useAuth';
import BusinessDashboard from '@/components/business/dashboard';

export default function BusinessPage() {
  const { user, loading } = useAuth();

  // Per-user tenant isolation: each signed-in user is their own tenant.
  const tenantId = user?.uid;

  // Extract user's first name if available
  const userName = user?.displayName?.split(' ')[0];

  return (
    <BusinessDashboard
      userName={userName}
      tenantId={tenantId}
      userId={user?.uid}
      loading={loading}
    />
  );
}
