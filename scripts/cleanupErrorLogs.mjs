/**
 * On-demand cleanup: deletes email error log docs older than 30 days.
 *
 * Usage:
 *   node scripts/cleanupErrorLogs.mjs            # dry run, prints count
 *   node scripts/cleanupErrorLogs.mjs --apply    # actually delete
 *   node scripts/cleanupErrorLogs.mjs --apply --days=60   # override TTL
 */

import admin from 'firebase-admin';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import nextEnv from '@next/env';

const __dirname = dirname(fileURLToPath(import.meta.url));
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
const APPLY = process.argv.includes('--apply');
const daysArg = process.argv.find((a) => a.startsWith('--days='));
const DAYS = daysArg ? parseInt(daysArg.split('=')[1], 10) : 30;
const BATCH = 400;

async function main() {
  const cutoff = admin.firestore.Timestamp.fromDate(new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000));
  console.log(`[cleanupErrorLogs] ${APPLY ? 'APPLY' : 'DRY-RUN'} — cutoff: ${cutoff.toDate().toISOString()}`);

  const col = db.collection('email_error_log');
  let totalDeleted = 0;

  while (true) {
    const snap = await col.where('createdAt', '<', cutoff).limit(BATCH).get();
    if (snap.empty) break;

    if (!APPLY) {
      totalDeleted += snap.size;
      console.log(`  Found ${snap.size} to delete (not deleting — dry run)`);
      break;
    }

    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    totalDeleted += snap.size;
  }

  console.log(`[cleanupErrorLogs] Total ${APPLY ? 'deleted' : 'matched'}: ${totalDeleted}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[cleanupErrorLogs] Fatal:', err);
  process.exit(1);
});
