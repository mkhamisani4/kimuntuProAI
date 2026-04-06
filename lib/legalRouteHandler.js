import { NextResponse } from 'next/server';
import { runLegalAssistant, verifyLegalAssistantPayload } from '@/lib/legalAssistantEngine';

async function verifyOptionalAuth(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return;
    }

    const token = authHeader.substring(7);
    if (token === 'mock-token' || process.env.NODE_ENV !== 'production') {
        return;
    }

    const { getAuth } = await import('firebase-admin/auth');
    const { adminApp } = await import('@/lib/firebase-admin');
    const auth = getAuth(adminApp);
    await auth.verifyIdToken(token);
}

export function createLegalAssistantRoute(assistantId) {
    return async function POST(request) {
        try {
            await verifyOptionalAuth(request);

            const body = await request.json();
            verifyLegalAssistantPayload(body);

            const result = await runLegalAssistant({
                assistantId,
                category: body.category,
                question: body.question,
                history: body.history,
            });

            return NextResponse.json(result);
        } catch (error) {
            console.error(`[Legal API:${assistantId}]`, error);

            const message = error?.message || 'Internal server error';
            const status = message.toLowerCase().includes('unauthorized') ? 401 : message === 'Missing required fields' ? 400 : 500;

            return NextResponse.json({ error: message }, { status });
        }
    };
}
