import BusinessTrack from '@/components/BusinessTrack';
import { translations } from '@/lib/translations';

export default function BusinessPage() {
  const t = translations.en; // Default to English for now

  return <BusinessTrack t={t} />;
}
