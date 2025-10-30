import Documents from '@/components/Documents';
import { translations } from '@/lib/translations';

export default function DocumentsPage() {
  const t = translations.en; // Default to English for now

  return <Documents t={t} />;
}
