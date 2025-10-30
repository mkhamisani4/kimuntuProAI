import Support from '@/components/Support';
import { translations } from '@/lib/translations';

export default function SupportPage() {
  const t = translations.en; // Default to English for now

  return <Support t={t} />;
}
