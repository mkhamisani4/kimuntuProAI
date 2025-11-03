import LegalTrack from '@/components/LegalTrack';
import { translations } from '@/lib/translations';

export default function LegalPage() {
  const t = translations.en; // Default to English for now
  const language = 'en'; // Default to English for now

  return <LegalTrack t={t} language={language} />;
}
