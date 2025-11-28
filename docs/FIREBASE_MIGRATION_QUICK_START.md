# Firebase Migration - Quick Start Guide

**🎯 Goal:** Replace PostgreSQL with Firebase Firestore for all database operations

---

## Current vs Target Architecture

```
BEFORE                          AFTER
┌─────────────────┐           ┌─────────────────┐
│   Next.js App   │           │   Next.js App   │
└────────┬────────┘           └────────┬────────┘
         │                             │
         ├─ Firebase Auth ✅           ├─ Firebase Auth ✅
         │                             │
         └─ PostgreSQL/Prisma          └─ Firestore ✅
            (to be removed)
```

---

## Phase 1: Essential Migration (Start Here)

### What to Migrate First

1. ✅ **Usage Tracking** (Phase 5 feature)
   - API usage logs
   - Token consumption
   - Cost tracking

2. ✅ **Quota Enforcement**
   - Daily user limits
   - Tenant limits
   - Per-request caps

### What NOT to Migrate Yet

- ❌ RAG System (documents, embeddings) - **Deferred to Beta**
- ❌ Vector search - **Requires third-party service**

---

## Step-by-Step Implementation

### 1️⃣ Install Firebase SDK

```bash
cd packages/db
npm install firebase firebase-admin
npm install -D @types/firebase
```

### 2️⃣ Create Firebase Client

**Create:** `packages/db/src/firebase/client.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { Timestamp } from 'firebase/firestore';
```

### 3️⃣ Implement Usage Functions

**Create:** `packages/db/src/firebase/usage.ts`

```typescript
import { db, Timestamp } from './client';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export interface UsageRow {
  tenantId: string;
  userId: string;
  assistant: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  latencyMs: number;
  toolInvocations: object;
  requestId?: string;
}

export async function recordUsage(row: UsageRow): Promise<void> {
  await addDoc(collection(db, 'usage_logs'), {
    ...row,
    createdAt: Timestamp.now(),
  });
}

export async function sumTokensByUser(
  userId: string,
  since: Date
): Promise<number> {
  const q = query(
    collection(db, 'usage_logs'),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(since))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.tokensIn || 0) + (data.tokensOut || 0);
  }, 0);
}

export async function sumTokensByTenant(
  tenantId: string,
  since: Date
): Promise<number> {
  const q = query(
    collection(db, 'usage_logs'),
    where('tenantId', '==', tenantId),
    where('createdAt', '>=', Timestamp.fromDate(since))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.tokensIn || 0) + (data.tokensOut || 0);
  }, 0);
}
```

### 4️⃣ Update Package Exports

**Edit:** `packages/db/src/index.ts`

```typescript
// Replace Prisma exports with Firebase exports
export * from './firebase/client';
export * from './firebase/usage';

// Remove this line:
// export { prisma } from './client';
```

### 5️⃣ Update Package.json Scripts

**Edit:** `packages/db/package.json`

```json
{
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
    // Remove all db:* Prisma scripts
  }
}
```

### 6️⃣ Remove Prisma Dependencies

```bash
cd packages/db
npm uninstall prisma @prisma/client
rm -rf prisma/
npm run build
```

### 7️⃣ Test Migration

```bash
# From project root
npm run dev

# Test API call
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"assistant":"streamlined_plan","input":"test","tenantId":"demo","userId":"test"}'

# Check Firebase Console
# Visit: https://console.firebase.google.com/project/YOUR_PROJECT/firestore
# Verify usage_logs collection has new documents
```

---

## Firestore Collections Structure

```
firestore (root)
├── usage_logs/
│   ├── {auto-id}
│   │   ├── tenantId: "demo"
│   │   ├── userId: "test-user-123"
│   │   ├── assistant: "streamlined_plan"
│   │   ├── model: "gpt-4o-mini"
│   │   ├── tokensIn: 1000
│   │   ├── tokensOut: 2000
│   │   ├── costCents: 25
│   │   ├── latencyMs: 3500
│   │   ├── toolInvocations: { webSearch: 1 }
│   │   ├── requestId: "uuid"
│   │   └── createdAt: Timestamp
│
├── tenants/ (Phase 2)
│   ├── {tenantId}
│   │   ├── name: "Demo Tenant"
│   │   ├── ownerId: "firebase-uid"
│   │   └── createdAt: Timestamp
│
└── users/ (Phase 2)
    ├── {firebase-uid}
    │   ├── email: "user@example.com"
    │   ├── tenantId: "demo"
    │   └── createdAt: Timestamp
```

---

## Required Firestore Indexes

**Firebase Console → Firestore → Indexes**

Create composite indexes:

1. **For user quota checks:**
   - Collection: `usage_logs`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **For tenant quota checks:**
   - Collection: `usage_logs`
   - Fields: `tenantId` (Ascending), `createdAt` (Descending)

Firebase will prompt you to create these automatically when first queried.

---

## Security Rules

**Firebase Console → Firestore → Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    // Usage Logs - read only by tenant members
    match /usage_logs/{logId} {
      allow read: if isAuthenticated() &&
        request.auth.uid in get(/databases/$(database)/documents/tenants/$(resource.data.tenantId)).data.members;
      allow create: if isAuthenticated(); // Server writes only in practice
    }

    // Tenants
    match /tenants/{tenantId} {
      allow read: if isAuthenticated() &&
        request.auth.uid in resource.data.members;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        request.auth.uid == resource.data.ownerId;
    }

    // Users
    match /users/{userId} {
      allow read, write: if isAuthenticated() &&
        request.auth.uid == userId;
    }
  }
}
```

---

## Testing Checklist

- [ ] Firebase SDK installed in `packages/db`
- [ ] `firebase/client.ts` created with config
- [ ] `firebase/usage.ts` implemented
- [ ] `packages/db/src/index.ts` updated
- [ ] Prisma removed from package.json
- [ ] `npm run build` succeeds in packages/db
- [ ] AI assistants work without errors
- [ ] Usage logs appear in Firebase Console
- [ ] Quota checks work correctly
- [ ] No PostgreSQL errors in terminal

---

## Troubleshooting

### Error: "Firebase app not initialized"
**Solution:**
- Verify all `NEXT_PUBLIC_FIREBASE_*` vars are set in `.env.local`
- Restart dev server after changing env vars

### Error: "Missing required index"
**Solution:**
- Click the link in error message to create index automatically
- Or manually create in Firebase Console → Firestore → Indexes

### Error: "PERMISSION_DENIED"
**Solution:**
- Update Firestore security rules in Firebase Console
- Ensure user is authenticated
- Check tenant membership

---

## Next Steps After Phase 1

1. **Phase 2:** Migrate Tenant and User models
2. **Phase 3:** Replace Feature Flags with Remote Config
3. **Beta:** Implement RAG with vector search service

---

## Rollback Instructions

If issues arise:

1. **Keep PostgreSQL running** during migration
2. **Revert code changes:**
   ```bash
   git checkout main packages/db/src/
   ```
3. **Reinstall Prisma:**
   ```bash
   cd packages/db
   npm install prisma @prisma/client
   npm run db:generate
   ```
4. **Test that PostgreSQL works again**

---

## Support Resources

- **Full Plan:** `docs/FIREBASE_MIGRATION_PLAN.md`
- **Firebase Docs:** https://firebase.google.com/docs/firestore
- **Firestore Queries:** https://firebase.google.com/docs/firestore/query-data/queries
- **Security Rules:** https://firebase.google.com/docs/firestore/security/get-started

---

**Estimated Time:** 2-3 hours for Phase 1
**Complexity:** 🟡 Medium
**Risk:** 🟢 Low (with rollback plan)
