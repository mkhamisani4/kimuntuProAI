'use client';

import { useAuth } from '@/hooks/useAuth';
import Hero from '@/components/business/Hero';
import KPISection from '@/components/business/KPISection';
import QuickActions from '@/components/business/QuickActions';
import ProLaunchSection from '@/components/business/ProLaunchSection';
import NextSteps from '@/components/business/NextSteps';
import RecentActivity from '@/components/business/RecentActivity';
import RecentWebsites from '@/components/business/RecentWebsites';

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

      {/* Recent Activity and Websites - Only show when user is authenticated */}
      {!loading && user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mb-12">
          <RecentActivity tenantId={tenantId} />
          <RecentWebsites tenantId={tenantId} userId={user.uid} />
        </div>
      )}
    </div>
  );
}
