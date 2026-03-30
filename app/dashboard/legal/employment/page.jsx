'use client';

import LegalAssistantChat from '@/components/legal/LegalAssistantChat';
import { LEGAL_AGENT_PAGES } from '@/lib/legalAgents';

export default function EmploymentLegalPage() {
    return <LegalAssistantChat agent={LEGAL_AGENT_PAGES.employment} />;
}
