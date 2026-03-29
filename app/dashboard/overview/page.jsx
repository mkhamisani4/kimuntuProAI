'use client';

import Overview from '@/components/Overview';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function OverviewPage() {
  const { t } = useLanguage();

  return <Overview t={t} />;
}
