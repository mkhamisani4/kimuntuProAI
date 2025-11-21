# 🎨 KimuntuPro AI - Canva-Lite Logo Generator
## Complete Implementation Plan (Approach 2B: AI → Structured SVG)

---

## Document Information

**Feature:** Vector Logo Generator & Editor (Canva-lite)
**Approach:** AI generates structured JSON specs for SVG logos (not pixel images)
**Target Integration:** Business Track in KimuntuPro AI
**Date:** 2025-01-19
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Analysis](#architecture-analysis)
3. [Data Model & Types](#data-model--types)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [End-to-End Data Flow](#end-to-end-data-flow)
7. [Integration Points](#integration-points)
8. [Migration & Deployment](#migration--deployment)
9. [Implementation Phases](#implementation-phases)
10. [File Checklist](#file-checklist)
11. [Testing Strategy](#testing-strategy)

---

## Executive Summary

### Feature Overview

This document outlines the complete implementation of a **Canva-lite logo generator** for KimuntuPro AI. Users can:

1. Generate logo design briefs from their business plans
2. Create 2-3 vector logo concepts using AI (Claude Sonnet 4.5)
3. Edit logos in a visual editor (change colors, text, positions, sizes)
4. Save multiple logo versions to Firestore
5. Mark one logo as "primary" for use across the platform
6. Export logos as PNG or SVG files

### Design Decisions

**Based on stakeholder input:**

- ✅ **Primitives:** Support `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polygon>`, and `<path>` (but keep LLM-generated paths simple)
- ✅ **Fonts:** System fonts only (Arial, Times New Roman, Courier, Helvetica, Georgia, Verdana)
- ✅ **Canvas Size:** Fixed at 500×500px (simplifies LLM prompts and rendering)
- ✅ **Primary Logo Logic:** Setting `isPrimary: true` automatically unsets other logos for that user
- ✅ **Business Plan Source:** Fetch from `assistant_results` collection (assistant type: `streamlined_plan`)
- ✅ **Quota:** Logo generation uses same quota as other AI assistants (executor quota)
- ✅ **Navigation:** Add "Logo Studio" link to main dashboard sidebar under Business Track

### Technology Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Firebase Admin SDK
- **Database:** Firestore (new `logos` collection)
- **AI/LLM:** Claude Sonnet 4.5 via Anthropic SDK (structured JSON output)
- **Export:** Native Canvas API for PNG, SVG download

---

## Architecture Analysis

### Current Codebase Structure

```
kimuntuProAI/
├── app/
│   ├── dashboard/
│   │   └── business/              # Business Track pages
│   │       ├── ai-assistant/
│   │       ├── streamlined-plan/
│   │       ├── exec-summary/
│   │       ├── market-analysis/
│   │       ├── financial-overview/
│   │       └── websites/          # Most similar feature (pattern to follow)
│   └── api/
│       ├── ai/
│       │   ├── plan/              # Planner route (Stage A)
│       │   └── answer/            # Executor route (Stage B)
│       └── websites/              # Website builder API (pattern to follow)
│           ├── generate/
│           ├── [id]/
│           └── upload-logo/
├── packages/
│   ├── shared/                    # Shared types & schemas
│   │   └── src/
│   │       ├── types.ts           # TypeScript interfaces
│   │       └── schemas.ts         # Zod validation schemas
│   ├── db/                        # Database layer
│   │   └── src/firebase/
│   │       ├── client.ts          # Firestore client
│   │       ├── websites.ts        # CRUD pattern to follow
│   │       ├── websites.server.ts # Server-side admin pattern
│   │       └── assistantResults.ts
│   └── ai-core/                   # AI/LLM integration
│       └── src/
│           ├── llm/
│           │   └── claudeClient.ts
│           └── generators/
│               └── websiteGenerator.ts  # Pattern to follow
└── lib/
    └── api/
        └── quotaMiddleware.ts     # Quota enforcement (withQuotaGuard)
```

### Key Patterns Identified

1. **API Routes:** `app/api/{feature}/{action}/route.ts` with `withQuotaGuard()` middleware
2. **Types:** Defined in `packages/shared/src/types.ts`, validated with Zod schemas
3. **Database:** CRUD in `packages/db/src/firebase/{collection}.ts`, admin functions in `.server.ts`
4. **AI Generators:** System prompt + user prompt → Claude → structured JSON output
5. **Auth/Tenancy:** Every request has `tenantId` (default: 'demo-tenant') and `userId`
6. **Business Plans:** Stored as `AssistantResult` documents with `sections: Record<string, string>`

### Existing Collections

- `assistant_results` - Business plans and other AI outputs
- `websites` - Generated websites
- `usage_logs` - Token usage tracking
- `documents` - RAG document metadata

### New Collection

- `logos` - **NEW** - Logo documents (brief, concepts, current spec, metadata)

---

## Data Model & Types

### TypeScript Interfaces

**File:** `packages/shared/src/types.ts` (ADD TO EXISTING)

```typescript
// ============================================================================
// LOGO GENERATOR TYPES
// ============================================================================

/**
 * Logo design brief generated by LLM
 * Captures brand personality and design direction
 */
export interface LogoDesignBrief {
  // Brand attributes
  brandAdjectives: string[]; // e.g., ["modern", "trustworthy", "innovative"]
  brandPersonality: string; // e.g., "Professional yet approachable"

  // Visual direction
  logoType: 'wordmark' | 'lettermark' | 'icon' | 'combination';
  iconConcepts: string[]; // e.g., ["abstract geometric", "mountain peak", "shield"]

  // Color palette (hex codes)
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };

  // Typography suggestions (SYSTEM FONTS ONLY)
  fontSuggestions: {
    heading: 'Arial' | 'Times New Roman' | 'Courier New' | 'Helvetica' | 'Georgia' | 'Verdana' | 'Tahoma' | 'Trebuchet MS';
    tagline?: 'Arial' | 'Times New Roman' | 'Courier New' | 'Helvetica' | 'Georgia' | 'Verdana' | 'Tahoma' | 'Trebuchet MS';
  };

  // Reasoning
  rationale: string; // Why these design choices fit the business
}

/**
 * Single primitive shape in a logo
 * DECISION: Support <path> but keep prompts simple to avoid complexity
 */
export type LogoShape =
  | { type: 'rectangle'; x: number; y: number; width: number; height: number; fill: string; rx?: number }
  | { type: 'circle'; cx: number; cy: number; r: number; fill: string }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number }
  | { type: 'polygon'; points: string; fill: string } // e.g., "0,0 50,50 100,0" for triangle
  | { type: 'path'; d: string; fill: string; stroke?: string; strokeWidth?: number }; // Simple SVG paths only

/**
 * Text element in a logo
 * DECISION: System fonts only for maximum portability
 */
export interface LogoText {
  content: string; // The actual text (company name, tagline, etc.)
  x: number;
  y: number;
  fontSize: number;
  fontFamily: 'Arial' | 'Times New Roman' | 'Courier New' | 'Helvetica' | 'Georgia' | 'Verdana' | 'Tahoma' | 'Trebuchet MS';
  fontWeight: 400 | 700 | 'normal' | 'bold';
  fill: string; // Text color (hex)
  textAnchor?: 'start' | 'middle' | 'end';
  letterSpacing?: number;
}

/**
 * Complete logo specification (JSON structure for SVG rendering)
 * DECISION: Fixed canvas size 500x500
 */
export interface LogoSpec {
  version: '1.0'; // Schema version for future compatibility

  // Canvas metadata (FIXED SIZE)
  canvas: {
    width: 500; // Fixed
    height: 500; // Fixed
    backgroundColor: string; // hex color or 'transparent'
  };

  // Logo elements (render in order)
  shapes: LogoShape[];
  texts: LogoText[];

  // Metadata
  metadata: {
    conceptName: string; // e.g., "Concept 1: Mountain Shield"
    description: string; // Short description of the concept
    generatedAt: Date;
  };
}

/**
 * Logo document persisted in Firestore
 * DECISION: Primary logo enforcement (only one isPrimary=true per user)
 */
export interface LogoDocument {
  id?: string;
  tenantId: string;
  userId: string;

  // Business relationship
  // DECISION: Fetch from assistant_results collection
  businessPlanId: string | null; // Reference to assistant_results doc (streamlined_plan)
  companyName: string;

  // Design process
  brief: LogoDesignBrief;
  concepts: LogoSpec[]; // 2-3 concepts generated by LLM

  // User's working version
  currentSpec: LogoSpec; // The spec currently loaded in editor
  isPrimary: boolean; // Only one logo per user can be primary

  // Generation metadata
  generationMetadata: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
    generatedAt: Date;
  } | null;

  createdAt?: Date;
  updatedAt?: Date;
}
```

### Zod Validation Schemas

**File:** `packages/shared/src/schemas.ts` (ADD TO EXISTING)

```typescript
import { z } from 'zod';

// ============================================================================
// LOGO GENERATOR SCHEMAS
// ============================================================================

const SystemFontEnum = z.enum([
  'Arial',
  'Times New Roman',
  'Courier New',
  'Helvetica',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
]);

export const LogoDesignBriefSchema = z.object({
  brandAdjectives: z.array(z.string()).min(2).max(6),
  brandPersonality: z.string().min(1).max(500),
  logoType: z.enum(['wordmark', 'lettermark', 'icon', 'combination']),
  iconConcepts: z.array(z.string()).min(1).max(5),
  colorPalette: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  fontSuggestions: z.object({
    heading: SystemFontEnum,
    tagline: SystemFontEnum.optional(),
  }),
  rationale: z.string().min(1).max(1000),
});

export const LogoShapeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('rectangle'),
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    rx: z.number().nonnegative().optional(),
  }),
  z.object({
    type: z.literal('circle'),
    cx: z.number(),
    cy: z.number(),
    r: z.number().positive(),
    fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  z.object({
    type: z.literal('ellipse'),
    cx: z.number(),
    cy: z.number(),
    rx: z.number().positive(),
    ry: z.number().positive(),
    fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  z.object({
    type: z.literal('line'),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
    stroke: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    strokeWidth: z.number().positive(),
  }),
  z.object({
    type: z.literal('polygon'),
    points: z.string(),
    fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  z.object({
    type: z.literal('path'),
    d: z.string(),
    fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    stroke: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    strokeWidth: z.number().positive().optional(),
  }),
]);

export const LogoTextSchema = z.object({
  content: z.string().min(1).max(100),
  x: z.number(),
  y: z.number(),
  fontSize: z.number().positive(),
  fontFamily: SystemFontEnum,
  fontWeight: z.union([z.literal(400), z.literal(700), z.literal('normal'), z.literal('bold')]),
  fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textAnchor: z.enum(['start', 'middle', 'end']).optional(),
  letterSpacing: z.number().optional(),
});

export const LogoSpecSchema = z.object({
  version: z.literal('1.0'),
  canvas: z.object({
    width: z.literal(500), // FIXED SIZE
    height: z.literal(500), // FIXED SIZE
    backgroundColor: z.string(),
  }),
  shapes: z.array(LogoShapeSchema),
  texts: z.array(LogoTextSchema),
  metadata: z.object({
    conceptName: z.string(),
    description: z.string(),
    generatedAt: z.date(),
  }),
});

export const LogoGenerationRequestSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  businessPlanId: z.string().nullable(),
  companyName: z.string().min(1).max(100),
  businessPlanText: z.string().max(50000).optional(),
});
```

---

## Backend Implementation

### API Routes Overview

| Route | Method | Purpose | Quota |
|-------|--------|---------|-------|
| `/api/logo/brief` | POST | Generate design brief | ✅ Executor |
| `/api/logo/spec` | POST | Generate 2-3 logo concepts | ✅ Executor |
| `/api/logo/save` | POST | Save/update logo document | ❌ None |
| `/api/logo/[id]` | GET | Get logo by ID | ❌ None |
| `/api/logo/[id]` | DELETE | Delete logo | ❌ None |
| `/api/logo/list` | GET | List logos for user | ❌ None |

### Route 1: Generate Design Brief

**File:** `app/api/logo/brief/route.ts` (CREATE NEW)

```typescript
/**
 * POST /api/logo/brief
 * Generates a logo design brief from business context using Claude
 * DECISION: Uses executor quota (same as other AI features)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { generateLogoBrief } from '@kimuntupro/ai-core/generators/logoGenerator';
import { LogoGenerationRequestSchema } from '@kimuntupro/shared/schemas';

async function handleBriefGeneration(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Validate request
    const validation = LogoGenerationRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'validation_failed', message: validation.error.message },
        { status: 400 }
      );
    }

    const { tenantId, userId, companyName, businessPlanText } = validation.data;

    // Generate brief using Claude
    const result = await generateLogoBrief({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      companyName,
      businessContext: businessPlanText,
    });

    return NextResponse.json(
      {
        success: true,
        brief: result.brief,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Logo Brief] Generation error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

// DECISION: Use same quota as other AI features
export const POST = withQuotaGuard(handleBriefGeneration, { for: 'executor' });
```

### Route 2: Generate Logo Concepts

**File:** `app/api/logo/spec/route.ts` (CREATE NEW)

```typescript
/**
 * POST /api/logo/spec
 * Generates 2-3 LogoSpec concepts from a design brief using Claude
 * DECISION: Uses executor quota
 */

import { NextRequest, NextResponse } from 'next/server';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { generateLogoConcepts } from '@kimuntupro/ai-core/generators/logoGenerator';
import { LogoDesignBriefSchema } from '@kimuntupro/shared/schemas';
import { z } from 'zod';

const RequestSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  brief: LogoDesignBriefSchema,
  companyName: z.string(),
  numConcepts: z.number().int().min(1).max(3).default(3),
});

async function handleSpecGeneration(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'validation_failed', message: validation.error.message },
        { status: 400 }
      );
    }

    const { brief, companyName, numConcepts } = validation.data;

    // Generate logo concepts using Claude
    const result = await generateLogoConcepts({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      brief,
      companyName,
      numConcepts,
    });

    return NextResponse.json(
      {
        success: true,
        concepts: result.concepts,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Logo Spec] Generation error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export const POST = withQuotaGuard(handleSpecGeneration, { for: 'executor' });
```

### Route 3: Save Logo

**File:** `app/api/logo/save/route.ts` (CREATE NEW)

```typescript
/**
 * POST /api/logo/save
 * Saves or updates a logo document in Firestore
 * DECISION: If isPrimary=true, unset isPrimary on other user logos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogoAdmin, updateLogoAdmin, unsetPrimaryLogoForUser } from '@kimuntupro/db/firebase/logos.server';
import type { LogoDocument } from '@kimuntupro/shared';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      logoId, // If present, update; otherwise, create
      tenantId,
      userId,
      businessPlanId,
      companyName,
      brief,
      concepts,
      currentSpec,
      isPrimary,
      generationMetadata,
    } = body;

    // Validation
    if (!tenantId || !userId || !companyName || !currentSpec) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // DECISION: If isPrimary=true, unset other logos first
    if (isPrimary) {
      await unsetPrimaryLogoForUser(tenantId, userId);
    }

    let savedLogoId: string;

    if (logoId) {
      // Update existing
      await updateLogoAdmin(logoId, {
        currentSpec,
        isPrimary: isPrimary || false,
      });
      savedLogoId = logoId;
    } else {
      // Create new
      savedLogoId = await createLogoAdmin({
        tenantId,
        userId,
        businessPlanId: businessPlanId || null,
        companyName,
        brief,
        concepts: concepts || [],
        currentSpec,
        isPrimary: isPrimary || false,
        generationMetadata: generationMetadata || null,
      });
    }

    return NextResponse.json({ success: true, logoId: savedLogoId }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo Save] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}
```

### Route 4: Get/Delete Logo by ID

**File:** `app/api/logo/[id]/route.ts` (CREATE NEW)

```typescript
/**
 * GET /api/logo/[id] - Get logo by ID
 * DELETE /api/logo/[id] - Delete logo
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogoAdmin, deleteLogoAdmin } from '@kimuntupro/db/firebase/logos.server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const logo = await getLogoAdmin(params.id);

    if (!logo) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, logo }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo GET] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await deleteLogoAdmin(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo DELETE] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}
```

### AI Generator: Logo Brief & Concepts

**File:** `packages/ai-core/src/generators/logoGenerator.ts` (CREATE NEW)

```typescript
/**
 * AI Logo Generator
 * Uses Claude Sonnet 4.5 to generate logo design briefs and SVG specs
 * DECISIONS: System fonts only, simple paths, fixed 500x500 canvas
 */

import { ClaudeClient } from '../llm/claudeClient.js';
import type { LogoDesignBrief, LogoSpec } from '@kimuntupro/shared';

interface GenerateBriefOptions {
  apiKey: string;
  companyName: string;
  businessContext?: string;
}

interface GenerateBriefResult {
  brief: LogoDesignBrief;
  metadata: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
  };
}

/**
 * Generate logo design brief from business context
 */
export async function generateLogoBrief(
  options: GenerateBriefOptions
): Promise<GenerateBriefResult> {
  const { apiKey, companyName, businessContext } = options;

  const systemPrompt = `You are a professional brand strategist and logo designer. Analyze the provided business information and create a comprehensive logo design brief.

Return ONLY valid JSON matching this exact schema:
{
  "brandAdjectives": ["adjective1", "adjective2", "adjective3"],
  "brandPersonality": "Brief description of brand personality",
  "logoType": "wordmark" | "lettermark" | "icon" | "combination",
  "iconConcepts": ["concept1", "concept2"],
  "colorPalette": {
    "primary": "#HEXCODE",
    "secondary": "#HEXCODE",
    "accent": "#HEXCODE",
    "text": "#HEXCODE"
  },
  "fontSuggestions": {
    "heading": "Arial" | "Times New Roman" | "Courier New" | "Helvetica" | "Georgia" | "Verdana" | "Tahoma" | "Trebuchet MS",
    "tagline": "Arial" | ... (optional)
  },
  "rationale": "Why these design choices fit the business"
}

IMPORTANT CONSTRAINTS:
- Use ONLY these system fonts: Arial, Times New Roman, Courier New, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- Choose 3-5 brand adjectives that capture the company's essence
- logoType must be one of: wordmark, lettermark, icon, combination
- Suggest 2-3 icon concepts if applicable (skip for pure wordmarks)
- All colors must be hex codes (#RRGGBB format)
- Keep rationale concise (1-2 sentences)

Guidelines:
- Wordmark: Company name as stylized text (e.g., Google, Coca-Cola)
- Lettermark: Initials/monogram (e.g., IBM, HP)
- Icon: Symbol/graphic (e.g., Apple, Twitter bird)
- Combination: Icon + text (e.g., Burger King, Adidas)`;

  const userPrompt = `Company Name: ${companyName}

Business Context: ${businessContext || 'No additional context provided. Infer from company name.'}

Generate a logo design brief for this company. Return ONLY the JSON object, no markdown or explanation.`;

  const client = new ClaudeClient(apiKey);
  const startTime = Date.now();

  const response = await client.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 2000,
  });

  const latencyMs = Date.now() - startTime;

  // Parse and validate brief
  const brief = JSON.parse(response.output) as LogoDesignBrief;

  return {
    brief,
    metadata: {
      model: response.model,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
      costCents: response.cost.totalCostCents,
    },
  };
}

interface GenerateConceptsOptions {
  apiKey: string;
  brief: LogoDesignBrief;
  companyName: string;
  numConcepts: number; // 1-3
}

interface GenerateConceptsResult {
  concepts: LogoSpec[];
  metadata: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
  };
}

/**
 * Generate 2-3 logo concepts from design brief
 * DECISION: Keep paths simple, fixed 500x500 canvas
 */
export async function generateLogoConcepts(
  options: GenerateConceptsOptions
): Promise<GenerateConceptsResult> {
  const { apiKey, brief, companyName, numConcepts } = options;

  const systemPrompt = `You are an expert logo designer. Create ${numConcepts} different logo concepts as SVG specifications using ONLY simple primitives.

ALLOWED PRIMITIVES:
- rectangle: { type: "rectangle", x, y, width, height, fill, rx? }
- circle: { type: "circle", cx, cy, r, fill }
- ellipse: { type: "ellipse", cx, cy, rx, ry, fill }
- line: { type: "line", x1, y1, x2, y2, stroke, strokeWidth }
- polygon: { type: "polygon", points: "x1,y1 x2,y2 x3,y3", fill }
- path: { type: "path", d: "M x y L x y ...", fill, stroke?, strokeWidth? } (KEEP SIMPLE - basic lines/curves only)
- text: { content, x, y, fontSize, fontFamily, fontWeight, fill, textAnchor?, letterSpacing? }

CONSTRAINTS:
- Canvas size: FIXED 500x500
- Fonts: ONLY Arial, Times New Roman, Courier New, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- Colors: Use the provided color palette
- Simplicity: 3-7 shapes max per concept (logos must be simple and scalable)
- Each concept must be visually distinct
- Position elements within 500x500 canvas (center logos for best appearance)
- Text should be readable (fontSize 24+ for company names, 16+ for taglines)

Return ONLY valid JSON matching this schema:
{
  "concepts": [
    {
      "version": "1.0",
      "canvas": { "width": 500, "height": 500, "backgroundColor": "#FFFFFF" or "transparent" },
      "shapes": [ /* array of shape objects */ ],
      "texts": [ /* array of text objects */ ],
      "metadata": {
        "conceptName": "Concept 1: Descriptive Name",
        "description": "Brief description of this concept",
        "generatedAt": "2025-01-19T..." (use current ISO date)
      }
    },
    // ... ${numConcepts - 1} more concept(s)
  ]
}

Design Principles:
- Balance negative space
- Ensure legibility at small sizes (50x50)
- Use the color palette strategically (primary for main elements, accent sparingly)
- Align elements to create visual harmony
- Each concept should explore a different visual approach`;

  const userPrompt = `Company Name: ${companyName}

Logo Type: ${brief.logoType}
Brand Adjectives: ${brief.brandAdjectives.join(', ')}
Icon Concepts: ${brief.iconConcepts.join(', ')}
Color Palette:
  - Primary: ${brief.colorPalette.primary}
  - Secondary: ${brief.colorPalette.secondary}
  - Accent: ${brief.colorPalette.accent}
  - Text: ${brief.colorPalette.text}
Font Suggestions: ${brief.fontSuggestions.heading}${brief.fontSuggestions.tagline ? ` / ${brief.fontSuggestions.tagline}` : ''}

Create ${numConcepts} logo concept(s) as JSON LogoSpec objects. Return ONLY the JSON, no markdown.`;

  const client = new ClaudeClient(apiKey);
  const startTime = Date.now();

  const response = await client.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 8000, // Allow more tokens for multiple concepts
  });

  const latencyMs = Date.now() - startTime;

  // Parse and validate concepts
  const parsed = JSON.parse(response.output);
  const concepts = parsed.concepts.map((c: any) => ({
    ...c,
    metadata: {
      ...c.metadata,
      generatedAt: new Date(c.metadata.generatedAt),
    },
  })) as LogoSpec[];

  return {
    concepts,
    metadata: {
      model: response.model,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
      costCents: response.cost.totalCostCents,
    },
  };
}
```

**Export from:** `packages/ai-core/src/index.ts`

```typescript
// Add to existing exports:
export { generateLogoBrief, generateLogoConcepts } from './generators/logoGenerator.js';
```

---

## Frontend Implementation

### Page Structure

**File:** `app/dashboard/business/logo-studio/page.tsx` (CREATE NEW)

```typescript
'use client';

/**
 * Logo Studio - Main Page
 * Generate and edit vector logos for your business
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getAssistantResult } from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';
import { Loader2, Sparkles, Save, Download, ArrowLeft } from 'lucide-react';
import type { LogoDesignBrief, LogoSpec, LogoDocument } from '@kimuntupro/shared';

import { LogoCanvas } from './components/LogoCanvas';
import { ConceptSelector } from './components/ConceptSelector';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ExportDialog } from './components/ExportDialog';
import { useLogoEditor } from './hooks/useLogoEditor';

type WizardStep = 'select-plan' | 'generate-brief' | 'generate-concepts' | 'editor';

export default function LogoStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessPlanId = searchParams.get('businessPlanId');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [step, setStep] = useState<WizardStep>('select-plan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business plan data
  const [companyName, setCompanyName] = useState('');
  const [businessPlanText, setBusinessPlanText] = useState('');

  // Generated data
  const [brief, setBrief] = useState<LogoDesignBrief | null>(null);
  const [concepts, setConcepts] = useState<LogoSpec[]>([]);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);

  // Editor state
  const editor = useLogoEditor(concepts[selectedConceptIndex] || null);

  // Export dialog
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load business plan if provided
  useEffect(() => {
    if (businessPlanId && currentUserId) {
      loadBusinessPlan(businessPlanId);
    }
  }, [businessPlanId, currentUserId]);

  async function loadBusinessPlan(planId: string) {
    try {
      setLoading(true);
      // DECISION: Fetch from assistant_results
      const plan = await getAssistantResult(planId);
      if (!plan) {
        throw new Error('Business plan not found');
      }

      // Extract company name and plan text
      const planText = Object.entries(plan.sections)
        .map(([section, content]) => `${section}:\n${content}`)
        .join('\n\n');

      setCompanyName(plan.title.replace(/^(Plan:|Summary:|Market:|Financials:)\s*/i, '').trim());
      setBusinessPlanText(planText);
      setStep('generate-brief');
    } catch (err: any) {
      console.error('Failed to load business plan:', err);
      toast.error('Failed to load business plan');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBrief() {
    if (!currentUserId || !companyName) {
      toast.error('Please enter a company name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/logo/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: currentUserId,
          businessPlanId: businessPlanId || null,
          companyName,
          businessPlanText: businessPlanText || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate brief');
      }

      const data = await response.json();
      setBrief(data.brief);
      setStep('generate-concepts');
      toast.success('Design brief generated!');
    } catch (err: any) {
      console.error('Failed to generate brief:', err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateConcepts() {
    if (!brief || !currentUserId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/logo/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: currentUserId,
          brief,
          companyName,
          numConcepts: 3,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate concepts');
      }

      const data = await response.json();
      setConcepts(data.concepts);
      setSelectedConceptIndex(0);
      editor.loadSpec(data.concepts[0]);
      setStep('editor');
      toast.success(`${data.concepts.length} logo concepts generated!`);
    } catch (err: any) {
      console.error('Failed to generate concepts:', err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLogo() {
    if (!currentUserId || !brief || !editor.spec) return;

    try {
      setLoading(true);

      const response = await fetch('/api/logo/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: currentUserId,
          businessPlanId: businessPlanId || null,
          companyName,
          brief,
          concepts,
          currentSpec: editor.spec,
          isPrimary: false, // User can set primary later
          generationMetadata: null, // TODO: Track metadata
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save logo');
      }

      const data = await response.json();
      toast.success('Logo saved successfully!');

      // Navigate to saved logo (or back to dashboard)
      router.push(`/dashboard/business/logo-studio?logoId=${data.logoId}`);
    } catch (err: any) {
      console.error('Failed to save logo:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Render wizard steps
  if (step === 'select-plan' || step === 'generate-brief') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logo Studio</h1>
          <p className="text-gray-600 mb-8">Generate a professional logo for your business using AI</p>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">1. Enter Company Information</h2>

            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Company Name</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-6">
              <span className="text-sm font-medium text-gray-700">Business Description (optional)</span>
              <textarea
                value={businessPlanText}
                onChange={(e) => setBusinessPlanText(e.target.value)}
                placeholder="Describe your business, industry, target market..."
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>

            <button
              onClick={handleGenerateBrief}
              disabled={loading || !companyName}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Logo Brief
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generate-concepts' && brief) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logo Design Brief</h1>
          <p className="text-gray-600 mb-8">Review the AI-generated design direction</p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Logo Type</h3>
                <p className="text-gray-700 capitalize">{brief.logoType}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Brand Personality</h3>
                <p className="text-gray-700">{brief.brandPersonality}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Brand Adjectives</h3>
                <div className="flex flex-wrap gap-2">
                  {brief.brandAdjectives.map((adj) => (
                    <span key={adj} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {adj}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Color Palette</h3>
                <div className="flex gap-2">
                  {Object.entries(brief.colorPalette).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div
                        className="w-12 h-12 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs text-gray-600 mt-1 capitalize">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Design Rationale</h3>
              <p className="text-gray-700">{brief.rationale}</p>
            </div>
          </div>

          <button
            onClick={handleGenerateConcepts}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Logo Concepts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate 3 Logo Concepts
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Editor view
  if (step === 'editor' && editor.spec) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/business')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Logo Studio</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportDialog(true)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={handleSaveLogo}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Logo
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left: Properties Panel */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <PropertiesPanel
              spec={editor.spec}
              selectedElementId={editor.selectedElementId}
              onUpdateShape={editor.updateShape}
              onUpdateText={editor.updateText}
              onUpdateCanvas={editor.updateCanvas}
              onDeleteElement={editor.deleteElement}
              onSelectElement={editor.setSelectedElementId}
            />
          </div>

          {/* Center: Logo Canvas */}
          <div className="flex-1 flex flex-col">
            {/* Concept Selector */}
            <div className="bg-white border-b border-gray-200 p-4">
              <ConceptSelector
                concepts={concepts}
                selectedIndex={selectedConceptIndex}
                onSelectConcept={(index) => {
                  setSelectedConceptIndex(index);
                  editor.loadSpec(concepts[index]);
                }}
              />
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto">
              <LogoCanvas
                spec={editor.spec}
                selectedElementId={editor.selectedElementId}
                onSelectElement={editor.setSelectedElementId}
                onUpdateShape={editor.updateShape}
                onUpdateText={editor.updateText}
              />
            </div>
          </div>
        </div>

        {/* Export Dialog */}
        {showExportDialog && (
          <ExportDialog
            spec={editor.spec}
            companyName={companyName}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
```

### Component: Logo Canvas

**File:** `app/dashboard/business/logo-studio/components/LogoCanvas.tsx` (CREATE NEW)

See full component in previous plan section. Key features:
- Renders LogoSpec as interactive SVG
- Click-to-select elements
- Highlights selected element with blue border
- Passes callbacks for element updates

### Component: Concept Selector

**File:** `app/dashboard/business/logo-studio/components/ConceptSelector.tsx` (CREATE NEW)

```typescript
/**
 * ConceptSelector - Thumbnail grid to switch between logo concepts
 */

import React from 'react';
import type { LogoSpec } from '@kimuntupro/shared';
import { renderLogoSpecToSVG } from '../utils/svgRenderer';

interface ConceptSelectorProps {
  concepts: LogoSpec[];
  selectedIndex: number;
  onSelectConcept: (index: number) => void;
}

export function ConceptSelector({ concepts, selectedIndex, onSelectConcept }: ConceptSelectorProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {concepts.map((concept, index) => (
        <button
          key={index}
          onClick={() => onSelectConcept(index)}
          className={`flex-shrink-0 p-3 border-2 rounded-lg transition-all ${
            index === selectedIndex
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="w-32 h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
            <div className="scale-[0.25] origin-center">
              {renderLogoSpecToSVG(concept)}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 text-center">
            {concept.metadata.conceptName}
          </p>
        </button>
      ))}
    </div>
  );
}
```

### Component: Properties Panel

**File:** `app/dashboard/business/logo-studio/components/PropertiesPanel.tsx` (CREATE NEW - PHASE 2)

```typescript
/**
 * PropertiesPanel - Edit selected element properties
 */

import React from 'react';
import type { LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';
import { Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  spec: LogoSpec;
  selectedElementId: string | null;
  onUpdateShape: (index: number, updates: Partial<LogoShape>) => void;
  onUpdateText: (index: number, updates: Partial<LogoText>) => void;
  onUpdateCanvas: (updates: Partial<LogoSpec['canvas']>) => void;
  onDeleteElement: (type: 'shape' | 'text', index: number) => void;
  onSelectElement: (id: string | null) => void;
}

export function PropertiesPanel({
  spec,
  selectedElementId,
  onUpdateShape,
  onUpdateText,
  onUpdateCanvas,
  onDeleteElement,
  onSelectElement,
}: PropertiesPanelProps) {
  const selectedType = selectedElementId?.startsWith('shape-') ? 'shape' : 'text';
  const selectedIndex = selectedElementId ? parseInt(selectedElementId.split('-')[1]) : -1;
  const selectedElement = selectedIndex >= 0
    ? (selectedType === 'shape' ? spec.shapes[selectedIndex] : spec.texts[selectedIndex])
    : null;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>

      {/* Element List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Shapes</h3>
        <div className="space-y-1">
          {spec.shapes.map((shape, i) => (
            <button
              key={`shape-${i}`}
              onClick={() => onSelectElement(`shape-${i}`)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                selectedElementId === `shape-${i}`
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              {shape.type} {i + 1}
            </button>
          ))}
        </div>

        <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Text</h3>
        <div className="space-y-1">
          {spec.texts.map((text, i) => (
            <button
              key={`text-${i}`}
              onClick={() => onSelectElement(`text-${i}`)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                selectedElementId === `text-${i}`
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              {text.content.substring(0, 20)}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Element Properties */}
      {selectedElement && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              {selectedType === 'shape' ? 'Shape Properties' : 'Text Properties'}
            </h3>
            <button
              onClick={() => {
                onDeleteElement(selectedType, selectedIndex);
                onSelectElement(null);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {selectedType === 'shape' && (
            <ShapeProperties
              shape={selectedElement as LogoShape}
              onUpdate={(updates) => onUpdateShape(selectedIndex, updates)}
            />
          )}

          {selectedType === 'text' && (
            <TextProperties
              text={selectedElement as LogoText}
              onUpdate={(updates) => onUpdateText(selectedIndex, updates)}
            />
          )}
        </div>
      )}

      {/* Canvas Properties */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Canvas</h3>
        <label className="block">
          <span className="text-xs text-gray-600">Background Color</span>
          <input
            type="color"
            value={spec.canvas.backgroundColor === 'transparent' ? '#FFFFFF' : spec.canvas.backgroundColor}
            onChange={(e) => onUpdateCanvas({ backgroundColor: e.target.value })}
            className="mt-1 block w-full h-10 rounded border border-gray-300"
          />
        </label>
      </div>
    </div>
  );
}

// Helper components for shape/text properties
function ShapeProperties({ shape, onUpdate }: any) {
  // Render inputs based on shape type
  // Rectangle: x, y, width, height, fill, rx
  // Circle: cx, cy, r, fill
  // etc.
  return <div className="space-y-3">{/* Input fields */}</div>;
}

function TextProperties({ text, onUpdate }: any) {
  // Render: content, x, y, fontSize, fontFamily, fontWeight, fill
  return <div className="space-y-3">{/* Input fields */}</div>;
}
```

### Hook: useLogoEditor

**File:** `app/dashboard/business/logo-studio/hooks/useLogoEditor.ts` (CREATE NEW - PHASE 2)

See full implementation in previous plan section. Key features:
- Manages `currentSpec` state
- Tracks `selectedElementId`
- Provides `updateShape()`, `updateText()`, `deleteElement()`
- Implements undo/redo history

### Utility: SVG Renderer

**File:** `app/dashboard/business/logo-studio/utils/svgRenderer.tsx` (CREATE NEW)

```typescript
/**
 * Utility to render LogoSpec as SVG JSX
 */

import React from 'react';
import type { LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';

export function renderLogoSpecToSVG(spec: LogoSpec): JSX.Element {
  return (
    <svg
      width={spec.canvas.width}
      height={spec.canvas.height}
      viewBox={`0 0 ${spec.canvas.width} ${spec.canvas.height}`}
      style={{ backgroundColor: spec.canvas.backgroundColor }}
    >
      {spec.shapes.map((shape, i) => renderShape(shape, i))}
      {spec.texts.map((text, i) => renderText(text, i))}
    </svg>
  );
}

function renderShape(shape: LogoShape, index: number): JSX.Element {
  const key = `shape-${index}`;

  switch (shape.type) {
    case 'rectangle':
      return (
        <rect
          key={key}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx}
          fill={shape.fill}
        />
      );
    case 'circle':
      return (
        <circle
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={shape.fill}
        />
      );
    case 'ellipse':
      return (
        <ellipse
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={shape.fill}
        />
      );
    case 'line':
      return (
        <line
          key={key}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    case 'polygon':
      return (
        <polygon
          key={key}
          points={shape.points}
          fill={shape.fill}
        />
      );
    case 'path':
      return (
        <path
          key={key}
          d={shape.d}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    default:
      return <></>;
  }
}

function renderText(text: LogoText, index: number): JSX.Element {
  return (
    <text
      key={`text-${index}`}
      x={text.x}
      y={text.y}
      fontSize={text.fontSize}
      fontFamily={text.fontFamily}
      fontWeight={text.fontWeight}
      fill={text.fill}
      textAnchor={text.textAnchor}
      letterSpacing={text.letterSpacing}
    >
      {text.content}
    </text>
  );
}
```

### Utility: SVG Export

**File:** `app/dashboard/business/logo-studio/utils/svgExport.ts` (CREATE NEW - PHASE 2)

```typescript
/**
 * Utility to export LogoSpec as PNG or SVG file
 */

import type { LogoSpec } from '@kimuntupro/shared';

/**
 * Export logo as SVG file (download)
 */
export function exportAsSVG(spec: LogoSpec, filename: string = 'logo.svg'): void {
  const svgString = generateSVGString(spec);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Export logo as PNG file (download)
 * @param size - Output size in pixels (e.g., 512, 1024, 2048)
 */
export async function exportAsPNG(
  spec: LogoSpec,
  size: number = 1024,
  filename: string = 'logo.png'
): Promise<void> {
  const svgString = generateSVGString(spec);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Create image from SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Draw scaled image to canvas
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }

        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(pngUrl);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
}

/**
 * Generate SVG string from LogoSpec
 */
function generateSVGString(spec: LogoSpec): string {
  const shapes = spec.shapes.map((shape, i) => {
    switch (shape.type) {
      case 'rectangle':
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" ${shape.rx ? `rx="${shape.rx}"` : ''} fill="${shape.fill}" />`;
      case 'circle':
        return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}" />`;
      case 'ellipse':
        return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" />`;
      case 'line':
        return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />`;
      case 'polygon':
        return `<polygon points="${shape.points}" fill="${shape.fill}" />`;
      case 'path':
        return `<path d="${shape.d}" fill="${shape.fill}" ${shape.stroke ? `stroke="${shape.stroke}"` : ''} ${shape.strokeWidth ? `stroke-width="${shape.strokeWidth}"` : ''} />`;
      default:
        return '';
    }
  }).join('\n  ');

  const texts = spec.texts.map((text, i) => {
    return `<text x="${text.x}" y="${text.y}" font-size="${text.fontSize}" font-family="${text.fontFamily}" font-weight="${text.fontWeight}" fill="${text.fill}" ${text.textAnchor ? `text-anchor="${text.textAnchor}"` : ''} ${text.letterSpacing ? `letter-spacing="${text.letterSpacing}"` : ''}>${text.content}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${spec.canvas.width}" height="${spec.canvas.height}" viewBox="0 0 ${spec.canvas.width} ${spec.canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${spec.canvas.width}" height="${spec.canvas.height}" fill="${spec.canvas.backgroundColor}" />
  ${shapes}
  ${texts}
</svg>`;
}
```

---

## Database Layer

### Firestore CRUD Functions (Client-Side)

**File:** `packages/db/src/firebase/logos.ts` (CREATE NEW)

See full implementation in previous plan section. Key functions:
- `createLogo(logo)` - Create new logo document
- `getLogo(logoId)` - Fetch logo by ID
- `updateLogo(logoId, updates)` - Update logo
- `listLogos(tenantId, userId, limit)` - List user's logos
- `deleteLogo(logoId)` - Delete logo
- `getPrimaryLogo(tenantId, userId)` - Get user's primary logo

### Firestore Admin Functions (Server-Side)

**File:** `packages/db/src/firebase/logos.server.ts` (CREATE NEW)

Key functions:
- `createLogoAdmin(logo)` - Server-side create
- `getLogoAdmin(logoId)` - Server-side fetch
- `updateLogoAdmin(logoId, updates)` - Server-side update
- `deleteLogoAdmin(logoId)` - Server-side delete
- `unsetPrimaryLogoForUser(tenantId, userId)` - **NEW** - Unset isPrimary on all user logos (for primary logo enforcement)

```typescript
/**
 * Unset isPrimary for all logos belonging to a user
 * DECISION: Only one logo can be primary per user
 */
export async function unsetPrimaryLogoForUser(tenantId: string, userId: string): Promise<void> {
  const snapshot = await adminDb
    .collection('logos')
    .where('tenantId', '==', tenantId)
    .where('userId', '==', userId)
    .where('isPrimary', '==', true)
    .get();

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isPrimary: false, updatedAt: new Date() });
  });

  await batch.commit();
}
```

### Package Exports

**File:** `packages/db/src/index.ts` (UPDATE)

```typescript
// Add to existing exports:
export {
  createLogo,
  getLogo,
  updateLogo,
  listLogos,
  deleteLogo,
  getPrimaryLogo,
  type Logo,
} from './firebase/logos.js';
```

---

## Integration Points

### 1. Dashboard Navigation (DECISION: Add to sidebar)

**File:** `app/dashboard/layout.tsx` or navigation component (MODIFY EXISTING)

Add "Logo Studio" link under Business Track section:

```tsx
<nav>
  <h3>Business Track</h3>
  <ul>
    <li><Link href="/dashboard/business/ai-assistant">AI Assistant</Link></li>
    <li><Link href="/dashboard/business/streamlined-plan">Streamlined Plan</Link></li>
    {/* ... other links ... */}
    <li><Link href="/dashboard/business/logo-studio">Logo Studio</Link></li> {/* NEW */}
  </ul>
</nav>
```

### 2. Generate Logo from Business Plan

**File:** `app/dashboard/business/streamlined-plan/page.tsx` (MODIFY EXISTING)

Add "Generate Logo" button:

```tsx
<div className="flex justify-end gap-3 mt-6">
  <button
    onClick={() => router.push(`/dashboard/business/logo-studio?businessPlanId=${resultId}`)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Generate Logo from This Plan
  </button>
</div>
```

**Repeat for:**
- `app/dashboard/business/exec-summary/page.tsx`
- `app/dashboard/business/market-analysis/page.tsx`
- `app/dashboard/business/financial-overview/page.tsx`

### 3. Website Builder Integration (PHASE 3)

**File:** `app/dashboard/business/websites/new/components/Step1BrandBasics.tsx` (MODIFY - PHASE 3)

Add "Use My Logo" button to load primary logo:

```tsx
{/* Logo Upload Section */}
<div>
  <label className="text-sm font-medium">Logo</label>
  <div className="flex gap-2">
    <input
      type="file"
      accept="image/*"
      onChange={handleLogoUpload}
      className="flex-1"
    />
    <button
      onClick={handleUsePrimaryLogo}
      className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
    >
      Use My Logo
    </button>
  </div>
</div>
```

```typescript
async function handleUsePrimaryLogo() {
  if (!currentUserId) return;

  const primaryLogo = await getPrimaryLogo('demo-tenant', currentUserId);
  if (!primaryLogo) {
    toast.error('No primary logo found. Create one in Logo Studio.');
    return;
  }

  // Convert LogoSpec to data URL and set as logoUrl
  const svgString = generateSVGString(primaryLogo.currentSpec);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  setWizardInput({ ...wizardInput, logoUrl: url });
  toast.success('Logo loaded!');
}
```

---

## Migration & Deployment

### Firestore Indexes

**Create these composite indexes in Firebase Console:**

```
Collection: logos

Index 1:
  - tenantId (Ascending)
  - userId (Ascending)
  - createdAt (Descending)

Index 2:
  - tenantId (Ascending)
  - businessPlanId (Ascending)
  - createdAt (Descending)

Index 3:
  - tenantId (Ascending)
  - userId (Ascending)
  - isPrimary (Ascending)
```

**Automatic Index Creation:**

Firestore will prompt you to create indexes when you first run queries. Alternatively, deploy with `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "logos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "logos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "businessPlanId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "logos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isPrimary", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### Environment Variables

Ensure `.env.local` has:

```bash
ANTHROPIC_API_KEY=sk-ant-... # Already exists
NEXT_PUBLIC_FIREBASE_API_KEY=... # Already exists
NEXT_PUBLIC_FIREBASE_PROJECT_ID=... # Already exists
# ... other Firebase config
```

### Package Build Order

After creating new files in `packages/`:

```bash
npm run build:packages
```

This rebuilds `packages/shared`, `packages/db`, and `packages/ai-core` in order.

---

## Implementation Phases

### PHASE 1: MVP Vector Logo Generator & Viewer (CORE - 2-3 days)

**Goal:** Generate logos from business plans and view/select concepts. No editing yet.

#### Tasks

**1. Data Model & Types** ⏱️ 30 min
- [ ] Add logo types to `packages/shared/src/types.ts`
- [ ] Add logo schemas to `packages/shared/src/schemas.ts`
- [ ] Export new types from `packages/shared/src/index.ts`

**2. Database Layer** ⏱️ 1 hour
- [ ] Create `packages/db/src/firebase/logos.ts` (client CRUD)
- [ ] Create `packages/db/src/firebase/logos.server.ts` (server admin functions)
- [ ] Export logo functions from `packages/db/src/index.ts`

**3. AI Generator** ⏱️ 2-3 hours
- [ ] Create `packages/ai-core/src/generators/logoGenerator.ts`
  - [ ] `generateLogoBrief()` with Claude prompt
  - [ ] `generateLogoConcepts()` with Claude prompt
  - [ ] JSON schema enforcement
  - [ ] Usage tracking
- [ ] Export from `packages/ai-core/src/index.ts`

**4. API Routes** ⏱️ 2 hours
- [ ] `app/api/logo/brief/route.ts` (POST)
- [ ] `app/api/logo/spec/route.ts` (POST)
- [ ] `app/api/logo/save/route.ts` (POST)
- [ ] `app/api/logo/[id]/route.ts` (GET, DELETE)

**5. Frontend - Logo Generation Wizard** ⏱️ 3-4 hours
- [ ] Create `app/dashboard/business/logo-studio/page.tsx`
- [ ] Implement 3-step wizard (select plan → generate brief → generate concepts)
- [ ] Create `ConceptSelector.tsx` (thumbnail grid)
- [ ] Create `svgRenderer.tsx` utility
- [ ] Create basic `LogoCanvas.tsx` (view-only, no editing)

**6. Integration** ⏱️ 30 min
- [ ] Add "Logo Studio" link to dashboard navigation
- [ ] Add "Generate Logo" button to streamlined-plan page

**7. Testing** ⏱️ 1-2 hours
- [ ] Test end-to-end flow (business plan → brief → concepts → save)
- [ ] Test with various business plans
- [ ] Verify Firestore documents save correctly
- [ ] Create Firestore indexes

**Phase 1 Deliverables:**
- ✅ User can generate logo concepts from business plan
- ✅ User can view 2-3 concepts and select one
- ✅ Selected concept is saved to Firestore
- ❌ No editing yet (view-only)
- ❌ No export yet

---

### PHASE 2: Logo Studio Editor (EDITING & EXPORT - 3-4 days)

**Goal:** Enable full logo editing and export to PNG/SVG.

#### Tasks

**1. Editor State Management** ⏱️ 2-3 hours
- [ ] Create `useLogoEditor.ts` hook
  - [ ] State: `currentSpec`, `selectedElementId`, `history`
  - [ ] Methods: `updateShape()`, `updateText()`, `deleteElement()`
  - [ ] Undo/redo with history stack

**2. Interactive Logo Canvas** ⏱️ 3-4 hours
- [ ] Update `LogoCanvas.tsx` for editing
  - [ ] Click-to-select elements
  - [ ] Highlight selected element (blue border)
  - [ ] (Optional) Drag-to-move functionality

**3. Properties Panel** ⏱️ 4-5 hours
- [ ] Create `PropertiesPanel.tsx`
  - [ ] Element list sidebar
  - [ ] Property inputs for selected element (position, size, color, text)
  - [ ] Delete element button
  - [ ] Canvas background color picker

**4. Save & Auto-Save** ⏱️ 1 hour
- [ ] Add "Save" button in header
- [ ] Call `/api/logo/save` with `currentSpec`
- [ ] (Optional) Auto-save every 30 seconds

**5. Export Functionality** ⏱️ 2-3 hours
- [ ] Create `svgExport.ts` utility
  - [ ] `exportAsSVG()` - generate SVG file, download
  - [ ] `exportAsPNG()` - render to canvas, export PNG at multiple sizes
- [ ] Create `ExportDialog.tsx`
  - [ ] Format selection (SVG, PNG)
  - [ ] PNG size options (512, 1024, 2048)
- [ ] Add "Export" button in header

**6. Testing** ⏱️ 2 hours
- [ ] Test editing all element types
- [ ] Test undo/redo
- [ ] Test save/load cycle
- [ ] Test PNG export at multiple sizes
- [ ] Test SVG export (validate in design tools)

**Phase 2 Deliverables:**
- ✅ User can edit logo elements (colors, sizes, positions, text)
- ✅ User can save changes to Firestore
- ✅ User can export logos as PNG or SVG
- ✅ Undo/redo support

---

### PHASE 3: Advanced Features & Integration (OPTIONAL - 2-3 days)

**Goal:** AI refinement, platform integration, advanced editing tools.

#### Tasks

**1. AI Logo Refinement** ⏱️ 3-4 hours
- [ ] Add "Refine This Concept" button
- [ ] LLM prompt: send current spec + user feedback → updated spec
- [ ] Add "Generate Variations" button
- [ ] LLM creates 2-3 variations (color swaps, layout tweaks)

**2. Website Builder Integration** ⏱️ 2 hours
- [ ] Modify `Step1BrandBasics.tsx`
- [ ] Add "Use My Logo" button
- [ ] Fetch `getPrimaryLogo()` and insert into `wizardInput.logoUrl`

**3. Dashboard Branding** ⏱️ 1 hour
- [ ] Display primary logo in Business Track dashboard header
- [ ] Fetch `getPrimaryLogo()` on dashboard load

**4. Advanced Editing Tools** ⏱️ 4-6 hours
- [ ] Layer management (bring to front, send to back)
- [ ] Alignment tools (align left/center/right, distribute evenly)
- [ ] Grid/snap-to-grid
- [ ] Grouping/ungrouping elements

**5. Logo Templates** ⏱️ 3-4 hours
- [ ] Create 10-15 pre-built logo templates (JSON specs)
- [ ] Add "Start from Template" option in wizard
- [ ] LLM customizes template with user's company name & colors

**6. Version History** ⏱️ 3-4 hours
- [ ] Save multiple versions of a logo in Firestore
- [ ] Add "Version History" panel
- [ ] Allow restore to previous version

**Phase 3 Deliverables:**
- ✅ AI-powered logo refinement and variations
- ✅ Logo integration with Website Builder, Dashboard
- ✅ Advanced editing tools
- ✅ Logo templates and version history

---

## File Checklist

### Files to CREATE

#### Backend (Packages)
- [ ] `packages/shared/src/types.ts` - ADD logo types
- [ ] `packages/shared/src/schemas.ts` - ADD logo schemas
- [ ] `packages/ai-core/src/generators/logoGenerator.ts` - NEW
- [ ] `packages/db/src/firebase/logos.ts` - NEW
- [ ] `packages/db/src/firebase/logos.server.ts` - NEW

#### Backend (API Routes)
- [ ] `app/api/logo/brief/route.ts` - NEW
- [ ] `app/api/logo/spec/route.ts` - NEW
- [ ] `app/api/logo/save/route.ts` - NEW
- [ ] `app/api/logo/[id]/route.ts` - NEW

#### Frontend (Logo Studio)
- [ ] `app/dashboard/business/logo-studio/page.tsx` - NEW
- [ ] `app/dashboard/business/logo-studio/components/LogoCanvas.tsx` - NEW
- [ ] `app/dashboard/business/logo-studio/components/ConceptSelector.tsx` - NEW
- [ ] `app/dashboard/business/logo-studio/components/PropertiesPanel.tsx` - NEW (Phase 2)
- [ ] `app/dashboard/business/logo-studio/components/ExportDialog.tsx` - NEW (Phase 2)
- [ ] `app/dashboard/business/logo-studio/hooks/useLogoEditor.ts` - NEW (Phase 2)
- [ ] `app/dashboard/business/logo-studio/utils/svgRenderer.tsx` - NEW
- [ ] `app/dashboard/business/logo-studio/utils/svgExport.ts` - NEW (Phase 2)

### Files to MODIFY

#### Package Exports
- [ ] `packages/shared/src/index.ts` - Export logo types
- [ ] `packages/db/src/index.ts` - Export logo functions
- [ ] `packages/ai-core/src/index.ts` - Export logo generator

#### Integration Points
- [ ] `app/dashboard/layout.tsx` (or nav component) - Add "Logo Studio" link
- [ ] `app/dashboard/business/streamlined-plan/page.tsx` - Add "Generate Logo" button
- [ ] `app/dashboard/business/exec-summary/page.tsx` - Add "Generate Logo" button (optional)
- [ ] `app/dashboard/business/websites/new/components/Step1BrandBasics.tsx` - Add "Use My Logo" button (Phase 3)

---

## Testing Strategy

### Unit Tests

**Test:** `packages/ai-core/src/generators/__tests__/logoGenerator.test.ts`

```typescript
import { generateLogoBrief, generateLogoConcepts } from '../logoGenerator';

describe('Logo Generator', () => {
  it('should generate a valid design brief', async () => {
    const result = await generateLogoBrief({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      companyName: 'Acme Corp',
      businessContext: 'B2B SaaS project management tool',
    });

    expect(result.brief).toBeDefined();
    expect(result.brief.brandAdjectives).toHaveLength.greaterThan(1);
    expect(result.brief.colorPalette.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should generate 3 logo concepts', async () => {
    const brief = { /* mock brief */ };
    const result = await generateLogoConcepts({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      brief,
      companyName: 'Acme Corp',
      numConcepts: 3,
    });

    expect(result.concepts).toHaveLength(3);
    expect(result.concepts[0].canvas.width).toBe(500);
    expect(result.concepts[0].canvas.height).toBe(500);
  });
});
```

### Integration Tests

**Test:** `app/api/logo/__tests__/routes.test.ts`

```typescript
import { POST as generateBrief } from '../brief/route';
import { POST as generateSpec } from '../spec/route';
import { POST as saveLogo } from '../save/route';

describe('Logo API Routes', () => {
  it('POST /api/logo/brief should return a design brief', async () => {
    const req = new NextRequest('http://localhost:3000/api/logo/brief', {
      method: 'POST',
      body: JSON.stringify({
        tenantId: 'test-tenant',
        userId: 'test-user',
        companyName: 'Test Co',
        businessPlanText: 'Test business plan',
      }),
    });

    const res = await generateBrief(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.brief).toBeDefined();
  });

  // ... similar tests for /spec and /save
});
```

### E2E Tests

**Test:** `e2e/logo-studio.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Logo Studio', () => {
  test('should generate and save a logo', async ({ page }) => {
    await page.goto('/dashboard/business/logo-studio');

    // Step 1: Enter company name
    await page.fill('input[placeholder="Acme Corp"]', 'Test Company');
    await page.click('button:has-text("Generate Logo Brief")');

    // Wait for brief
    await page.waitForSelector('text=Brand Adjectives');

    // Step 2: Generate concepts
    await page.click('button:has-text("Generate 3 Logo Concepts")');

    // Wait for concepts
    await page.waitForSelector('text=Concept 1');

    // Step 3: Select concept and save
    await page.click('button:has-text("Save Logo")');

    // Verify redirect or success message
    await expect(page).toHaveURL(/logo-studio\?logoId=/);
  });
});
```

---

## Summary

This implementation plan provides a **complete, step-by-step roadmap** for adding a Canva-lite logo generator to KimuntuPro AI.

### Key Highlights

✅ **Architecture-Aware:** Follows existing codebase patterns (API routes, Firestore, AI generators)
✅ **Design Decisions Incorporated:** System fonts, fixed canvas, primary logo enforcement, same quota
✅ **Phased Approach:** MVP (Phase 1) → Editor (Phase 2) → Advanced (Phase 3)
✅ **Production-Ready:** Includes testing, migration, integration points
✅ **File-Level Detail:** Exact file paths, code sketches, export patterns

### Next Steps

1. **Review & Approve:** Confirm approach and phase priorities
2. **Phase 1 Implementation:** Start with MVP (generate + view logos)
3. **Iterate:** Test, gather feedback, move to Phase 2
4. **Deploy:** Launch feature to users

---

**Ready to start implementation?** Let's begin with Phase 1! 🚀
