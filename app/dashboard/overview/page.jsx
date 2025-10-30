import Overview from '@/components/Overview';
import { translations } from '@/lib/translations';

export default function OverviewPage() {
  const t = translations.en; // Default to English for now

  return <Overview t={t} />;
}
