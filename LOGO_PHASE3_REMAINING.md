# Logo Generator - Phase 3 Remaining Features Implementation Plan

## Critical Fixes (Priority 1)

### 1. Enable Primary Logo Setting ⏱️ 30 minutes

**Problem:** Users cannot set a logo as primary. The `isPrimary` field exists in the database but there's no UI to change it.

**Solution:** Add "Set as Primary" button to logo list and detail pages.

#### Files to Modify:

**A. Logo List Page (`app/dashboard/business/logos/page.tsx`)**

Add a star button to each logo card:

```typescript
// In the logo card actions section, add:
<button
  onClick={() => handleSetPrimary(logo.id)}
  disabled={logo.isPrimary}
  className={`px-3 py-2 rounded-lg transition-colors ${
    logo.isPrimary
      ? 'bg-yellow-500/20 text-yellow-400 cursor-default'
      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
  }`}
  title={logo.isPrimary ? 'Primary logo' : 'Set as primary'}
>
  <Star className={`w-4 h-4 ${logo.isPrimary ? 'fill-yellow-400' : ''}`} />
</button>
```

Add handler function:

```typescript
const handleSetPrimary = async (logoId: string) => {
  const user = auth.currentUser;
  if (!user) {
    toast.error('Please sign in');
    return;
  }

  try {
    // Fetch the logo
    const response = await fetch(`/api/logo/${logoId}`);
    if (!response.ok) throw new Error('Failed to fetch logo');

    const { logo } = await response.json();

    // Save with isPrimary=true (this will auto-unset others)
    const saveResponse = await fetch('/api/logo/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logoId,
        tenantId: 'demo-tenant',
        userId: user.uid,
        businessPlanId: logo.businessPlanId,
        companyName: logo.companyName,
        brief: logo.brief,
        concepts: logo.concepts,
        currentSpec: logo.currentSpec,
        isPrimary: true, // Set as primary
        generationMetadata: logo.generationMetadata,
      }),
    });

    if (!saveResponse.ok) throw new Error('Failed to set primary logo');

    toast.success('Set as primary logo!');

    // Refresh the list
    const updatedLogos = await listLogos('demo-tenant', user.uid, 50);
    setLogos(updatedLogos);
  } catch (error: any) {
    console.error('[Logos] Failed to set primary:', error);
    toast.error(error.message || 'Failed to set primary logo');
  }
};
```

**B. Logo Detail Page (`app/dashboard/business/logos/[id]/page.tsx`)**

Add "Set as Primary" button in the header actions:

```typescript
// In the header actions div, add before Download button:
{!logo.isPrimary && (
  <button
    onClick={handleSetPrimary}
    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
  >
    <Star className="w-4 h-4" />
    Set as Primary
  </button>
)}
```

Add handler:

```typescript
const handleSetPrimary = async () => {
  const user = auth.currentUser;
  if (!user || !logo) return;

  try {
    const response = await fetch('/api/logo/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logoId: logo.id,
        tenantId: logo.tenantId,
        userId: user.uid,
        businessPlanId: logo.businessPlanId,
        companyName: logo.companyName,
        brief: logo.brief,
        concepts: logo.concepts,
        currentSpec: logo.currentSpec,
        isPrimary: true,
        generationMetadata: logo.generationMetadata,
      }),
    });

    if (!response.ok) throw new Error('Failed to set primary logo');

    toast.success('Set as primary logo!');
    setLogo({ ...logo, isPrimary: true });
  } catch (error: any) {
    console.error('[LogoDetail] Failed to set primary:', error);
    toast.error(error.message || 'Failed to set primary logo');
  }
};
```

**C. Step 3 (Concept Selection) - Save as Primary Option**

Add checkbox in Step3SelectConcept.tsx:

```typescript
// Add state:
const [saveAsPrimary, setSaveAsPrimary] = useState(false);

// Add checkbox before Save button:
<label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
  <input
    type="checkbox"
    checked={saveAsPrimary}
    onChange={(e) => setSaveAsPrimary(e.target.checked)}
    className="w-4 h-4 rounded border-gray-600 text-emerald-600 focus:ring-emerald-500"
  />
  <Star className="w-4 h-4 text-yellow-400" />
  Set as primary logo
</label>

// Update handleSaveLogo to use saveAsPrimary:
isPrimary: saveAsPrimary,
```

---

### 2. Verify Website Builder Integration ⏱️ 15 minutes

**Problem:** User reports not seeing "Use My Logo" button in website builder.

**Root Cause Analysis:**
1. User may not have a primary logo set (no logos with `isPrimary: true`)
2. Button only shows when `hasPrimaryLogo && !logoPreview`
3. User may already have a logo uploaded

**Solution:** Improve visibility and add fallback messaging.

#### Files to Modify:

**A. Step1BrandBasics.tsx**

Update the "Use My Logo" button section to be more visible:

```typescript
// Replace the current button section with:
<div className="flex items-center justify-between mb-3">
  <label className="block text-sm font-medium text-gray-200">
    Logo <span className="text-gray-500">(Optional)</span>
  </label>

  {/* Show button even if logo is loaded, but change text */}
  {hasPrimaryLogo && (
    <button
      type="button"
      onClick={logoPreview ? handleRemoveLogo : handleUseMyLogo}
      disabled={isLoadingPrimaryLogo}
      className={`flex items-center gap-2 px-3 py-1.5 text-white text-sm rounded-lg transition-colors ${
        logoPreview
          ? 'bg-gray-600 hover:bg-gray-700'
          : 'bg-purple-600 hover:bg-purple-700'
      } disabled:bg-gray-700 disabled:cursor-not-allowed`}
    >
      {isLoadingPrimaryLogo ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : logoPreview ? (
        <>
          <X className="w-4 h-4" />
          Clear Logo
        </>
      ) : (
        <>
          <Palette className="w-4 h-4" />
          Use My Logo
        </>
      )}
    </button>
  )}

  {/* Helpful message if no primary logo */}
  {!hasPrimaryLogo && !logoPreview && (
    <a
      href="/dashboard/business/logo-studio"
      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
    >
      <Palette className="w-3 h-3" />
      Create a logo
    </a>
  )}
</div>
```

**B. Add Debug Logging**

Add console log to verify primary logo check:

```typescript
useEffect(() => {
  async function checkPrimaryLogo() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const primaryLogo = await getPrimaryLogo('demo-tenant', user.uid);
      console.log('[Step1] Primary logo check:', primaryLogo ? 'Found' : 'None');
      setHasPrimaryLogo(!!primaryLogo);
    } catch (error) {
      console.error('[Step1] Failed to check primary logo:', error);
    }
  }

  checkPrimaryLogo();
}, []);
```

---

## Feature 1: AI Logo Refinement UI ⏱️ 4-5 hours

**Goal:** Add frontend UI for the AI refinement backend functions created in Phase 3.

### A. Create Refinement Dialog Component ⏱️ 2 hours

**File:** `app/dashboard/business/logo-studio/components/RefinementDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import type { LogoSpec } from '@kimuntupro/shared';

type RefinementMode = 'refine' | 'variations';

interface RefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpec: LogoSpec;
  companyName: string;
  onRefinementComplete: (concepts: LogoSpec[]) => void;
}

export default function RefinementDialog({
  isOpen,
  onClose,
  currentSpec,
  companyName,
  onRefinementComplete,
}: RefinementDialogProps) {
  const [mode, setMode] = useState<RefinementMode>('refine');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (mode === 'refine' && !feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setIsGenerating(true);

    try {
      const endpoint = mode === 'refine' ? '/api/logo/refine' : '/api/logo/variations';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpec,
          companyName,
          feedback: mode === 'refine' ? feedback : undefined,
          numVariations: mode === 'variations' ? 3 : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate');
      }

      const data = await response.json();
      onRefinementComplete(data.concepts);
      toast.success(
        mode === 'refine'
          ? 'Logo refined successfully!'
          : 'Variations generated successfully!'
      );
      onClose();
    } catch (error: any) {
      console.error('[RefinementDialog] Generation failed:', error);
      toast.error(error.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">AI Logo Refinement</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What would you like to do?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('refine')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    mode === 'refine'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">Refine with Feedback</div>
                  <div className="text-sm text-gray-400">
                    Provide specific feedback to improve the logo
                  </div>
                </button>

                <button
                  onClick={() => setMode('variations')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    mode === 'variations'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">Generate Variations</div>
                  <div className="text-sm text-gray-400">
                    Create 3 alternative versions with different colors/layouts
                  </div>
                </button>
              </div>
            </div>

            {/* Feedback Input (only for refine mode) */}
            {mode === 'refine' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., Make it more modern, use blue instead of red, increase text size..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be specific about what you'd like to change
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                {mode === 'refine' ? (
                  <>
                    <strong className="text-blue-400">Refine:</strong> AI will analyze your
                    feedback and update the logo while keeping the core concept recognizable.
                  </>
                ) : (
                  <>
                    <strong className="text-blue-400">Variations:</strong> AI will create 3
                    different versions exploring color schemes, layouts, and typography while
                    maintaining brand consistency.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (mode === 'refine' && !feedback.trim())}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

### B. Create API Routes ⏱️ 1 hour

**File:** `app/api/logo/refine/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { refineLogo } from '@kimuntupro/ai-core';

async function handleLogoRefinement(req: NextRequest): Promise<NextResponse> {
  try {
    const { currentSpec, companyName, feedback } = await req.json();

    if (!currentSpec || !companyName || !feedback) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await refineLogo({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      currentSpec,
      companyName,
      feedback,
    });

    return NextResponse.json({
      success: true,
      concepts: result.concepts,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('[Logo Refine] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export const POST = withQuotaGuard(handleLogoRefinement, { for: 'executor' });
```

**File:** `app/api/logo/variations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { generateLogoVariations } from '@kimuntupro/ai-core';

async function handleLogoVariations(req: NextRequest): Promise<NextResponse> {
  try {
    const { currentSpec, companyName, numVariations = 3 } = await req.json();

    if (!currentSpec || !companyName) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateLogoVariations({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      currentSpec,
      companyName,
      numVariations,
    });

    return NextResponse.json({
      success: true,
      concepts: result.concepts,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('[Logo Variations] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export const POST = withQuotaGuard(handleLogoVariations, { for: 'executor' });
```

### C. Integrate into Logo Editor ⏱️ 1-2 hours

**File:** `app/dashboard/business/logo-studio/edit/[id]/page.tsx`

```typescript
// Add state:
const [showRefinementDialog, setShowRefinementDialog] = useState(false);
const [refinedConcepts, setRefinedConcepts] = useState<LogoSpec[]>([]);
const [showConceptSelector, setShowConceptSelector] = useState(false);

// Add import:
import RefinementDialog from '../../components/RefinementDialog';
import ConceptSelector from '../../components/ConceptSelector';

// Add button in header (after Undo/Redo):
<button
  onClick={() => setShowRefinementDialog(true)}
  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
>
  <Sparkles className="w-4 h-4" />
  AI Refine
</button>

// Add handler:
const handleRefinementComplete = (concepts: LogoSpec[]) => {
  setRefinedConcepts(concepts);
  setShowConceptSelector(true);
};

const handleConceptSelect = (index: number) => {
  const selectedConcept = refinedConcepts[index];
  editor.loadSpec(selectedConcept);
  setShowConceptSelector(false);
  setRefinedConcepts([]);
  toast.success('Concept applied! Remember to save your changes.');
};

// Add dialogs at bottom:
<RefinementDialog
  isOpen={showRefinementDialog}
  onClose={() => setShowRefinementDialog(false)}
  currentSpec={editor.currentSpec!}
  companyName={logo.companyName}
  onRefinementComplete={handleRefinementComplete}
/>

{showConceptSelector && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Select a Concept</h2>
      <ConceptSelector
        concepts={refinedConcepts}
        selectedIndex={0}
        onSelect={handleConceptSelect}
      />
      <button
        onClick={() => {
          setShowConceptSelector(false);
          setRefinedConcepts([]);
        }}
        className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

---

## Feature 2: Advanced Editing Tools ⏱️ 6-8 hours

### A. Layer Management ⏱️ 2-3 hours

**Goal:** Allow users to reorder elements (bring to front, send to back).

**File:** `app/dashboard/business/logo-studio/hooks/useLogoEditor.ts`

Add methods:

```typescript
const bringToFront = useCallback(
  (type: 'shape' | 'text', index: number) => {
    if (!currentSpec) return;

    if (type === 'shape') {
      const newShapes = [...currentSpec.shapes];
      const [element] = newShapes.splice(index, 1);
      newShapes.push(element);

      updateWithHistory({
        ...currentSpec,
        shapes: newShapes,
      });
    } else {
      const newTexts = [...currentSpec.texts];
      const [element] = newTexts.splice(index, 1);
      newTexts.push(element);

      updateWithHistory({
        ...currentSpec,
        texts: newTexts,
      });
    }
  },
  [currentSpec, updateWithHistory]
);

const sendToBack = useCallback(
  (type: 'shape' | 'text', index: number) => {
    if (!currentSpec) return;

    if (type === 'shape') {
      const newShapes = [...currentSpec.shapes];
      const [element] = newShapes.splice(index, 1);
      newShapes.unshift(element);

      updateWithHistory({
        ...currentSpec,
        shapes: newShapes,
      });
    } else {
      const newTexts = [...currentSpec.texts];
      const [element] = newTexts.splice(index, 1);
      newTexts.unshift(element);

      updateWithHistory({
        ...currentSpec,
        texts: newTexts,
      });
    }
  },
  [currentSpec, updateWithHistory]
);

// Add to return object:
return {
  // ... existing
  bringToFront,
  sendToBack,
};
```

**File:** `app/dashboard/business/logo-studio/components/PropertiesPanel.tsx`

Add layer buttons to element properties:

```typescript
// In ShapeProperties and TextProperties, add after the header:
<div className="flex items-center gap-2 mb-4">
  <button
    onClick={() => onBringToFront(/* type, index */)}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
    title="Bring to front"
  >
    <ChevronUp className="w-4 h-4" />
    Front
  </button>
  <button
    onClick={() => onSendToBack(/* type, index */)}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
    title="Send to back"
  >
    <ChevronDown className="w-4 h-4" />
    Back
  </button>
</div>
```

### B. Alignment Tools ⏱️ 2-3 hours

Add alignment methods to `useLogoEditor.ts`:

```typescript
const alignElements = useCallback(
  (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!currentSpec || !selectedElementId) return;

    const [type, indexStr] = selectedElementId.split('-');
    const index = parseInt(indexStr, 10);

    if (type === 'shape') {
      const shape = currentSpec.shapes[index];
      const updates: Partial<LogoShape> = {};

      // Calculate alignment based on canvas center (250, 250)
      if (alignment === 'center') {
        if ('x' in shape) updates.x = 250 - shape.width / 2;
        if ('cx' in shape) updates.cx = 250;
      }
      if (alignment === 'left') {
        if ('x' in shape) updates.x = 0;
        if ('cx' in shape) updates.cx = shape.r || 0;
      }
      if (alignment === 'right') {
        if ('x' in shape) updates.x = 500 - shape.width;
        if ('cx' in shape) updates.cx = 500 - (shape.r || 0);
      }
      if (alignment === 'middle') {
        if ('y' in shape) updates.y = 250 - shape.height / 2;
        if ('cy' in shape) updates.cy = 250;
      }
      if (alignment === 'top') {
        if ('y' in shape) updates.y = 0;
        if ('cy' in shape) updates.cy = shape.r || 0;
      }
      if (alignment === 'bottom') {
        if ('y' in shape) updates.y = 500 - shape.height;
        if ('cy' in shape) updates.cy = 500 - (shape.r || 0);
      }

      updateShape(index, updates);
    } else {
      const text = currentSpec.texts[index];
      const updates: Partial<LogoText> = {};

      if (alignment === 'center') {
        updates.x = 250;
        updates.textAnchor = 'middle';
      }
      if (alignment === 'left') {
        updates.x = 0;
        updates.textAnchor = 'start';
      }
      if (alignment === 'right') {
        updates.x = 500;
        updates.textAnchor = 'end';
      }
      if (alignment === 'middle') updates.y = 250;
      if (alignment === 'top') updates.y = text.fontSize;
      if (alignment === 'bottom') updates.y = 500;

      updateText(index, updates);
    }
  },
  [currentSpec, selectedElementId, updateShape, updateText]
);
```

Add alignment toolbar to PropertiesPanel:

```typescript
// Add after delete button in element properties:
<div className="border-t border-gray-800 pt-4 mt-4">
  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
    Alignment
  </h4>
  <div className="grid grid-cols-3 gap-2">
    <button
      onClick={() => onAlign('left')}
      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
      title="Align left"
    >
      <AlignLeft className="w-4 h-4 mx-auto" />
    </button>
    <button
      onClick={() => onAlign('center')}
      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
      title="Align center"
    >
      <AlignCenter className="w-4 h-4 mx-auto" />
    </button>
    <button
      onClick={() => onAlign('right')}
      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
      title="Align right"
    >
      <AlignRight className="w-4 h-4 mx-auto" />
    </button>
    <button
      onClick={() => onAlign('top')}
      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
      title="Align top"
    >
      <AlignVerticalJustifyStart className="w-4 h-4 mx-auto" />
    </button>
    <button
      onClick={() => onAlign('middle')}
      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
      title="Align middle"
    >
      <AlignVerticalJustifyCenter className="w-4 h-4 mx-auto" />
    </button>
    <button
      onClick={() => onAlign('bottom')}
      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
      title="Align bottom"
    >
      <AlignVerticalJustifyEnd className="w-4 h-4 mx-auto" />
    </button>
  </div>
</div>
```

### C. Grid & Snap-to-Grid ⏱️ 2 hours

Add grid overlay to LogoCanvas and snap functionality to useLogoEditor.

**File:** `app/dashboard/business/logo-studio/components/LogoCanvas.tsx`

```typescript
// Add props:
interface LogoCanvasProps {
  // ... existing
  showGrid?: boolean;
  gridSize?: number;
}

// Add grid rendering in interactive mode:
{showGrid && (
  <defs>
    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
      <path
        d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.5"
      />
    </pattern>
  </defs>
)}
{showGrid && <rect width="500" height="500" fill="url(#grid)" />}
```

**File:** `app/dashboard/business/logo-studio/hooks/useLogoEditor.ts`

```typescript
// Add snap helper:
const snapToGrid = (value: number, gridSize: number = 10): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Update shape/text update methods to snap when enabled
```

---

## Feature 3: Logo Templates ⏱️ 5-6 hours

### A. Create Template Library ⏱️ 2-3 hours

**File:** `app/dashboard/business/logo-studio/templates/templates.ts`

```typescript
import type { LogoSpec } from '@kimuntupro/shared';

export const LOGO_TEMPLATES: Record<string, LogoSpec> = {
  'modern-wordmark': {
    version: '1.0',
    canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
    shapes: [],
    texts: [
      {
        content: 'COMPANY',
        x: 250,
        y: 250,
        fontSize: 48,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        fill: '#000000',
        textAnchor: 'middle',
        letterSpacing: 8,
      },
    ],
    metadata: {
      conceptName: 'Modern Wordmark',
      description: 'Clean, bold typography',
      generatedAt: new Date(),
    },
  },
  'circle-monogram': {
    version: '1.0',
    canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
    shapes: [
      {
        type: 'circle',
        cx: 250,
        cy: 250,
        r: 120,
        fill: '#000000',
      },
    ],
    texts: [
      {
        content: 'C',
        x: 250,
        y: 280,
        fontSize: 120,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        textAnchor: 'middle',
      },
    ],
    metadata: {
      conceptName: 'Circle Monogram',
      description: 'Letter in circle badge',
      generatedAt: new Date(),
    },
  },
  // Add 10-15 more templates...
};

export const TEMPLATE_CATEGORIES = {
  wordmark: ['modern-wordmark', 'serif-elegant'],
  lettermark: ['circle-monogram', 'square-initial'],
  icon: ['abstract-symbol', 'geometric-icon'],
  combination: ['icon-text-horizontal', 'icon-text-stacked'],
};
```

### B. Template Selection UI ⏱️ 2-3 hours

**File:** `app/dashboard/business/logo-studio/components/TemplateSelector.tsx`

Create a template browser with preview cards, similar to ConceptSelector but with categories.

### C. AI Template Customization ⏱️ 1 hour

**File:** `app/api/logo/customize-template/route.ts`

```typescript
// API route that takes a template + company info
// Uses Claude to replace placeholder text and adjust colors
```

---

## Feature 4: Version History ⏱️ 6-7 hours

### A. Update Data Model ⏱️ 1 hour

**File:** `packages/shared/src/types.ts`

```typescript
export interface LogoVersion {
  versionNumber: number;
  spec: LogoSpec;
  savedAt: Date;
  note?: string;
}

export interface LogoDocument {
  // ... existing fields
  versions?: LogoVersion[]; // Array of saved versions
}
```

### B. Version Storage ⏱️ 2 hours

**File:** `packages/db/src/firebase/logos.server.ts`

Add version management functions:

```typescript
export async function saveLogoVersion(
  logoId: string,
  spec: LogoSpec,
  note?: string
): Promise<void> {
  // Implementation
}

export async function getLogoVersions(logoId: string): Promise<LogoVersion[]> {
  // Implementation
}

export async function restoreLogoVersion(
  logoId: string,
  versionNumber: number
): Promise<void> {
  // Implementation
}
```

### C. Version History Panel ⏱️ 3-4 hours

**File:** `app/dashboard/business/logo-studio/components/VersionHistoryPanel.tsx`

Create a drawer/panel that shows:
- List of saved versions with timestamps
- Preview thumbnails
- Restore button
- Compare view (side-by-side)

---

## Testing Checklist

### Critical Fixes
- [ ] Set primary logo from list page
- [ ] Set primary logo from detail page
- [ ] Save new logo as primary during creation
- [ ] Verify "Use My Logo" button shows in website builder
- [ ] Verify primary logo loads into website builder
- [ ] Verify primary logo displays in dashboard header

### AI Refinement
- [ ] Test "Refine with Feedback" mode
- [ ] Test "Generate Variations" mode
- [ ] Verify concept selection works
- [ ] Verify refined logos can be saved

### Advanced Editing
- [ ] Test bring to front
- [ ] Test send to back
- [ ] Test all 6 alignment options
- [ ] Test grid display toggle
- [ ] Test snap-to-grid

### Templates
- [ ] Browse template library
- [ ] Select and apply template
- [ ] AI customize template with company info

### Version History
- [ ] Save version with note
- [ ] View version history
- [ ] Restore previous version
- [ ] Compare versions side-by-side

---

## Priority Order

1. **CRITICAL FIXES** (Must do first!)
   - Primary logo setting
   - Website builder integration verification

2. **AI Refinement UI** (High value, backend exists)

3. **Advanced Editing Tools** (Enhances editor)

4. **Logo Templates** (Nice to have)

5. **Version History** (Nice to have)

---

## Estimated Total Time

- Critical Fixes: **45 minutes**
- AI Refinement UI: **4-5 hours**
- Advanced Editing: **6-8 hours**
- Templates: **5-6 hours**
- Version History: **6-7 hours**

**Total: 22-27 hours** (approximately 3-4 days of focused work)
