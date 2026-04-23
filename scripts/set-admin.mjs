/**
 * One-time bootstrap script: list all Firebase Auth users,
 * then set a chosen user's role to 'admin' in Firestore.
 *
 * Usage: node scripts/set-admin.mjs [email]
 *   - With no args:  lists all users
 *   - With email:    sets that user as admin
 */

import admin from 'firebase-admin';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import nextEnv from '@next/env';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local the same way Next does, including quoted JSON values.
const { loadEnvConfig } = nextEnv;
loadEnvConfig(resolve(__dirname, '..'));

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (typeof serviceAccount.private_key === 'string') {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();
const targetEmail = process.argv[2];

// First verify Firestore works with this service account
const testRef = db.collection('_bootstrap_test').doc('ping');

if (!targetEmail) {
  // Try to list users via Auth
  try {
    const { users } = await admin.auth().listUsers(100);
    console.log('\nAll Firebase Auth users:\n');
    users.forEach((u) =>
      console.log(`  ${u.email || '(no email)'}  →  uid: ${u.uid}`)
    );
    console.log('\nRun again with an email to set them as admin:');
    console.log('  node scripts/set-admin.mjs your@email.com\n');
  } catch (authErr) {
    // Auth listing failed — try Firestore to confirm connectivity
    try {
      await testRef.set({ ts: Date.now() });
      await testRef.delete();
      console.log('\nFirestore connection OK.');
      console.log('Firebase Auth listing unavailable for this service account.');
      console.log('\nRun with your email to set admin directly via email lookup:');
      console.log('  node scripts/set-admin.mjs your@email.com\n');
    } catch (fsErr) {
      console.error('Firestore also failed:', fsErr.message);
    }
  }
  process.exit(0);
}

// Set admin by email — try Auth first, fall back to email-only Firestore write
let uid = null;
try {
  const userRecord = await admin.auth().getUserByEmail(targetEmail);
  uid = userRecord.uid;
} catch (e) {
  console.warn('Auth lookup failed, will write using email as key:', e.message);
}

if (uid) {
  await db.collection('users').doc(uid).set(
    { role: 'admin', email: targetEmail },
    { merge: true }
  );
} else {
  // Fallback: store by email (for lookup later)
  const snap = await db.collection('users').where('email', '==', targetEmail).get();
  if (snap.empty) {
    console.error(`No Firestore user document found for ${targetEmail}`);
    console.log('Try visiting the app, signing in, then re-running this script.');
    process.exit(1);
  }
  const docRef = snap.docs[0].ref;
  await docRef.set({ role: 'admin' }, { merge: true });
  uid = snap.docs[0].id;
}

console.log(`\n✓ ${targetEmail} (${uid}) is now an admin.\n`);
process.exit(0);
