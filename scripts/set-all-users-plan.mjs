/**
 * One-time bootstrap script: set every Firebase Auth user to a plan.
 *
 * Usage:
 *   node scripts/set-all-users-plan.mjs
 *   node scripts/set-all-users-plan.mjs fullPackage
 */

import admin from 'firebase-admin';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import nextEnv from '@next/env';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { loadEnvConfig } = nextEnv;
loadEnvConfig(resolve(__dirname, '..'));

const VALID_PLANS = new Set([
  'free',
  'career',
  'business',
  'legal',
  'innovation',
  'fullPackage',
]);

const plan = process.argv[2] || 'fullPackage';

if (!VALID_PLANS.has(plan)) {
  console.error(`Invalid plan "${plan}". Valid plans: ${Array.from(VALID_PLANS).join(', ')}`);
  process.exit(1);
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env.local');
  process.exit(1);
}

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
const auth = admin.auth();

const users = [];
let pageToken;

do {
  const result = await auth.listUsers(1000, pageToken);
  users.push(...result.users);
  pageToken = result.pageToken;
} while (pageToken);

if (users.length === 0) {
  console.log('No Firebase Auth users found.');
  process.exit(0);
}

for (let i = 0; i < users.length; i += 500) {
  const batch = db.batch();
  const chunk = users.slice(i, i + 500);

  chunk.forEach((user) => {
    const ref = db.collection('users').doc(user.uid);
    batch.set(
      ref,
      {
        email: user.email || null,
        displayName: user.displayName || null,
        subscriptionTier: plan,
        subscriptionStatus: 'active',
        planGrantedByAdmin: true,
        planGrantedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  await batch.commit();
}

console.log(`Set ${users.length} Firebase Auth user(s) to ${plan}.`);
