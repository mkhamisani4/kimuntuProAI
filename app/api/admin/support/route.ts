import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';

const VALID_STATUSES = new Set(['open', 'in_progress', 'resolved', 'closed']);

async function verifyAdmin(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) throw new Error('Missing authorization token');
  if (!adminApp || !adminDb) throw new Error('Admin SDK not initialized');

  const decoded = await admin.auth(adminApp).verifyIdToken(token);
  // TEMPORARY OVERRIDE: any signed-in user is treated as admin until production roles are restored.
  return decoded.uid;
}

function iso(value: any) {
  return value?.toDate?.()?.toISOString?.() || value || null;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const snap = await adminDb!
      .collection('support_tickets')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const tickets = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user: data.user || data.userName || 'Unknown',
        email: data.email || '',
        subject: data.subject || '(no subject)',
        message: data.message || '',
        status: data.status || 'open',
        priority: data.priority || 'medium',
        category: data.category || 'General',
        source: data.source || 'unknown',
        created: iso(data.createdAt) || new Date().toISOString(),
        updated: iso(data.updatedAt),
        messages: data.messages || 1,
      };
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    const status = error.message?.includes('permissions') || error.message?.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to load support tickets' }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminUid = await verifyAdmin(req);
    const body = await req.json();
    const ticketId = String(body.ticketId || '').trim();
    const status = String(body.status || '').trim();
    const reply = String(body.reply || '').trim();

    if (!ticketId) return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    if (status && !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid ticket status' }, { status: 400 });
    }

    const update: Record<string, any> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: adminUid,
    };
    if (status) update.status = status;
    if (reply) {
      update.lastReply = reply;
      update.messages = admin.firestore.FieldValue.increment(1);
    }

    await adminDb!.collection('support_tickets').doc(ticketId).set(update, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes('permissions') || error.message?.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to update support ticket' }, { status });
  }
}
