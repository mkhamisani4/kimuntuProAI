# Firebase Migration Plan - PostgreSQL to Firebase

**Version:** Alpha v1.0.0
**Status:** Implementation Plan
**Date:** January 2025

---

## Executive Summary

This document outlines the complete migration from PostgreSQL/Prisma to Firebase (Firestore + Firebase Auth) as the sole database for KimuntuPro AI.

**Current State:**
- PostgreSQL with Prisma ORM
- pgvector extension for embeddings
- 6 data models (Tenant, User, Document, Chunk, Embedding, UsageLog, FeatureFlag)

**Target State:**
- **Firestore** for all data storage
- **Firebase Authentication** for user management (already implemented)
- **Firebase Extensions** or third-party for vector search
- **Firebase Storage** for document files

---

## Current Database Usage Analysis

### 1. **Usage Tracking** (HIGH PRIORITY - Active in Alpha)

**Current Implementation:**
- **Table:** `UsageLog`
- **Purpose:** Track API usage for billing, quotas, analytics (Phase 5)
- **Operations:**
  - `recordUsage()` - Insert usage records
  - `sumTokensByUser()` - Aggregate tokens for quota checks
  - `sumTokensByTenant()` - Aggregate tokens for tenant quotas
- **Files:**
  - `packages/db/src/usage.ts`
  - `packages/ai-core/src/usage/quota.ts`
  - `packages/ai-core/src/usage/meter.ts`

**Firebase Equivalent:**
```
Firestore Collection: usage_logs
├── {docId} (auto-generated)
    ├── tenantId: string
    ├── userId: string
    ├── assistant: string
    ├── model: string
    ├── tokensIn: number
    ├── tokensOut: number
    ├── costCents: number
    ├── latencyMs: number
    ├── toolInvocations: object
    ├── requestId: string
    ├── createdAt: timestamp
```

**Migration Complexity:** 🟡 Medium
- Firestore queries can handle aggregations with composite indexes
- Need to optimize for real-time quota checks

---

### 2. **User Management** (MEDIUM PRIORITY - Partially Using Firebase)

**Current Implementation:**
- **Table:** `User`
- **Purpose:** Store user metadata linked to Firebase Auth
- **Relations:** Links to tenants and usage logs

**Firebase Equivalent:**
```
Firebase Authentication (already set up) ✅
+
Firestore Collection: users
├── {uid} (Firebase Auth UID)
    ├── email: string
    ├── tenantId: string
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    ├── displayName: string
    ├── photoURL: string
```

**Migration Complexity:** 🟢 Low
- Firebase Auth already handles authentication
- Only need Firestore for extended user metadata
- Can use Firebase Auth UID as document ID

---

### 3. **Multi-Tenancy** (MEDIUM PRIORITY)

**Current Implementation:**
- **Table:** `Tenant`
- **Purpose:** Multi-tenant isolation

**Firebase Equivalent:**
```
Firestore Collection: tenants
├── {tenantId} (auto-generated or custom)
    ├── name: string
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    ├── ownerId: string (Firebase Auth UID)
    ├── members: array<string> (user UIDs)
    ├── quotas: object
        ├── dailyTokenLimit: number
        ├── maxUsers: number
```

**Migration Complexity:** 🟢 Low
- Simple document structure
- Firestore security rules enforce tenant isolation

---

### 4. **Feature Flags** (LOW PRIORITY)

**Current Implementation:**
- **Table:** `FeatureFlag`
- **Purpose:** Kill switches and feature toggles

**Firebase Equivalent:**
```
Firestore Collection: feature_flags
├── {flagName}
    ├── enabled: boolean
    ├── tenantId: string | null
    ├── description: string
    ├── updatedAt: timestamp

OR use Firebase Remote Config (recommended)
```

**Migration Complexity:** 🟢 Low
- Can use **Firebase Remote Config** (built-in feature)
- Better than custom Firestore collection

---

### 5. **RAG System** (LOW PRIORITY - Not Active in Alpha)

**Current Implementation:**
- **Tables:** `Document`, `Chunk`, `Embedding`
- **Purpose:** RAG (Retrieval Augmented Generation)
- **Challenge:** Uses **pgvector** for vector similarity search

**Firebase Challenges:**
- ❌ Firestore has **no native vector search**
- ❌ No equivalent to pgvector extension

**Firebase Solutions:**

#### Option A: Firebase Extensions + Algolia/Typesense (Recommended)
```
Firestore Collection: documents
├── {docId}
    ├── title: string
    ├── content: string
    ├── tenantId: string
    ├── tags: array<string>
    ├── createdAt: timestamp

Firebase Extension: Vector Search with Algolia
- Index embeddings in Algolia
- Sync from Firestore using Cloud Functions
- Query vectors using Algolia API
```

#### Option B: Firebase + Pinecone/Weaviate
- Store documents in Firestore
- Store embeddings in dedicated vector DB (Pinecone, Weaviate)
- Hybrid query: Firestore for metadata, vector DB for similarity

#### Option C: Client-side Vector Search
- Store embeddings in Firestore as arrays
- Perform cosine similarity client-side or in Cloud Functions
- **Not recommended** for large datasets (slow, expensive)

**Migration Complexity:** 🔴 High
- Requires third-party service integration
- Vector search is not trivial in Firebase ecosystem

---

## Migration Strategy

### Phase 1: Core Services (Alpha v1.1)

**Goal:** Migrate essential features for Alpha testing

**Tasks:**
1. ✅ Set up Firebase project (already done)
2. ✅ Configure Firebase Auth (already done)
3. 🔲 Migrate **UsageLog** to Firestore
4. 🔲 Migrate **Quota enforcement** to use Firestore queries
5. 🔲 Create Firebase SDK wrapper for `@kimuntupro/db` package
6. 🔲 Test quota system with Firestore
7. 🔲 Remove PostgreSQL dependency

**Estimated Effort:** 8-12 hours

---

### Phase 2: User & Tenant Management (Alpha v1.2)

**Goal:** Complete user and tenant management in Firebase

**Tasks:**
1. 🔲 Migrate **Tenant** model to Firestore
2. 🔲 Migrate **User** metadata to Firestore
3. 🔲 Update onboarding flow to create Firestore docs
4. 🔲 Implement Firestore security rules for tenant isolation
5. 🔲 Test multi-tenancy in Firestore

**Estimated Effort:** 4-6 hours

---

### Phase 3: Feature Flags (Alpha v1.3)

**Goal:** Replace feature flags with Firebase Remote Config

**Tasks:**
1. 🔲 Set up Firebase Remote Config
2. 🔲 Migrate feature flags from DB to Remote Config
3. 🔲 Update code to use Remote Config SDK
4. 🔲 Test kill switch functionality

**Estimated Effort:** 2-3 hours

---

### Phase 4: RAG System (Beta v1.0 - Future)

**Goal:** Implement document retrieval with vector search

**Tasks:**
1. 🔲 Evaluate vector search solutions (Algolia, Pinecone, Weaviate)
2. 🔲 Migrate **Document** and **Chunk** models to Firestore
3. 🔲 Integrate vector search service
4. 🔲 Implement hybrid retrieval (Firestore + Vector DB)
5. 🔲 Test RAG pipeline end-to-end

**Estimated Effort:** 16-24 hours

**Decision Required:**
- Which vector search service to use?
- Budget considerations for third-party services

---

## Technical Implementation Details

### Firestore Data Model

```typescript
// packages/db/src/firebase/collections.ts

export const COLLECTIONS = {
  TENANTS: 'tenants',
  USERS: 'users',
  USAGE_LOGS: 'usage_logs',
  FEATURE_FLAGS: 'feature_flags',
  DOCUMENTS: 'documents', // Phase 4
  CHUNKS: 'chunks', // Phase 4
} as const;

// Usage Log Document
interface UsageLogDoc {
  tenantId: string;
  userId: string;
  assistant: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  latencyMs: number;
  toolInvocations: {
    retrieval?: number;
    webSearch?: number;
    finance?: number;
  };
  requestId: string;
  createdAt: Timestamp;
}

// Tenant Document
interface TenantDoc {
  id: string;
  name: string;
  ownerId: string; // Firebase Auth UID
  members: string[]; // Array of user UIDs
  quotas: {
    dailyTokenLimit: number;
    maxUsers: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Document
interface UserDoc {
  uid: string; // Firebase Auth UID
  email: string;
  tenantId: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Firestore Indexes

**For quota queries:**
```
Composite Index 1: usage_logs
- tenantId (ascending)
- createdAt (descending)

Composite Index 2: usage_logs
- userId (ascending)
- createdAt (descending)

Composite Index 3: usage_logs
- tenantId (ascending)
- userId (ascending)
- createdAt (descending)
```

### Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserTenantId() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenantId;
    }

    function isTenantMember(tenantId) {
      return isAuthenticated() && getUserTenantId() == tenantId;
    }

    // Tenants
    match /tenants/{tenantId} {
      allow read: if isTenantMember(tenantId);
      allow create: if isAuthenticated();
      allow update: if isTenantMember(tenantId);
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() &&
                     (request.auth.uid == userId ||
                      isTenantMember(resource.data.tenantId));
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
    }

    // Usage Logs
    match /usage_logs/{logId} {
      allow read: if isTenantMember(resource.data.tenantId);
      allow create: if isAuthenticated(); // Server-side only in practice
    }

    // Feature Flags
    match /feature_flags/{flagName} {
      allow read: if isAuthenticated();
      allow write: if false; // Admin SDK only
    }
  }
}
```

---

## API Changes

### Before (Prisma):
```typescript
import { prisma } from '@kimuntupro/db';

await prisma.usageLog.create({
  data: {
    tenantId,
    userId,
    model,
    tokensIn,
    tokensOut,
    costCents,
  },
});

const totalTokens = await prisma.usageLog.aggregate({
  where: {
    userId,
    createdAt: { gte: startOfDay },
  },
  _sum: {
    tokensIn: true,
    tokensOut: true,
  },
});
```

### After (Firebase):
```typescript
import { db, recordUsage, sumTokensByUser } from '@kimuntupro/db';

// Record usage
await recordUsage({
  tenantId,
  userId,
  model,
  tokensIn,
  tokensOut,
  costCents,
  latencyMs,
  toolInvocations: {},
});

// Sum tokens for quota check
const totalTokens = await sumTokensByUser(userId, startOfDay);
```

**Implementation in `packages/db/src/firebase/usage.ts`:**
```typescript
import { db, Timestamp } from './client';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

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
  return snapshot.docs.reduce(
    (sum, doc) => sum + doc.data().tokensIn + doc.data().tokensOut,
    0
  );
}
```

---

## Benefits of Firebase Migration

### ✅ Advantages

1. **Unified Stack**
   - Already using Firebase Auth
   - One provider for all services
   - Simplified infrastructure

2. **No Server Management**
   - No PostgreSQL server to maintain
   - No connection pool management
   - Auto-scaling included

3. **Real-time Capabilities**
   - Live updates for usage dashboards
   - Real-time feature flag changes
   - Instant quota updates

4. **Cost Efficiency (for Alpha)**
   - Free tier: 50K reads/day, 20K writes/day
   - No database server costs
   - Pay-as-you-go scaling

5. **Built-in Security**
   - Row-level security via Firestore rules
   - Automatic Firebase Auth integration
   - Client-side enforcement

6. **Global Distribution**
   - Multi-region replication
   - Edge caching
   - Low latency worldwide

---

## Challenges & Trade-offs

### ⚠️ Disadvantages

1. **No Vector Search**
   - Must use third-party service (Algolia, Pinecone)
   - Additional cost and complexity
   - Extra integration layer

2. **Limited Query Capabilities**
   - No SQL joins
   - No complex aggregations
   - Requires denormalization

3. **Transaction Limitations**
   - Max 500 documents per transaction
   - Cross-collection queries limited
   - No distributed transactions

4. **Cost at Scale**
   - Read/write pricing can add up
   - No bulk operations discount
   - Expensive for analytics workloads

5. **Vendor Lock-in**
   - Harder to migrate away from Firebase
   - Proprietary APIs and SDKs
   - Data export complexity

6. **Debugging**
   - No SQL query logs
   - Limited performance insights
   - Harder to troubleshoot

---

## Migration Steps (Phase 1 - Detailed)

### Step 1: Set Up Firebase SDK in Workspace

```bash
# Install Firebase SDK in db package
cd packages/db
npm install firebase firebase-admin

# Install types
npm install -D @types/firebase
```

### Step 2: Create Firebase Client

**File: `packages/db/src/firebase/client.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
export const auth = getAuth(app);
```

### Step 3: Implement Usage Functions

**File: `packages/db/src/firebase/usage.ts`**
```typescript
import { db } from './client';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
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

### Step 4: Update Package Exports

**File: `packages/db/src/index.ts`**
```typescript
// Export Firebase functions (replaces Prisma exports)
export * from './firebase/client';
export * from './firebase/usage';
export * from './firebase/tenants';
export * from './firebase/users';
```

### Step 5: Update ai-core to Use New Functions

**No changes needed!** The function signatures remain the same:
- `recordUsage()`
- `sumTokensByUser()`
- `sumTokensByTenant()`

### Step 6: Test Migration

```bash
# Test usage recording
npm run test -- usage

# Test quota checks
npm run test -- quota

# Integration test with API
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"assistant":"streamlined_plan","input":"test","tenantId":"demo","userId":"test"}'

# Verify in Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/firestore
```

### Step 7: Remove PostgreSQL Dependencies

```bash
# Remove Prisma
cd packages/db
npm uninstall prisma @prisma/client

# Delete Prisma files
rm -rf prisma/

# Update package.json
# Remove all db:* scripts related to Prisma
```

---

## Testing Strategy

### Unit Tests
```typescript
// packages/db/tests/firebase/usage.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { recordUsage, sumTokensByUser } from '../../src/firebase/usage';

describe('Firebase Usage Tracking', () => {
  beforeEach(async () => {
    // Set up Firebase emulator
  });

  afterEach(async () => {
    // Clean up test data
  });

  it('should record usage', async () => {
    await recordUsage({
      tenantId: 'test-tenant',
      userId: 'test-user',
      assistant: 'streamlined_plan',
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 200,
      costCents: 5,
      latencyMs: 1000,
      toolInvocations: {},
    });

    const total = await sumTokensByUser('test-user', new Date(0));
    expect(total).toBe(300);
  });
});
```

### Integration Tests
```typescript
// e2e/firebase-migration.spec.ts
import { test, expect } from '@playwright/test';

test('usage tracking works with Firebase', async ({ request }) => {
  const response = await request.post('/api/ai/answer', {
    data: {
      assistant: 'streamlined_plan',
      input: 'test query',
      tenantId: 'test-tenant',
      userId: 'test-user',
    },
  });

  expect(response.status()).toBe(200);

  // Verify usage was logged to Firebase
  // (check via Admin SDK or Firestore emulator)
});
```

---

## Rollback Plan

If migration issues arise:

1. **Keep PostgreSQL running during Phase 1**
2. **Dual-write:** Write to both Firebase and PostgreSQL
3. **Feature flag:** `USE_FIREBASE_DB` to toggle between systems
4. **Monitor:** Compare results from both databases
5. **Rollback:** Set `USE_FIREBASE_DB=false` to revert

```typescript
// Dual-write implementation
export async function recordUsage(row: UsageRow): Promise<void> {
  if (process.env.USE_FIREBASE_DB === 'true') {
    await recordUsageFirebase(row);
  } else {
    await recordUsagePrisma(row);
  }

  // Optional: Dual-write for comparison
  if (process.env.DUAL_WRITE === 'true') {
    await Promise.all([
      recordUsageFirebase(row),
      recordUsagePrisma(row),
    ]);
  }
}
```

---

## Cost Estimation

### PostgreSQL (Current):
- **Development:** Free (local)
- **Production:** $20-50/month (managed instance)

### Firebase (Target):
- **Spark Plan (Free Tier):**
  - 50K document reads/day
  - 20K document writes/day
  - 1GB storage
  - **Cost:** $0/month

- **Blaze Plan (Pay-as-you-go):**
  - $0.06 per 100K reads
  - $0.18 per 100K writes
  - $0.02 per GB/month storage
  - **Estimated for Alpha:** $5-10/month

### Vector Search (Phase 4):
- **Algolia:** ~$30-100/month
- **Pinecone:** ~$70/month (starter)
- **Weaviate:** Self-hosted (free) or Cloud ($25+/month)

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Core Services | 2-3 days | 🔲 Not Started |
| Phase 2: User/Tenant | 1 day | 🔲 Not Started |
| Phase 3: Feature Flags | 0.5 days | 🔲 Not Started |
| Phase 4: RAG System | 4-5 days | 🔲 Future |
| **Total (Phases 1-3)** | **4-5 days** | - |

---

## Decision Points

### ✅ Approved for Migration:
- [x] Usage tracking (UsageLog)
- [x] User metadata
- [x] Tenant management
- [x] Feature flags (via Remote Config)

### ⏸️ Deferred to Beta:
- [ ] RAG system (Document, Chunk, Embedding)
- [ ] Vector search integration
- [ ] Advanced analytics

### ❓ Pending Decision:
- [ ] Which vector search service? (Algolia vs Pinecone vs Weaviate)
- [ ] Dual-write period duration?
- [ ] Keep PostgreSQL as backup?

---

## Success Criteria

Migration is complete when:

✅ All usage logs write to Firestore
✅ Quota checks query Firestore successfully
✅ No PostgreSQL dependencies in package.json
✅ All tests pass with Firebase
✅ API performance is equal or better
✅ Firebase Console shows correct data structure
✅ Firestore security rules are tested and enforced
✅ Cost is within budget ($10/month for Alpha)

---

## Next Actions

1. **Review this plan** with team
2. **Approve** Phase 1 scope
3. **Set up Firebase emulator** for local development
4. **Begin** Step 1: Set up Firebase SDK
5. **Create** migration branch: `feature/firebase-migration`

---

**Status:** Ready for Implementation
**Blockers:** None
**Risk Level:** Low (for Phases 1-3), Medium (for Phase 4)
