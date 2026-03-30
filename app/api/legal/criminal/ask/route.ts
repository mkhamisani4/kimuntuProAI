import { createLegalAssistantRoute } from '@/lib/legalRouteHandler';

export const runtime = 'nodejs';

export const POST = createLegalAssistantRoute('criminal');
