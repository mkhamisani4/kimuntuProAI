/**
 * One-time purge: deletes every Firestore document with tenantId == 'demo-tenant'
 * across every collection the business/marketing/legal suite writes to.
 *
 * This is the migration for the per-user tenant cutover. Run once, after
 * deploying the auth-enforced code and new Firestore rules.
 *
 * Usage:
 *   node scripts/purgeDemoTenant.mjs            # dry run, reports counts only
 *   node scripts/purgeDemoTenant.mjs --apply    # actually delete
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

const COLLECTIONS = [
  'assistant_results',
  'usage_logs',
  'websites',
  'logos',
  'logo_versions',
  'email_campaigns',
  'email_analytics',
  'email_error_log',
  'marketing_settings',
  'marketing_keywords',
  'marketing_campaigns',
  'marketing_posts',
  'keyword_research_history',
];

const BATCH_SIZE = 400;
const DEMO_TENANT = 'demo-tenant';
const APPLY = process.argv.includes('--apply');

async function purgeCollection(collectionName) {
  const col = db.collection(collectionName);
  let totalDeleted = 0;

  // Loop: fetch a page, delete, repeat until no more match.
  // Using where + limit keeps reads bounded; batch-commit deletes.
  // Note: after deletion the next query no longer matches those docs, so no offset needed.
  while (true) {
    const snap = await col.where('tenantId', '==', DEMO_TENANT).limit(BATCH_SIZE).get();
    if (snap.empty) break;

    if (!APPLY) {
      totalDeleted += snap.size;
      // In dry-run we stop after one page to avoid pretending progress.
      break;
    }

    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    totalDeleted += snap.size;
    process.stdout.write(`  ${collectionName}: deleted ${totalDeleted}…\r`);
  }

  return totalDeleted;
}

async function main() {
  console.log(`[purgeDemoTenant] ${APPLY ? 'APPLY MODE — deletions WILL happen' : 'DRY RUN — no writes (pass --apply to delete)'}`);
  console.log(`[purgeDemoTenant] Project: ${serviceAccount.project_id}`);
  console.log('');

  const results = [];
  for (const name of COLLECTIONS) {
    try {
      const count = await purgeCollection(name);
      results.push({ name, count });
      console.log(`  ${name.padEnd(28)} ${count}${APPLY ? ' deleted' : ' match (dry-run)'}`);
    } catch (err) {
      console.error(`  ${name.padEnd(28)} ERROR:`, err.message);
      results.push({ name, error: err.message });
    }
  }

  const total = results.reduce((s, r) => s + (r.count || 0), 0);
  console.log('');
  console.log(`[purgeDemoTenant] Total ${APPLY ? 'deleted' : 'matched'}: ${total}`);
  if (!APPLY) console.log('[purgeDemoTenant] Re-run with --apply to delete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[purgeDemoTenant] Fatal:', err);
  process.exit(1);
});
