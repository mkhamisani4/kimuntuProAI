'use client';

import LegalAssistantChat from '@/components/legal/LegalAssistantChat';
import { LEGAL_AGENT_PAGES } from '@/lib/legalAgents';

export default function ImmigrationLegalPage() {
    return <LegalAssistantChat agent={LEGAL_AGENT_PAGES.immigration} />;
}
