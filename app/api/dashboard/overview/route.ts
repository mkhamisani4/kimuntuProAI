import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';

export const dynamic = 'force-dynamic';

function toMillis(value: any) {
  if (!value) return 0;
  if (typeof value === 'string') return new Date(value).getTime() || 0;
  return value.toDate?.()?.getTime?.() || 0;
}

async function countUserCollection(collectionName: string, userId: string) {
  if (!adminDb) return 0;
  try {
    const snap = await adminDb.collection(collectionName).where('userId', '==', userId).get();
    return snap.size;
  } catch (error) {
    console.warn(`[Dashboard Overview] Failed to count ${collectionName}:`, error);
    return 0;
  }
}

async function getUserDocs(collectionName: string, userId: string, take = 200) {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection(collectionName).where('userId', '==', userId).limit(take).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn(`[Dashboard Overview] Failed to read ${collectionName}:`, error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    if (!adminApp || !adminDb) {
      return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 503 });
    }

    const decoded = await admin.auth(adminApp).verifyIdToken(token);
    const userId = decoded.uid;

    const [
      assistantResults,
      usageLogs,
      documentsCount,
      websitesCount,
      logosCount,
      jobMatchesCount,
    ] = await Promise.all([
      getUserDocs('assistant_results', userId, 500),
      getUserDocs('usage_logs', userId, 1000),
      countUserCollection('documents', userId),
      countUserCollection('websites', userId),
      countUserCollection('logos', userId),
      countUserCollection('job_matches', userId),
    ]);

    const generatedDocumentResults = assistantResults.filter((result: any) => {
      const assistant = String(result.assistant || '').toLowerCase();
      const title = String(result.title || '').toLowerCase();
      return /(document|resume|cv|cover|business|plan|legal|contract|website|logo)/.test(`${assistant} ${title}`);
    }).length;

    const documentsCreated = generatedDocumentResults + documentsCount + websitesCount + logosCount;

    const usageJobMatches = usageLogs.filter((row: any) => {
      const assistant = String(row.assistant || '').toLowerCase();
      const meta = JSON.stringify(row.meta || {}).toLowerCase();
      return assistant.includes('job') || assistant.includes('career') || meta.includes('job-matching');
    }).length;

    const aiQueries = usageLogs.length || assistantResults.length;
    const latestActivity = [...assistantResults, ...usageLogs]
      .map((row: any) => toMillis(row.createdAt))
      .filter(Boolean)
      .sort((a, b) => b - a)[0] || null;

    return NextResponse.json({
      stats: {
        documentsCreated,
        jobMatches: jobMatchesCount + usageJobMatches,
        aiQueries,
        latestActivity: latestActivity ? new Date(latestActivity).toISOString() : null,
      },
      counts: {
        assistantResults: assistantResults.length,
        uploadedDocuments: documentsCount,
        websites: websitesCount,
        logos: logosCount,
        usageLogs: usageLogs.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard overview' },
      { status: 500 }
    );
  }
}
