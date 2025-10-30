import Hero from '@/components/business/Hero';
import KPISection from '@/components/business/KPISection';
import QuickActions from '@/components/business/QuickActions';
import ProLaunchSection from '@/components/business/ProLaunchSection';
import NextSteps from '@/components/business/NextSteps';
import RecentActivity from '@/components/business/RecentActivity';

export default function BusinessPage() {
  return (
    <div>
      <Hero />
      <KPISection />
      <QuickActions />
      <ProLaunchSection />
      <NextSteps />
      <RecentActivity />
    </div>
  );
}
