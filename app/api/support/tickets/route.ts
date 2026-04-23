import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';

function priorityFromSubject(subject = '') {
  const text = subject.toLowerCase();
  if (/(urgent|billing|payment|locked|cannot access|down|security)/.test(text)) return 'high';
  return 'medium';
}

export async function POST(req: NextRequest) {
  try {
    if (!adminApp || !adminDb) {
      return NextResponse.json({ error: 'Support tickets require Firebase Admin SDK' }, { status: 503 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Name, email, subject, and message are required' }, { status: 400 });
    }

    let userId = null;
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      try {
        const decoded = await admin.auth(adminApp).verifyIdToken(token);
        userId = decoded.uid;
      } catch {
        userId = null;
      }
    }

    const ticketRef = await adminDb.collection('support_tickets').add({
      user: name,
      userName: name,
      email,
      subject,
      message,
      status: 'open',
      priority: priorityFromSubject(subject),
      category: body.category || 'Support Center',
      source: body.source || 'support_form',
      userId,
      messages: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, ticketId: ticketRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create ticket' }, { status: 500 });
  }
}
