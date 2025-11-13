'use client';

import { useAuth } from '@/hooks/useAuth';
import Hero from '@/components/business/Hero';
import KPISection from '@/components/business/KPISection';
import QuickActions from '@/components/business/QuickActions';
import ProLaunchSection from '@/components/business/ProLaunchSection';
import NextSteps from '@/components/business/NextSteps';
import RecentActivity from '@/components/business/RecentActivity';

export default function BusinessPage() {
  const { user, loading } = useAuth();

  // Use demo-tenant for consistency with TaskForm
  const tenantId = 'demo-tenant';

  return (
    <div>
      <Hero />
      <KPISection />
      <QuickActions />
      <ProLaunchSection />
      <NextSteps />
      {/* Phase B: Recent Activity - Only show when user is authenticated */}
      {!loading && user && <RecentActivity tenantId={tenantId} />}
    </div>
  );
}
