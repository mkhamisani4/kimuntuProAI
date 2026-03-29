# AI Website Builder - Implementation Plan

**Project:** KimuntuPro AI - Business Track
**Feature:** AI Website Builder
**Version:** 1.0
**Last Updated:** 2025-01-14

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Codebase Analysis](#2-codebase-analysis)
3. [Architecture Overview](#3-architecture-overview)
4. [Backend Design](#4-backend-design)
5. [Frontend Design](#5-frontend-design)
6. [AI Prompting Design](#6-ai-prompting-design)
7. [Phased Implementation Plan](#7-phased-implementation-plan)
8. [Security & Best Practices](#8-security--best-practices)
9. [Dependencies & Configuration](#9-dependencies--configuration)
10. [Timeline & Milestones](#10-timeline--milestones)

---

## 1. Executive Summary

### 1.1 Feature Overview

The AI Website Builder enables users to generate professional one-page marketing websites using AI (Claude Sonnet 4.5). The feature supports two distinct modes:

- **Business Plan Mode:** Users who have generated a business plan can convert it into a website. AI can auto-complete any empty wizard fields using business plan context.
- **No-Plan Mode:** Users without a business plan must fill all required fields manually. No AI auto-completion is allowed for initial content.

### 1.2 Key Capabilities

- Multi-step wizard (6 steps) for collecting website requirements
- Asynchronous background generation (users can navigate away)
- Multiple websites per business
- Live preview with sandboxed HTML rendering
- Logo upload to Firebase Storage
- Export functionality (download HTML)
- Integration with existing Business Track business plans
- Future-ready for AI-powered editing via chat

### 1.3 Technical Approach

- **Database:** Firestore `websites` collection
- **AI Model:** Claude Sonnet 4.5 (Anthropic API)
- **Output Format:** Pure HTML with Tailwind CSS CDN
- **Asset Storage:** Firebase Storage for logos
- **Architecture:** Follows existing KimuntuPro patterns (API routes, quota middleware, Firestore persistence)

---

## 2. Codebase Analysis

### 2.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Firebase Firestore (NoSQL) |
| Storage | Firebase Storage |
| AI Provider | Anthropic (Claude Sonnet 4.5) |
| Authentication | Firebase Auth |
| Testing | Vitest, Playwright |
| Monorepo | npm workspaces |

### 2.2 Existing Packages

```
packages/
├── ai-core/          # AI orchestration (planner/executor, LLM client)
├── db/               # Firebase/Firestore persistence layer
├── shared/           # Shared TypeScript types and Zod schemas
└── rag-core/         # RAG retrieval system
```

### 2.3 Key Integration Points

**Business Plans:**
- Stored in `assistant_results` collection (`assistant: 'streamlined_plan'`)
- Contains structured sections (Problem, Solution, Market, etc.)
- Can be loaded via `getAssistantResult(resultId)`

**Existing Patterns:**
- Dedicated pages per assistant: `/dashboard/business/{assistant}`
- Results saved to Firestore with `tenantId`, `userId`, metadata
- Recent Activity component shows saved results
- API routes use `withQuotaGuard` middleware for rate limiting
- Usage tracked in `usage` collection

**Components to Extend:**
- `ResultViewer.tsx` - Add "Turn into website" button
- `RecentActivity.tsx` - Pattern for listing saved items
- Business dashboard (`/dashboard/business`) - Add "Recent Websites" section

---

## 3. Architecture Overview

### 3.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Website Wizard │  │ Websites List  │  │ Preview Page │  │
│  │  (6 steps)     │  │  (table/grid)  │  │  (sandbox)   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js Routes)                │
├─────────────────────────────────────────────────────────────┤
│  POST /api/websites/generate      GET /api/websites         │
│  GET  /api/websites/[id]          DELETE /api/websites/[id] │
│                                                               │
│  Middleware: withQuotaGuard (rate limiting)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic (@kimuntupro/ai-core)       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │ generateWebsite()                                    │   │
│  │  - Build prompts (plan mode vs no-plan mode)        │   │
│  │  - Call Claude Sonnet 4.5                           │   │
│  │  - Parse structured JSON response                   │   │
│  │  - Return: completedInput, siteSpec, siteCode       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Persistence Layer (@kimuntupro/db)          │
├─────────────────────────────────────────────────────────────┤
│  Firestore Collections:                                      │
│  - websites (main data)                                      │
│  - assistant_results (business plans)                        │
│  - usage (token tracking)                                    │
│                                                               │
│  Firebase Storage:                                           │
│  - /logos/{tenantId}/{websiteId}/{filename}                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

**Website Creation Flow (No-Plan Mode):**
```
User fills wizard → POST /api/websites/generate → Create draft →
Background: Call Claude → Parse response → Update Firestore →
User polls GET /api/websites/[id] → Status: ready → Navigate to preview
```

**Website Creation Flow (Business-Plan Mode):**
```
User clicks "Turn into website" on business plan → Load wizard with planId →
User optionally fills fields → POST /api/websites/generate (with planId) →
Background: Load business plan + Call Claude with plan context →
Claude fills missing fields → Generate website → Update Firestore →
User polls status → Preview generated site
```

---

## 4. Backend Design

### 4.1 Database Schema

#### Firestore Collection: `websites`

```typescript
interface Website {
  // === Identifiers ===
  id: string;                    // Firestore auto-generated document ID
  tenantId: string;              // Multi-tenancy support
  userId: string;                // Creator user ID

  // === Business Plan Association ===
  businessPlanId: string | null; // Reference to assistant_results doc ID
  hasPlanAttached: boolean;      // True if created from business plan

  // === Wizard Input ===
  wizardInput: WizardInput;      // Raw user-provided data
  completedInput: WizardInput | null; // AI-completed (plan mode only)

  // === Generated Output ===
  siteSpec: SiteSpec | null;     // Internal structured representation
  siteCode: string | null;       // Renderable HTML string

  // === Metadata ===
  title: string;                 // Website label (e.g., "Acme Corp Website")
  status: 'draft' | 'generating' | 'ready' | 'failed';
  errorMessage: string | null;   // Error details if failed

  // === AI Metadata ===
  generationMetadata: {
    model: string;               // "claude-sonnet-4.5"
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
    generatedAt: Date;
  } | null;

  // === Timestamps ===
  createdAt: Date;               // Firestore Timestamp
  updatedAt: Date;               // Firestore Timestamp
}
```

#### Type Definitions

**Location:** `packages/shared/src/types.ts`

```typescript
// ============================================================================
// WEBSITE BUILDER TYPES
// ============================================================================

/**
 * Wizard input data structure (6 steps)
 */
export interface WizardInput {
  // Step 1: Brand Basics
  companyName?: string;
  tagline?: string;
  brandVoice?: 'professional' | 'casual' | 'luxury' | 'playful' | 'friendly';
  logoUrl?: string | null;       // Firebase Storage URL or null

  // Step 2: Business Overview
  shortDescription?: string;     // 1-2 sentences
  aboutUs?: string;              // Paragraph
  industry?: string;
  keyServices?: string[];        // Array of services/offerings

  // Step 3: Hero & CTA
  heroHeadline?: string;
  heroSubheadline?: string;
  primaryCtaText?: string;       // e.g., "Book a free consult"
  mainGoal?: 'consult' | 'buy' | 'signup' | 'contact' | 'learn_more';

  // Step 4: Sections & Layout
  enabledSections: {
    features: boolean;
    services: boolean;
    about: boolean;
    testimonials: boolean;
    pricing: boolean;
    faq: boolean;
    contact: boolean;
  };
  layoutStyle?: 'minimal' | 'modern' | 'bold' | 'playful';

  // Step 5: Contact & Social
  contactEmail?: string;
  contactPhone?: string;
  location?: string;             // City/region
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };

  // Step 6: Visual Style
  colorTheme?: string;           // e.g., "emerald", "blue", "purple", "ai_choose"
  fontStyle?: string;            // e.g., "modern", "classic", "playful", "ai_choose"
}

/**
 * Generated site specification (internal structured representation)
 */
export interface SiteSpec {
  meta: {
    title: string;               // Page <title>
    description: string;         // SEO meta description
  };

  branding: {
    companyName: string;
    tagline: string;
    logoUrl: string | null;
    brandVoice: string;
  };

  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaAction: string;           // e.g., "#contact", "mailto:...", URL
  };

  sections: SiteSection[];

  contact: {
    email?: string;
    phone?: string;
    location?: string;
  };

  social: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };

  styling: {
    colorPalette: {
      primary: string;           // Hex color
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fontFamily: {
      heading: string;
      body: string;
    };
  };
}

/**
 * Individual website section
 */
export interface SiteSection {
  id: string;                    // e.g., "features", "services", "about"
  title: string;
  content: Record<string, any>;  // Flexible structure per section type
  order: number;                 // Display order
}

/**
 * Website generation request payload
 */
export interface WebsiteGenerationRequest {
  tenantId: string;
  userId: string;
  businessPlanId?: string | null;
  wizardInput: WizardInput;
}

/**
 * Website generation response
 */
export interface WebsiteGenerationResponse {
  success: true;
  websiteId: string;
  status: 'generating' | 'ready' | 'failed';
  message: string;
}
```

### 4.2 Database Functions

**Location:** `packages/db/src/firebase/websites.ts`

```typescript
import {
  db,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from './client.js';

export interface Website {
  id?: string;
  tenantId: string;
  userId: string;
  businessPlanId: string | null;
  hasPlanAttached: boolean;
  wizardInput: any;
  completedInput: any | null;
  siteSpec: any | null;
  siteCode: string | null;
  title: string;
  status: 'draft' | 'generating' | 'ready' | 'failed';
  errorMessage: string | null;
  generationMetadata: any | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create new website (draft)
 */
export async function createWebsite(
  website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'websites'), {
      ...website,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Created website: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to create website:', error);
    throw error;
  }
}

/**
 * Get website by ID
 */
export async function getWebsite(websiteId: string): Promise<Website | null> {
  try {
    const docRef = doc(db, 'websites', websiteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Website;
  } catch (error: any) {
    console.error('[Firestore] Failed to get website:', error);
    throw error;
  }
}

/**
 * Update website (for generation completion)
 */
export async function updateWebsite(
  websiteId: string,
  updates: Partial<Website>
): Promise<void> {
  try {
    const docRef = doc(db, 'websites', websiteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Updated website: ${websiteId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to update website:', error);
    throw error;
  }
}

/**
 * List websites for a tenant/user
 */
export async function listWebsites(
  tenantId: string,
  userId?: string,
  limitCount: number = 20
): Promise<Website[]> {
  try {
    let q = query(
      collection(db, 'websites'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (userId) {
      q = query(
        collection(db, 'websites'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const websites = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Website;
    });

    console.log(`[Firestore] Fetched ${websites.length} websites for tenant ${tenantId}`);
    return websites;
  } catch (error: any) {
    console.error('[Firestore] Failed to list websites:', error);
    throw error;
  }
}

/**
 * Delete website
 */
export async function deleteWebsite(websiteId: string): Promise<void> {
  try {
    const docRef = doc(db, 'websites', websiteId);
    await deleteDoc(docRef);

    console.log(`[Firestore] Deleted website: ${websiteId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete website:', error);
    throw error;
  }
}
```

**Export from:** `packages/db/src/index.ts`

```typescript
// Add to existing exports
export {
  createWebsite,
  getWebsite,
  updateWebsite,
  listWebsites,
  deleteWebsite,
  type Website,
} from './firebase/websites.js';
```

### 4.3 Firebase Storage Functions

**Location:** `packages/db/src/firebase/storage.ts` (NEW)

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './client.js';

const storage = getStorage(app);

/**
 * Upload logo to Firebase Storage
 *
 * @param file - File object from form input
 * @param tenantId - Tenant ID
 * @param websiteId - Website ID (for folder organization)
 * @returns Download URL
 */
export async function uploadLogo(
  file: File,
  tenantId: string,
  websiteId: string
): Promise<string> {
  try {
    // Create storage path: /logos/{tenantId}/{websiteId}/{filename}
    const storageRef = ref(storage, `logos/${tenantId}/${websiteId}/${file.name}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(`[Storage] Uploaded logo: ${downloadURL}`);
    return downloadURL;
  } catch (error: any) {
    console.error('[Storage] Failed to upload logo:', error);
    throw error;
  }
}

/**
 * Delete logo from Firebase Storage
 *
 * @param logoUrl - Full download URL of the logo
 */
export async function deleteLogo(logoUrl: string): Promise<void> {
  try {
    // Extract path from URL
    const urlObj = new URL(logoUrl);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new Error('Invalid logo URL format');
    }

    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);

    await deleteObject(storageRef);

    console.log(`[Storage] Deleted logo: ${path}`);
  } catch (error: any) {
    console.error('[Storage] Failed to delete logo:', error);
    throw error;
  }
}
```

**Export from:** `packages/db/src/index.ts`

```typescript
export {
  uploadLogo,
  deleteLogo,
} from './firebase/storage.js';
```

### 4.4 API Endpoints

#### POST `/app/api/websites/generate/route.ts`

**Purpose:** Initiate website generation (creates draft + kicks off async generation)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createWebsite, updateWebsite, getAssistantResult } from '@kimuntupro/db';
import { generateWebsite } from '@kimuntupro/ai-core';
import { recordUsage } from '@kimuntupro/db';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import type { WebsiteGenerationRequest } from '@kimuntupro/shared';

/**
 * Background generation function (fire-and-forget)
 */
async function generateWebsiteInBackground(
  websiteId: string,
  tenantId: string,
  userId: string,
  wizardInput: any,
  businessPlanId: string | null
): Promise<void> {
  const startTime = Date.now();

  try {
    // Load business plan if businessPlanId exists
    let businessPlan = null;
    if (businessPlanId) {
      businessPlan = await getAssistantResult(businessPlanId);
      if (!businessPlan) {
        throw new Error('Business plan not found');
      }
    }

    // Call Claude to generate website
    const result = await generateWebsite({
      wizardInput,
      businessPlan,
      hasPlanAttached: !!businessPlanId,
    });

    // Update website document with results
    await updateWebsite(websiteId, {
      completedInput: result.completedInput,
      siteSpec: result.siteSpec,
      siteCode: result.siteCode,
      status: 'ready',
      generationMetadata: {
        model: result.model,
        tokensUsed: result.tokensUsed,
        latencyMs: Date.now() - startTime,
        costCents: result.costCents,
        generatedAt: new Date(),
      },
    });

    // Record usage
    await recordUsage({
      tenantId,
      userId,
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costCents: result.costCents,
      latencyMs: Date.now() - startTime,
      assistantType: null, // or create new type 'website_builder'
      toolInvocations: { retrieval: 0, webSearch: 0, finance: 0 },
    });

    console.log(`[WebsiteGeneration] Successfully generated website: ${websiteId}`);
  } catch (error: any) {
    console.error(`[WebsiteGeneration] Failed for website ${websiteId}:`, error);

    await updateWebsite(websiteId, {
      status: 'failed',
      errorMessage: error.message || 'Unknown error during generation',
    });
  }
}

/**
 * Handle POST request to /api/websites/generate
 */
async function handleGenerate(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();
    const { tenantId, userId, businessPlanId, wizardInput } = body as WebsiteGenerationRequest;

    // Validate required fields
    if (!tenantId || !userId || !wizardInput) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate title
    const title = wizardInput.companyName
      ? `${wizardInput.companyName} Website`
      : 'Untitled Website';

    // Create website document with draft status
    const websiteId = await createWebsite({
      tenantId,
      userId,
      businessPlanId: businessPlanId || null,
      hasPlanAttached: !!businessPlanId,
      wizardInput,
      completedInput: null,
      siteSpec: null,
      siteCode: null,
      title,
      status: 'draft',
      errorMessage: null,
      generationMetadata: null,
    });

    // Update status to generating
    await updateWebsite(websiteId, { status: 'generating' });

    // Kick off background generation (fire-and-forget)
    generateWebsiteInBackground(
      websiteId,
      tenantId,
      userId,
      wizardInput,
      businessPlanId || null
    ).catch((err) => {
      console.error('[API] Background generation promise rejected:', err);
    });

    // Return immediately
    return NextResponse.json({
      success: true,
      websiteId,
      status: 'generating',
      message: 'Website generation started. You can navigate away.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API] Generate route error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to start website generation',
      },
      { status: 500 }
    );
  }
}

// Export POST handler with quota guard
export const POST = withQuotaGuard(handleGenerate, { for: 'executor' });
```

#### GET `/app/api/websites/[id]/route.ts`

**Purpose:** Fetch a single website by ID

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getWebsite } from '@kimuntupro/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const websiteId = params.id;

    const website = await getWebsite(websiteId);

    if (!website) {
      return NextResponse.json(
        { error: 'not_found', message: 'Website not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, website }, { status: 200 });

  } catch (error: any) {
    console.error('[API] Get website error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to fetch website',
      },
      { status: 500 }
    );
  }
}
```

#### GET `/app/api/websites/route.ts`

**Purpose:** List websites for a tenant/user

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { listWebsites } from '@kimuntupro/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId is required' },
        { status: 400 }
      );
    }

    const websites = await listWebsites(tenantId, userId, limit);

    return NextResponse.json({ success: true, websites }, { status: 200 });

  } catch (error: any) {
    console.error('[API] List websites error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to list websites',
      },
      { status: 500 }
    );
  }
}
```

#### DELETE `/app/api/websites/[id]/route.ts`

**Purpose:** Delete a website

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { deleteWebsite, getWebsite, deleteLogo } from '@kimuntupro/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const websiteId = params.id;

    // Get website to check if it has a logo
    const website = await getWebsite(websiteId);

    if (!website) {
      return NextResponse.json(
        { error: 'not_found', message: 'Website not found' },
        { status: 404 }
      );
    }

    // Delete logo from storage if exists
    if (website.wizardInput?.logoUrl) {
      try {
        await deleteLogo(website.wizardInput.logoUrl);
      } catch (err) {
        console.warn('[API] Failed to delete logo, continuing with website deletion:', err);
      }
    }

    // Delete website document
    await deleteWebsite(websiteId);

    return NextResponse.json(
      { success: true, message: 'Website deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[API] Delete website error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to delete website',
      },
      { status: 500 }
    );
  }
}
```

#### POST `/app/api/websites/upload-logo/route.ts`

**Purpose:** Upload logo to Firebase Storage

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadLogo } from '@kimuntupro/db';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string;
    const websiteId = formData.get('websiteId') as string;

    if (!file || !tenantId || !websiteId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing file, tenantId, or websiteId' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Invalid file type. Only images allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'File too large. Max size is 5MB.' },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const logoUrl = await uploadLogo(file, tenantId, websiteId);

    return NextResponse.json({ success: true, logoUrl }, { status: 200 });

  } catch (error: any) {
    console.error('[API] Upload logo error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to upload logo',
      },
      { status: 500 }
    );
  }
}

// Increase max file size for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

---

## 5. Frontend Design

### 5.1 Routes & Pages

#### **Route: `/app/dashboard/business/website-builder/page.tsx`**

**Purpose:** Website Builder landing page + websites list

**Features:**
- Header with title and description
- "Create New Website" button (no-plan mode)
- Websites list (table or card grid)
- Status badges (generating, ready, failed)
- Actions: Preview, Regenerate, Delete
- Empty state if no websites exist

**Implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Globe, Plus, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Website {
  id: string;
  title: string;
  status: 'draft' | 'generating' | 'ready' | 'failed';
  createdAt: Date;
  errorMessage: string | null;
}

export default function WebsiteBuilderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = 'demo-tenant';
  const userId = user?.uid;

  // Fetch websites
  useEffect(() => {
    if (!userId) return;

    fetchWebsites();

    // Poll every 3 seconds for generating websites
    const interval = setInterval(() => {
      if (websites.some(w => w.status === 'generating')) {
        fetchWebsites();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/websites?tenantId=${tenantId}&userId=${userId}`);
      const data = await res.json();

      if (data.success) {
        setWebsites(data.websites.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
        })));
        setError(null);
      } else {
        setError(data.message || 'Failed to load websites');
      }
    } catch (err: any) {
      setError('Failed to load websites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const res = await fetch(`/api/websites/${websiteId}`, { method: 'DELETE' });
      if (res.ok) {
        setWebsites(websites.filter(w => w.id !== websiteId));
      } else {
        alert('Failed to delete website');
      }
    } catch (err) {
      alert('Failed to delete website');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Ready
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                AI Website Builder
              </h1>
              <p className="text-lg text-gray-600">
                Professional websites with AI-powered design
              </p>
            </div>
            <Link
              href="/dashboard/business/website-builder/wizard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Website
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && websites.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600">Loading websites...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && websites.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Globe className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No websites yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first AI-powered website to get started!
            </p>
            <Link
              href="/dashboard/business/website-builder/wizard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Website
            </Link>
          </div>
        )}

        {/* Websites List */}
        {websites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {websites.map((website) => (
                  <tr key={website.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-8 h-8 text-emerald-500" />
                        <div>
                          <div className="font-medium text-gray-900">{website.title}</div>
                          {website.errorMessage && (
                            <div className="text-xs text-red-600 mt-1">{website.errorMessage}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(website.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {website.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {website.status === 'ready' && (
                          <Link
                            href={`/dashboard/business/website-builder/preview/${website.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded hover:bg-emerald-200 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Preview
                          </Link>
                        )}
                        {website.status === 'generating' && (
                          <Link
                            href={`/dashboard/business/website-builder/preview/${website.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded"
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            View Status
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(website.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### **Route: `/app/dashboard/business/website-builder/wizard/page.tsx`**

**Purpose:** Multi-step wizard for creating websites

**Features:**
- 6 steps with progress bar
- Conditional validation (plan mode vs no-plan mode)
- Back/Next navigation
- URL parameter `?planId={id}` for business-plan mode
- Final step submits to `/api/websites/generate`

**Implementation:** (See Phase 2 for detailed component breakdown)

#### **Route: `/app/dashboard/business/website-builder/preview/[id]/page.tsx`**

**Purpose:** Preview generated website with sandboxed rendering

**Features:**
- Metadata header (title, status, actions)
- Loading state with polling (status === 'generating')
- Sandboxed iframe rendering
- Export functionality
- Delete button

**Implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import DOMPurify from 'dompurify';

interface Website {
  id: string;
  title: string;
  status: 'draft' | 'generating' | 'ready' | 'failed';
  siteCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
}

export default function PreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const websiteId = params.id;

  // Fetch website
  useEffect(() => {
    fetchWebsite();

    // Poll every 2 seconds if generating
    const interval = setInterval(() => {
      if (website?.status === 'generating') {
        fetchWebsite();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [websiteId, website?.status]);

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/websites/${websiteId}`);
      const data = await res.json();

      if (data.success) {
        setWebsite({
          ...data.website,
          createdAt: new Date(data.website.createdAt),
        });
        setError(null);
      } else {
        setError(data.message || 'Failed to load website');
      }
    } catch (err: any) {
      setError('Failed to load website');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!website?.siteCode) return;

    const blob = new Blob([website.siteCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${website.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const res = await fetch(`/api/websites/${websiteId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/business/website-builder');
      } else {
        alert('Failed to delete website');
      }
    } catch (err) {
      alert('Failed to delete website');
      console.error(err);
    }
  };

  // Sanitize HTML
  const sanitizedHTML = website?.siteCode
    ? DOMPurify.sanitize(website.siteCode, {
        ALLOWED_TAGS: ['html', 'head', 'body', 'meta', 'title', 'link', 'style', 'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'svg', 'path', 'section', 'header', 'footer', 'nav', 'button', 'form', 'input', 'textarea', 'label'],
        ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title', 'type', 'placeholder', 'name', 'value', 'viewBox', 'd', 'fill', 'stroke'],
      })
    : '';

  if (loading && !website) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600">Loading website...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error || 'Website not found'}</p>
            <Link
              href="/dashboard/business/website-builder"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Websites
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/business/website-builder"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{website.title}</h1>
              <p className="text-sm text-gray-600">
                Created {website.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {website.status === 'ready' && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export HTML
              </button>
            )}
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Generating State */}
          {website.status === 'generating' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-emerald-500 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating your website...</h2>
              <p className="text-gray-600">
                This usually takes 30-60 seconds. Feel free to navigate away and come back later.
              </p>
            </div>
          )}

          {/* Failed State */}
          {website.status === 'failed' && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Generation Failed</h2>
              <p className="text-gray-600 mb-2">
                {website.errorMessage || 'An unknown error occurred during generation.'}
              </p>
              <button
                onClick={() => router.push('/dashboard/business/website-builder')}
                className="mt-4 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Websites
              </button>
            </div>
          )}

          {/* Ready State - Preview */}
          {website.status === 'ready' && website.siteCode && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <iframe
                sandbox="allow-same-origin"
                srcDoc={sanitizedHTML}
                className="w-full border-none"
                style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}
                title="Website Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Wizard Components

The wizard will be broken into reusable step components. See **Phase 2** in the implementation plan for detailed component structure.

**Key files:**
- `app/dashboard/business/website-builder/wizard/page.tsx` - Main wizard page
- `app/dashboard/business/website-builder/wizard/useWizardState.ts` - Custom hook for state management
- `app/dashboard/business/website-builder/wizard/WizardStep1BrandBasics.tsx` - Step 1
- `app/dashboard/business/website-builder/wizard/WizardStep2BusinessOverview.tsx` - Step 2
- `app/dashboard/business/website-builder/wizard/WizardStep3HeroCTA.tsx` - Step 3
- `app/dashboard/business/website-builder/wizard/WizardStep4Sections.tsx` - Step 4
- `app/dashboard/business/website-builder/wizard/WizardStep5Contact.tsx` - Step 5
- `app/dashboard/business/website-builder/wizard/WizardStep6Review.tsx` - Step 6

### 5.3 Integration with Business Plan Page

**File:** `app/dashboard/business/ai-assistant/ResultViewer.tsx`

**Change:** Add "Turn into a website using AI" button

```typescript
// Add to ResultViewerProps interface
interface ResultViewerProps {
  result: AssistantResult | null;
  isLoading?: boolean;
  error?: { message: string; type: string } | null;
  onRetry?: () => void;
  assistantType?: string;
  onConvertToWebsite?: (resultId: string) => void; // NEW
}

// Add to footer section (next to Export actions)
{onConvertToWebsite && result?.id && assistantType === 'streamlined_plan' && (
  <button
    onClick={() => onConvertToWebsite(result.id!)}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
  >
    <Globe className="w-4 h-4" />
    Turn into a website using AI →
  </button>
)}
```

**File:** `app/dashboard/business/streamlined-plan/page.tsx`

**Change:** Pass handler to ResultViewer

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleConvertToWebsite = (resultId: string) => {
  router.push(`/dashboard/business/website-builder/wizard?planId=${resultId}`);
};

<ResultViewer
  result={result}
  assistantType="streamlined_plan"
  onConvertToWebsite={handleConvertToWebsite}
  // ... other props
/>
```

---

## 6. AI Prompting Design

### 6.1 AI Integration Module

**Location:** `packages/ai-core/src/website/generator.ts`

```typescript
import { OpenAIClient } from '../llm/client.js';
import { parseStructured } from '../llm/structured.js';
import { getCostCents } from '../llm/costs.js';
import type { AssistantResult } from '@kimuntupro/shared';

export interface GenerateWebsiteParams {
  wizardInput: any;
  businessPlan: AssistantResult | null;
  hasPlanAttached: boolean;
}

export interface GenerateWebsiteResult {
  completedInput: any;
  siteSpec: any;
  siteCode: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  tokensUsed: number;
  costCents: number;
}

/**
 * Generate website using Claude Sonnet 4.5
 */
export async function generateWebsite(
  params: GenerateWebsiteParams
): Promise<GenerateWebsiteResult> {
  // Use Anthropic client instead of OpenAI
  // Note: You may need to add Anthropic SDK to ai-core package
  // For now, assuming OpenAIClient supports Anthropic models via compatible API

  const client = new OpenAIClient({
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
  });

  const systemPrompt = buildSystemPrompt();
  const userPrompt = params.hasPlanAttached
    ? buildPlanModePrompt(params.wizardInput, params.businessPlan!)
    : buildNoPlanModePrompt(params.wizardInput);

  try {
    const response = await client.chatStructured({
      model: 'claude-sonnet-4-5', // Or use appropriate model ID for your setup
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      responseFormat: { type: 'json_object' },
      maxTokens: 16000,
    });

    const parsed = parseStructured(response.content);

    // Validate response
    if (!parsed.completedInput || !parsed.siteSpec || !parsed.siteCode) {
      throw new Error('Invalid response from LLM: missing required fields');
    }

    const tokensUsed = response.usage.prompt_tokens + response.usage.completion_tokens;

    return {
      completedInput: parsed.completedInput,
      siteSpec: parsed.siteSpec,
      siteCode: parsed.siteCode,
      model: response.model,
      tokensIn: response.usage.prompt_tokens,
      tokensOut: response.usage.completion_tokens,
      tokensUsed,
      costCents: getCostCents(tokensUsed, response.model),
    };
  } catch (error: any) {
    console.error('[WebsiteGenerator] Failed to generate website:', error);
    throw new Error(`Website generation failed: ${error.message}`);
  }
}

/**
 * Build system prompt for website generation
 */
function buildSystemPrompt(): string {
  return `You are an expert web designer and developer. Your task is to generate a professional marketing website based on user input.

**Output Format:**
You must respond with a JSON object containing exactly three keys:
1. "completedInput": A complete WizardInput object with all fields filled (use user input + business plan if available)
2. "siteSpec": A SiteSpec object representing the internal structure of the website
3. "siteCode": A string containing complete, production-ready HTML code for the website

**HTML Requirements:**
- Use modern, responsive design with Tailwind CSS
- Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Ensure the HTML is valid, semantic, and accessible (WCAG AA)
- Use semantic HTML5 tags (header, nav, section, footer, etc.)
- Make the design clean, professional, and conversion-optimized
- Include meta tags for SEO (title, description, viewport)
- Ensure mobile-first responsive design
- Use smooth scroll behavior and professional animations

**Content Guidelines:**
- Do NOT use placeholder content like "lorem ipsum"
- Generate real, relevant content based on the business context
- Use professional, persuasive copywriting
- Ensure all sections are fully fleshed out with meaningful content
- For testimonials (if enabled), create 3-5 realistic testimonials
- For FAQs (if enabled), create 5-8 relevant questions and answers
- For pricing (if enabled), create 2-3 pricing tiers with features

**Styling Guidelines:**
- Use the specified color theme throughout the design
- Apply the specified font style consistently
- Ensure proper contrast ratios for accessibility
- Use whitespace effectively for visual hierarchy
- Include hover effects and transitions for interactive elements
- Make CTAs prominent and action-oriented

**Important:**
- Do NOT include any explanatory text outside the JSON object
- The entire response must be valid JSON
- The HTML in siteCode must be a complete, standalone document`;
}

/**
 * Build user prompt for business-plan mode
 */
function buildPlanModePrompt(wizardInput: any, businessPlan: AssistantResult): string {
  // Extract relevant sections from business plan
  const relevantSections = extractRelevantSections(businessPlan.sections);

  return `Generate a marketing website using the following inputs:

**Business Plan Context:**
${JSON.stringify(relevantSections, null, 2)}

**User-Provided Input:**
${JSON.stringify(wizardInput, null, 2)}

**Mode:** Business Plan Attached (AI auto-fill enabled)

**Task:**
1. Review the business plan to understand the business, target market, value proposition, and key offerings
2. Complete any missing fields in the user input using information from the business plan
3. Generate a complete site specification (siteSpec) that captures the website structure
4. Generate production-ready HTML code (siteCode) as a complete, standalone HTML document

**Rules:**
- For any field in wizardInput that is empty/undefined, infer appropriate content from the business plan
- If a field cannot be inferred from the business plan, generate reasonable professional content based on industry best practices
- For color/font choices marked "ai_choose", select appropriate options based on the brand voice and industry
- Ensure all content is consistent with the business plan and professionally written
- The siteCode must be complete HTML that can be rendered immediately without modifications
- Include all enabled sections from wizardInput.enabledSections
- Make the website conversion-focused with clear CTAs aligned with the mainGoal`;
}

/**
 * Build user prompt for no-plan mode
 */
function buildNoPlanModePrompt(wizardInput: any): string {
  return `Generate a marketing website using the following inputs:

**User-Provided Input:**
${JSON.stringify(wizardInput, null, 2)}

**Mode:** No Business Plan (No AI auto-fill for missing required fields)

**Task:**
1. Use ONLY the user-provided input - do not invent or assume missing information
2. Generate a complete site specification (siteSpec) based solely on the provided fields
3. Generate production-ready HTML code (siteCode) as a complete, standalone HTML document

**Rules:**
- All required fields should already be filled by the user
- Do NOT generate content for core business information that is missing (company name, description, etc.)
- Focus on structuring and presenting the user's content professionally
- For color/font choices, use the specified values exactly (no "ai_choose" should be present)
- The siteCode must be complete HTML that can be rendered immediately without modifications
- Include all enabled sections from wizardInput.enabledSections
- Make the website conversion-focused with clear CTAs aligned with the mainGoal
- If optional fields like testimonials or FAQs are enabled but no content provided, generate professional examples`;
}

/**
 * Extract relevant sections from business plan (reduce token usage)
 */
function extractRelevantSections(sections: Record<string, string>): Record<string, string> {
  const relevantKeys = [
    'Problem',
    'Solution',
    'Value Proposition',
    'Target Market',
    'Product/Service',
    'Competitive Advantage',
    'Market Opportunity',
    'Business Model',
  ];

  const extracted: Record<string, string> = {};

  for (const key of relevantKeys) {
    if (sections[key]) {
      // Summarize if too long (>500 words)
      const content = sections[key];
      if (content.split(/\s+/).length > 500) {
        extracted[key] = content.split(/\s+/).slice(0, 500).join(' ') + '...';
      } else {
        extracted[key] = content;
      }
    }
  }

  return extracted;
}
```

**Export from:** `packages/ai-core/src/index.ts`

```typescript
export {
  generateWebsite,
  type GenerateWebsiteParams,
  type GenerateWebsiteResult,
} from './website/generator.js';
```

### 6.2 Anthropic SDK Integration

**Note:** You may need to add the Anthropic SDK to `packages/ai-core`:

```bash
cd packages/ai-core
npm install @anthropic-ai/sdk
```

**Update `packages/ai-core/src/llm/client.ts`** to support Anthropic models, or create a separate client wrapper:

```typescript
// packages/ai-core/src/llm/anthropicClient.ts
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chatStructured(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
  }): Promise<any> {
    const response = await this.client.messages.create({
      model: params.model,
      max_tokens: params.maxTokens,
      messages: params.messages.filter(m => m.role !== 'system'),
      system: params.messages.find(m => m.role === 'system')?.content,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return {
      content: content.text,
      model: response.model,
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }
}
```

### 6.3 Guardrails & Token Management

**Strategies:**

1. **Business Plan Summarization:**
   - Extract only relevant sections (Problem, Solution, Target Market, etc.)
   - Limit each section to 500 words max
   - Skip financial projections and detailed metrics

2. **Strict JSON Output:**
   - Use structured output mode for Claude
   - Validate response schema before saving
   - Retry once if invalid JSON received

3. **HTML Size Limits:**
   - Limit generated HTML to ~50KB (reasonable for one-page sites)
   - Use Tailwind CDN instead of inline CSS
   - Optionally minify HTML before storing

4. **Error Handling:**
   - If LLM returns invalid JSON, retry with error feedback
   - If generation exceeds max tokens (16K), fail gracefully
   - If HTML is obviously broken (unclosed tags), retry

5. **Token Estimation:**
   - Estimate tokens before calling LLM
   - Block request if estimated > 16K

---

## 7. Phased Implementation Plan

### Phase 1: Data Model & Core API Endpoints

**Duration:** 3-5 days

**Goal:** Set up backend infrastructure without AI integration

**Tasks:**

1. **Create shared types** (`packages/shared/src/types.ts`)
   - Add `WizardInput`, `SiteSpec`, `SiteSection`, `Website` interfaces
   - Add `WebsiteGenerationRequest`, `WebsiteGenerationResponse` types
   - Export from `packages/shared/src/index.ts`

2. **Create Firestore persistence layer** (`packages/db/src/firebase/websites.ts`)
   - Implement `createWebsite`, `getWebsite`, `updateWebsite`, `listWebsites`, `deleteWebsite`
   - Export from `packages/db/src/index.ts`
   - Write unit tests (optional): `packages/db/src/firebase/__tests__/websites.test.ts`

3. **Create Firebase Storage functions** (`packages/db/src/firebase/storage.ts`)
   - Implement `uploadLogo`, `deleteLogo`
   - Export from `packages/db/src/index.ts`

4. **Create API route: POST `/app/api/websites/generate/route.ts`**
   - Request validation (Zod schema)
   - Create draft Website document
   - Update status to `'generating'`
   - Return websiteId immediately
   - Add placeholder for background generation (set status to `'ready'` for testing)
   - Apply `withQuotaGuard` middleware

5. **Create API route: GET `/app/api/websites/[id]/route.ts`**
   - Fetch Website by ID
   - Return 404 if not found

6. **Create API route: GET `/app/api/websites/route.ts`**
   - List websites for tenant/user
   - Support query params: `tenantId`, `userId`, `limit`

7. **Create API route: DELETE `/app/api/websites/[id]/route.ts`**
   - Delete website by ID
   - Delete associated logo from Firebase Storage

8. **Create API route: POST `/app/api/websites/upload-logo/route.ts`**
   - Handle file upload from wizard
   - Validate file type and size
   - Upload to Firebase Storage
   - Return download URL

**Files to create/modify:**
- `packages/shared/src/types.ts` (add types)
- `packages/db/src/firebase/websites.ts` (new)
- `packages/db/src/firebase/storage.ts` (new)
- `packages/db/src/index.ts` (export functions)
- `app/api/websites/generate/route.ts` (new)
- `app/api/websites/[id]/route.ts` (new)
- `app/api/websites/route.ts` (new)
- `app/api/websites/upload-logo/route.ts` (new)

**Testing:**
- Use Postman/cURL to test API endpoints
- Verify Firestore documents are created/updated correctly
- Test logo upload to Firebase Storage

---

### Phase 2: Wizard UI & Routing (No-Plan Mode First)

**Duration:** 5-7 days

**Goal:** Build multi-step wizard UI for no-plan mode (all fields required)

**Tasks:**

1. **Install dependencies**
   ```bash
   npm install dompurify @types/dompurify
   ```

2. **Create wizard page** (`app/dashboard/business/website-builder/wizard/page.tsx`)
   - Multi-step form with 6 steps
   - Progress bar showing current step
   - Back/Next navigation
   - Load business plan if `?planId={id}` present (for Phase 4)
   - Submit to `/api/websites/generate` on final step

3. **Create custom hook** (`app/dashboard/business/website-builder/wizard/useWizardState.ts`)
   - Manage current step, wizard input state
   - Validation logic (required fields in no-plan mode)
   - `canProceed(step)` function
   - Handle business plan loading (for Phase 4)

4. **Create progress bar component** (`components/ui/ProgressBar.tsx`)
   - Reusable component for step indicators
   - Show current step, total steps
   - Visual progress fill

5. **Create step components:**

   **Step 1: Brand Basics** (`wizard/WizardStep1BrandBasics.tsx`)
   - Company name (text input, required in no-plan)
   - Tagline (text input, optional)
   - Brand voice (dropdown: professional, casual, luxury, playful, friendly)
   - Logo upload (file input or "no logo" checkbox)
     - On file select, upload to `/api/websites/upload-logo`
     - Display preview
     - Store download URL in state

   **Step 2: Business Overview** (`wizard/WizardStep2BusinessOverview.tsx`)
   - Short description (textarea, 1-2 sentences, required)
   - About us (textarea, paragraph, optional)
   - Industry (text input or dropdown with common industries)
   - Key services (dynamic list input: add/remove services)

   **Step 3: Hero & CTA** (`wizard/WizardStep3HeroCTA.tsx`)
   - Hero headline (text input, required)
   - Hero subheadline (text input, optional)
   - Primary CTA text (text input, required, e.g., "Book a free consult")
   - Main goal (dropdown: consult, buy, signup, contact, learn_more)

   **Step 4: Sections & Layout** (`wizard/WizardStep4Sections.tsx`)
   - Section toggles (checkboxes for features, services, about, testimonials, pricing, faq, contact)
   - Layout style (card selection: minimal, modern, bold, playful)

   **Step 5: Contact & Social** (`wizard/WizardStep5Contact.tsx`)
   - Contact email (email input, required)
   - Contact phone (tel input, optional)
   - Location (text input, optional, city/region)
   - Social links (URL inputs for Instagram, LinkedIn, Twitter, Facebook)

   **Step 6: Visual Style & Review** (`wizard/WizardStep6Review.tsx`)
   - Color theme (color picker or predefined options: emerald, blue, purple, orange)
     - In plan mode: include "AI choose" option (Phase 4)
   - Font style (dropdown: modern, classic, playful, elegant)
     - In plan mode: include "AI choose" option (Phase 4)
   - Review summary: Show all entered values in collapsible sections
   - Edit buttons to jump back to specific steps
   - "Generate Website" button (disabled if validation fails)

6. **Form validation**
   - Implement field-level validation (email format, required fields)
   - Show inline error messages
   - Disable Next button if current step validation fails

7. **Generate website submission**
   - On "Generate Website" click, POST to `/api/websites/generate`
   - Show loading spinner
   - On success, navigate to `/dashboard/business/website-builder/preview/[websiteId]`
   - On error, show error message

8. **Update landing page** (`app/dashboard/business/website-builder/page.tsx`)
   - Replace "Coming Soon" with actual content
   - "Create New Website" button links to `/wizard`
   - Show empty state if no websites

**Files to create/modify:**
- `app/dashboard/business/website-builder/wizard/page.tsx` (new)
- `app/dashboard/business/website-builder/wizard/useWizardState.ts` (new)
- `app/dashboard/business/website-builder/wizard/WizardStep1BrandBasics.tsx` (new)
- `app/dashboard/business/website-builder/wizard/WizardStep2BusinessOverview.tsx` (new)
- `app/dashboard/business/website-builder/wizard/WizardStep3HeroCTA.tsx` (new)
- `app/dashboard/business/website-builder/wizard/WizardStep4Sections.tsx` (new)
- `app/dashboard/business/website-builder/wizard/WizardStep5Contact.tsx` (new)
- `app/dashboard/business/website-builder/wizard/WizardStep6Review.tsx` (new)
- `components/ui/ProgressBar.tsx` (new)
- `app/dashboard/business/website-builder/page.tsx` (update)

**Testing:**
- Manually test wizard flow (all 6 steps)
- Test validation (required fields, email format)
- Test logo upload (file selection, preview, upload to Storage)
- Test form submission to API
- Verify navigation and state persistence across steps

---

### Phase 3: Claude Integration & Background Generation

**Duration:** 4-6 days

**Goal:** Implement actual website generation using Claude Sonnet 4.5

**Tasks:**

1. **Install Anthropic SDK**
   ```bash
   cd packages/ai-core
   npm install @anthropic-ai/sdk
   ```

2. **Create Anthropic client wrapper** (`packages/ai-core/src/llm/anthropicClient.ts`)
   - Wrapper for Anthropic SDK
   - Compatible interface with existing `OpenAIClient`
   - Handle structured JSON responses

3. **Create website generator module** (`packages/ai-core/src/website/generator.ts`)
   - Implement `generateWebsite(params)` function
   - Build system and user prompts
   - Call Claude Sonnet 4.5 with structured output
   - Parse and validate JSON response
   - Return completedInput, siteSpec, siteCode

4. **Create prompt builders** (`packages/ai-core/src/website/prompts.ts`)
   - `buildSystemPrompt()`: System prompt for website generation
   - `buildNoPlanModePrompt(wizardInput)`: User prompt for no-plan mode
   - `buildPlanModePrompt(wizardInput, businessPlan)`: User prompt for plan mode
   - `extractRelevantSections(businessPlan)`: Reduce token usage

5. **Update `/app/api/websites/generate/route.ts`**
   - Replace placeholder with actual background generation
   - Implement `generateWebsiteInBackground()` function
   - Call `generateWebsite()` from ai-core
   - Update website document with results
   - Handle errors and update status to `'failed'`

6. **Add usage tracking**
   - Record token usage to Firestore `usage` collection after generation
   - Include model, tokens, cost, latency

7. **Add response validation**
   - Validate JSON structure from LLM
   - Check for required fields (completedInput, siteSpec, siteCode)
   - Validate HTML structure (basic checks: has `<html>`, `<body>`, no unclosed tags)
   - If invalid, retry once or fail gracefully

8. **Test generation**
   - Create test wizard input with minimal fields
   - Verify generated HTML is valid
   - Check Firestore updates (status transitions)
   - Verify usage tracking records

9. **Add error handling**
   - Handle API errors (rate limits, invalid API key, etc.)
   - Handle timeout (if generation takes >2 minutes)
   - Update website status to `'failed'` with error message

10. **Add environment variable**
    ```bash
    # .env.local
    ANTHROPIC_API_KEY=your-anthropic-api-key
    ```

**Files to create/modify:**
- `packages/ai-core/src/llm/anthropicClient.ts` (new)
- `packages/ai-core/src/website/generator.ts` (new)
- `packages/ai-core/src/website/prompts.ts` (new)
- `packages/ai-core/src/index.ts` (export generator)
- `app/api/websites/generate/route.ts` (update with real generation)
- `.env.local` (add ANTHROPIC_API_KEY)

**Testing:**
- End-to-end test: Create website via wizard → verify generation → check Firestore
- Test with various wizard inputs (minimal, full, edge cases)
- Test error handling (invalid API key, malformed response)
- Verify HTML output is valid and renderable

---

### Phase 4: Websites List, Preview Page, & Business Plan Integration

**Duration:** 5-7 days

**Goal:** Add websites list, preview page with sandboxed rendering, and business-plan mode

**Tasks:**

1. **Update websites list page** (`app/dashboard/business/website-builder/page.tsx`)
   - Fetch websites from `/api/websites?tenantId={tenantId}`
   - Display in table or card grid
   - Show status badges (generating with spinner, ready, failed)
   - Actions: Preview, Delete
   - Poll every 3 seconds for websites with status `'generating'`
   - Empty state: "No websites yet"

2. **Create preview page** (`app/dashboard/business/website-builder/preview/[id]/page.tsx`)
   - Fetch website from `/api/websites/[id]`
   - Loading state while `status === 'generating'` (poll every 2 seconds)
   - Display metadata: title, status, created date
   - **Sandboxed iframe** for rendering HTML:
     ```tsx
     <iframe
       sandbox="allow-same-origin"
       srcDoc={sanitizedHTML}
       className="w-full h-screen border-none"
     />
     ```
   - HTML sanitization using DOMPurify
   - Action buttons: Export HTML (download), Delete
   - Failed state: Show error message with retry option

3. **Add HTML sanitization**
   - Import DOMPurify in preview page
   - Sanitize `siteCode` before rendering:
     ```typescript
     const sanitizedHTML = DOMPurify.sanitize(website.siteCode, {
       ALLOWED_TAGS: ['html', 'head', 'body', 'meta', 'title', 'link', 'style', 'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'svg', 'path', 'section', 'header', 'footer', 'nav', 'button', 'form', 'input', 'textarea', 'label'],
       ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title', 'type', 'placeholder', 'name', 'value', 'viewBox', 'd', 'fill', 'stroke'],
     });
     ```

4. **Add business-plan mode to wizard**
   - Update `useWizardState` hook:
     - Check for `?planId={id}` URL parameter
     - Load business plan using `getAssistantResult(planId)`
     - Set `hasPlanAttached = true` if planId exists
   - Update validation:
     - Make all fields optional in plan mode
     - Show info banner: "Fields left blank will be filled by AI using your business plan"
   - Update Step 6:
     - Add "AI choose" option for color theme and font style (only in plan mode)

5. **Update Claude prompts for business-plan mode**
   - In `packages/ai-core/src/website/prompts.ts`:
     - Implement `buildPlanModePrompt(wizardInput, businessPlan)`
     - Extract relevant sections from business plan
     - Instruct Claude to fill missing fields from plan
     - Handle "ai_choose" options for colors and fonts

6. **Add "Turn into website" button to business plan results**
   - Update `app/dashboard/business/ai-assistant/ResultViewer.tsx`:
     - Add `onConvertToWebsite` prop
     - Render button in footer (only for `assistantType === 'streamlined_plan'`)
   - Update `app/dashboard/business/streamlined-plan/page.tsx`:
     - Pass handler that navigates to `/wizard?planId={resultId}`

7. **Implement delete functionality**
   - Add confirmation dialog before deleting
   - Call DELETE `/api/websites/[id]`
   - Delete logo from Firebase Storage
   - Refresh websites list

8. **Add export functionality**
   - "Export HTML" button downloads `siteCode` as `.html` file:
     ```typescript
     const blob = new Blob([siteCode], { type: 'text/html' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'website.html';
     a.click();
     ```

**Files to create/modify:**
- `app/dashboard/business/website-builder/page.tsx` (update with list)
- `app/dashboard/business/website-builder/preview/[id]/page.tsx` (new)
- `app/dashboard/business/website-builder/wizard/useWizardState.ts` (update for plan mode)
- `app/dashboard/business/website-builder/wizard/WizardStep6Review.tsx` (add AI choose options)
- `app/dashboard/business/ai-assistant/ResultViewer.tsx` (add convert button)
- `app/dashboard/business/streamlined-plan/page.tsx` (add handler)
- `packages/ai-core/src/website/prompts.ts` (add plan mode prompt)

**Testing:**
- Test websites list (loading, empty state, status badges, polling)
- Test preview page (iframe rendering, sanitization, loading/error states)
- Test business-plan mode:
  - Navigate from business plan → wizard
  - Verify planId loaded
  - Test AI auto-fill (leave fields blank)
  - Verify generated website uses plan context
- Test delete functionality (website + logo deletion)
- Test export (HTML download)

---

### Phase 5: UX Polish, Error Handling, & Optimizations

**Duration:** 4-6 days

**Goal:** Improve UX, handle edge cases, optimize performance

**Tasks:**

1. **Improve loading & error states**
   - Add skeleton loaders for websites list
   - Better error messages with actionable guidance
   - Retry button for failed generations
   - Toast notifications for success/error actions

2. **Add regenerate functionality**
   - Create POST `/app/api/websites/[id]/regenerate/route.ts`
   - Allow user to modify wizard input and regenerate
   - Reuse generation logic from `/generate` endpoint
   - Update website document with new output

3. **Optimize Claude prompts**
   - Test different prompt variations for better output
   - Add few-shot examples in system prompt
   - Reduce business plan context (only most relevant sections)
   - Fine-tune instructions for specific sections (testimonials, FAQs, etc.)

4. **Improve HTML sanitization**
   - Configure DOMPurify more permissively (allow safe inline styles)
   - Ensure Tailwind classes are preserved
   - Set CSP headers for preview iframe

5. **Add "Recent Websites" component**
   - Create `components/business/RecentWebsites.tsx`
   - Similar to `RecentActivity` component
   - Show last 3-5 websites with status and preview link
   - Add to `/dashboard/business/page.jsx`

6. **Add validation for wizard inputs**
   - Ensure URLs are valid (social links, etc.)
   - Limit text field lengths (e.g., tagline max 100 chars)
   - Show character counts for textareas

7. **Add rate limiting & quota management**
   - Ensure quota middleware is properly applied
   - Add frontend checks for quota limits
   - Show user-friendly error if quota exceeded

8. **Improve logo upload UX**
   - Show upload progress
   - Display image preview before upload
   - Allow removing/replacing logo
   - Handle upload errors gracefully

9. **Add usage analytics**
   - Track website generations in Firestore `usage` collection
   - Create new assistant type: `'website_builder'`
   - Display usage stats in admin dashboard (if exists)

10. **Write tests**
    - Unit tests for wizard validation logic
    - Unit tests for Firestore functions
    - Integration tests for API routes
    - E2E test: wizard flow → generation → preview (Playwright)

11. **Add Firestore indexes**
    - Create composite indexes for queries:
      - `websites` collection: `(tenantId, createdAt desc)`
      - `websites` collection: `(userId, createdAt desc)`
    - Add to `firestore.indexes.json` (if using Firestore CLI)

12. **Update Firestore Security Rules**
    ```javascript
    // firestore.rules
    match /websites/{websiteId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      resource.data.tenantId == request.auth.token.tenantId);
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;
    }
    ```

13. **Documentation**
    - Update README with Website Builder feature
    - Add developer docs for extending website templates
    - Document environment variables

**Files to create/modify:**
- `app/api/websites/[id]/regenerate/route.ts` (new)
- `components/business/RecentWebsites.tsx` (new)
- `app/dashboard/business/page.jsx` (add RecentWebsites)
- `packages/ai-core/src/website/prompts.ts` (optimize)
- Various test files (`.test.tsx`, `.test.ts`)
- `firestore.rules` (update)
- `firestore.indexes.json` (new, if using CLI)
- `README.md`, `docs/WEBSITE_BUILDER.md` (update)

**Testing:**
- Full regression testing of all flows
- Test quota limits and error handling
- Test regenerate functionality
- Run E2E tests with Playwright
- Test mobile responsiveness of wizard and preview
- Performance testing (Lighthouse for generated sites)

---

### Phase 6 (Future): AI-Powered Editing

**Duration:** 5-7 days (future enhancement)

**Goal:** Add chat-based AI editing for generated websites

**Tasks:**

1. **Create editing API route** (`app/api/websites/[id]/edit/route.ts`)
   - Accept instruction string
   - Load current siteSpec and siteCode
   - Call Claude with edit prompt
   - Update Website document with new versions
   - Return updated website

2. **Create edit prompt** (`packages/ai-core/src/website/prompts.ts`)
   - `buildEditPrompt(instruction, currentSiteSpec, currentSiteCode)`
   - Instruct Claude to apply specific changes
   - Preserve existing content not affected by instruction

3. **Create editing UI** (`app/dashboard/business/website-builder/edit/[id]/page.tsx`)
   - Split view: preview on left, chat on right
   - Chat input for editing instructions
   - Live preview updates as edits are applied
   - History of edits (optional)

4. **Add edit mode to preview page**
   - "Edit with AI" button opens editing UI

**Files to create:**
- `app/api/websites/[id]/edit/route.ts` (new)
- `app/dashboard/business/website-builder/edit/[id]/page.tsx` (new)
- `packages/ai-core/src/website/prompts.ts` (add edit prompt)

---

## 8. Security & Best Practices

### 8.1 Security Measures

**Firestore Security Rules:**

Update Firebase Security Rules to restrict website access:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Websites collection
    match /websites/{websiteId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      resource.data.tenantId == request.auth.token.tenantId);

      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.tenantId == request.auth.token.tenantId;

      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;
    }

    // Other collections...
  }
}
```

**Firebase Storage Rules:**

Restrict logo uploads to authenticated users:

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{tenantId}/{websiteId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.auth.token.tenantId == tenantId;
      allow delete: if request.auth != null &&
                       request.auth.token.tenantId == tenantId;
    }
  }
}
```

**HTML Sanitization:**

- Always use DOMPurify for LLM-generated HTML
- Configure strict CSP headers for preview iframe
- Disable JavaScript execution in iframe (`sandbox="allow-same-origin"`)

**Input Validation:**

- Validate all wizard inputs with Zod schemas
- Sanitize user inputs before sending to LLM
- Validate file uploads (type, size limits)

**Rate Limiting:**

- Use existing `withQuotaGuard` middleware
- Implement frontend checks for quota limits
- Add exponential backoff for retries

### 8.2 Performance Optimizations

**Caching:**
- Cache generated websites in CDN (Vercel Edge Network)
- Use browser caching for static assets

**Code Splitting:**
- Lazy load wizard steps to reduce initial bundle size
- Use Next.js dynamic imports

**Firestore Indexing:**
- Create composite indexes for common queries:
  - `(tenantId, createdAt desc)`
  - `(userId, createdAt desc)`
  - `(status, createdAt desc)`

**Token Management:**
- Summarize business plans before sending to Claude (reduce tokens)
- Cache frequently used prompts
- Monitor token usage and optimize prompts

**Database Optimization:**
- Use Firestore batched writes for bulk operations
- Implement pagination for websites list (if >20 websites)

### 8.3 Monitoring & Observability

**Logging:**
- Log all website generations (success/failure) with metadata
- Log API errors with context (request body, user ID, etc.)
- Use structured logging (JSON format)

**Error Tracking:**
- Integrate Sentry or similar for production error tracking
- Track LLM API errors separately
- Monitor quota exhaustion events

**Analytics:**
- Track key metrics:
  - Website generation latency (p50, p95, p99)
  - Success rate (ready vs failed)
  - Token usage per generation
  - User engagement (websites per user, regenerations, etc.)
- Use Firebase Analytics or Google Analytics

**Alerts:**
- Alert on high error rates (>5% failed generations)
- Alert on quota exhaustion
- Alert on API rate limits

---

## 9. Dependencies & Configuration

### 9.1 New NPM Packages

```bash
# Root project
npm install dompurify @types/dompurify

# ai-core package
cd packages/ai-core
npm install @anthropic-ai/sdk
```

### 9.2 Environment Variables

**Add to `.env.local`:**

```bash
# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Feature Flags (optional)
FEATURE_WEBSITE_BUILDER_ENABLED=true

# Limits (optional)
MAX_WEBSITES_PER_USER=10
WEBSITE_GENERATION_MAX_TOKENS=16000
WEBSITE_GENERATION_TIMEOUT_MS=120000
```

### 9.3 Firebase Configuration

**Firestore Collections:**
- `websites` - Main website data
- `assistant_results` - Business plans (existing)
- `usage` - Token usage tracking (existing)

**Firebase Storage Buckets:**
- `/logos/{tenantId}/{websiteId}/{filename}` - Logo uploads

**Firestore Indexes:**

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "websites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "websites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "websites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

**Firestore Security Rules:**

See Section 8.1 for complete security rules.

**Firebase Storage Rules:**

See Section 8.1 for storage security rules.

---

## 10. Timeline & Milestones

### 10.1 Estimated Timeline

| Phase | Duration | Dependencies | Milestones |
|-------|----------|--------------|------------|
| **Phase 1** | 3-5 days | None | Data model, API routes, Firestore functions |
| **Phase 2** | 5-7 days | Phase 1 | Wizard UI (6 steps), logo upload, no-plan mode |
| **Phase 3** | 4-6 days | Phase 1, 2 | Claude integration, background generation |
| **Phase 4** | 5-7 days | Phase 1, 2, 3 | Preview page, business-plan mode, list page |
| **Phase 5** | 4-6 days | Phase 1-4 | Polish, error handling, optimizations, tests |
| **Phase 6** | 5-7 days | Phase 1-5 | AI editing (future enhancement) |

**Total Time (Phases 1-5):** ~3-5 weeks for a single developer

**Total Time (Including Phase 6):** ~4-6 weeks

### 10.2 Milestones

**Milestone 1 (End of Phase 1):**
- ✅ Firestore `websites` collection created
- ✅ Firebase Storage bucket configured
- ✅ All API endpoints functional
- ✅ API testing complete (Postman/cURL)

**Milestone 2 (End of Phase 2):**
- ✅ 6-step wizard UI complete
- ✅ Logo upload functional
- ✅ Form validation working
- ✅ No-plan mode fully tested
- ✅ Landing page updated

**Milestone 3 (End of Phase 3):**
- ✅ Claude Sonnet 4.5 integration complete
- ✅ Background generation working
- ✅ Generated HTML validated
- ✅ Usage tracking implemented
- ✅ End-to-end test passing

**Milestone 4 (End of Phase 4):**
- ✅ Websites list page complete
- ✅ Preview page with sandboxed rendering
- ✅ Business-plan mode working
- ✅ "Turn into website" button functional
- ✅ Delete functionality complete

**Milestone 5 (End of Phase 5):**
- ✅ All UX polish complete
- ✅ Error handling robust
- ✅ Tests written and passing
- ✅ Firestore rules deployed
- ✅ Documentation updated
- ✅ Feature ready for production

**Milestone 6 (End of Phase 6 - Future):**
- ✅ AI editing UI complete
- ✅ Chat-based editing functional
- ✅ Edit history implemented

---

## 11. Success Criteria

### 11.1 Functional Requirements

- ✅ Users can create websites in both plan and no-plan modes
- ✅ Wizard collects all necessary inputs across 6 steps
- ✅ Logo upload to Firebase Storage works reliably
- ✅ Claude generates valid, responsive HTML
- ✅ Websites list shows all user websites with correct statuses
- ✅ Preview page renders generated HTML safely in sandboxed iframe
- ✅ Export functionality downloads complete HTML file
- ✅ Delete functionality removes website and logo
- ✅ Business plan integration works (convert button, AI auto-fill)

### 11.2 Non-Functional Requirements

- ✅ Website generation completes in <60 seconds (p95)
- ✅ Generated HTML is <50KB (excluding external assets)
- ✅ All API endpoints respond in <2 seconds (excluding generation)
- ✅ Wizard is mobile-responsive
- ✅ Preview iframe is secure (no XSS vulnerabilities)
- ✅ Quota middleware prevents abuse
- ✅ Error messages are user-friendly and actionable

### 11.3 Quality Metrics

- ✅ Unit test coverage >70% for critical paths
- ✅ E2E test covers complete user journey
- ✅ Zero critical security vulnerabilities
- ✅ Lighthouse score >90 for wizard and preview pages
- ✅ Generated websites are WCAG AA compliant

---

## 12. Risk Mitigation

### 12.1 Potential Risks

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Claude API rate limits | High | Implement exponential backoff, queue system |
| Generated HTML is broken | High | Add HTML validation, retry logic |
| Token usage exceeds budget | Medium | Summarize business plans, optimize prompts |
| Firebase Storage costs | Medium | Set file size limits, implement cleanup |
| User uploads malicious files | High | Strict file validation, virus scanning |
| Quota exhaustion | Medium | Clear quota messaging, upgrade prompts |

### 12.2 Rollback Plan

If critical issues arise in production:

1. **Feature flag:** Set `FEATURE_WEBSITE_BUILDER_ENABLED=false` to disable feature
2. **API disable:** Comment out routes in `/app/api/websites/*`
3. **UI hide:** Hide "Create Website" buttons in dashboard
4. **Data preservation:** Firestore data remains intact for future re-enable

---

## 13. Future Enhancements

### 13.1 Near-term (Next Quarter)

- **AI Editing (Phase 6):** Chat-based editing of generated websites
- **Templates:** Pre-built templates for common industries
- **Multi-page Sites:** Expand beyond one-page to 3-5 page sites
- **A/B Testing:** Generate multiple variants, test conversion rates
- **SEO Optimization:** Enhanced meta tags, structured data, sitemaps

### 13.2 Long-term (Next 6-12 Months)

- **Domain Hosting:** Publish websites to custom domains
- **Analytics Integration:** Built-in Google Analytics
- **Form Builder:** Custom forms with backend integration
- **E-commerce:** Add Stripe checkout for products
- **Collaborative Editing:** Multiple users on same website
- **Version History:** Save versions, allow rollback
- **Custom Code Injection:** Allow advanced users to add custom CSS/JS

---

## 14. Appendix

### 14.1 Glossary

- **Business Plan Mode:** Wizard mode where user has an attached business plan and AI can auto-fill missing fields
- **No-Plan Mode:** Wizard mode where user must manually fill all required fields
- **Site Spec:** Internal structured representation of website (JSON)
- **Site Code:** Rendered HTML code of the website (string)
- **Wizard Input:** Raw user-provided data from 6-step form
- **Completed Input:** AI-enriched wizard input (in business-plan mode)

### 14.2 Related Documentation

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

### 14.3 Contact & Support

For questions or issues during implementation:
- Check this implementation plan first
- Review existing Business Track code patterns
- Consult codebase docs in `/docs` folder
- Test incrementally (phase by phase)

---

**End of Implementation Plan**

---

**Next Steps:**

1. Review this plan thoroughly
2. Set up development environment (Firebase, Anthropic API key)
3. Start with Phase 1 (Data Model & API Endpoints)
4. Test each phase before moving to the next
5. Deploy incrementally (feature flag recommended)

Good luck with the implementation! 🚀
