'use client';

import { useAuth } from '@/hooks/useAuth';
import BusinessDashboard from '@/components/business/dashboard';

export default function BusinessPage() {
  const { user, loading } = useAuth();

  // Use demo-tenant for consistency with TaskForm
  const tenantId = 'demo-tenant';

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
