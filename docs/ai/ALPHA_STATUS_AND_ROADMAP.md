# AI Assistant Features - Alpha Status & Roadmap

**Date:** 2025-01-11
**Branch:** jarvis_dev
**Goal:** Production-ready Alpha version with clean UI/UX accessible from Business Track dashboard

---

## 📊 Current Implementation Status

### Feature #108: Streamlined Business Plan
**Status:** ⚠️ **75% Complete - Needs UI Polish & Integration**

#### ✅ What Works:
- Backend orchestration (planner + executor) fully implemented
- API endpoint `/api/ai/answer` accepting requests
- Generates 7 sections: Problem, Solution, ICP, GTM, 90-Day Milestones, KPIs, Next Actions
- Firebase authentication integration
- Basic error handling
- Quota middleware (currently disabled)
- Basic UI form and result display

#### ❌ What's Missing:
- Not integrated into main Business Track dashboard
- No PDF download capability
- Basic copy-to-clipboard (uses alert, not toast)
- No individual dedicated page/route
- UI doesn't match dashboard theme (dark gradient style)
- No loading skeleton states
- No result history/saved plans
- RAG (document retrieval) not connected

#### 🐛 Known Issues:
- Web search disabled (`OPENAI_WEB_SEARCH_ENABLED=false`)
- Quota enforcement disabled for demo (`DISABLE_QUOTA_ENFORCEMENT=true`)
- Demo tenant hardcoded (`demo-tenant`)
- Sources section shows but no actual sources without RAG

---

### Feature #109: Executive Summary + Financials
**Status:** ⚠️ **70% Complete - Needs Financial Tool Integration**

#### ✅ What Works:
- Backend assistant implemented with finance tool
- Advanced financial inputs (ARPU, COGS, Churn, New Customers, S&M Spend)
- Collapsible "Advanced Options" UI for finance inputs
- Generates sections: Summary, Financials, Runway Analysis
- API integration working

#### ❌ What's Missing:
- Finance tool calculations not fully tested
- No visual charts/graphs for financial data
- No export to CSV/Excel for financials
- PDF download with formatted financial tables
- Financial validation (negative numbers, unrealistic values)
- No tooltips explaining financial terms
- Not accessible from dashboard
- No comparison with industry benchmarks

#### 🐛 Known Issues:
- Financial projections may not handle edge cases (zero customers, negative margins)
- No currency formatting for international users
- Time period limited to months (no quarterly/annual)

---

### Feature #110: Market Analysis
**Status:** ⚠️ **60% Complete - Web Search Critical Missing**

#### ✅ What Works:
- Backend assistant structure in place
- API endpoint accepts requests
- UI form configured for market analysis
- Error handling for web search failures

#### ❌ What's Missing:
- **CRITICAL:** Web search completely disabled
  - `buildOpenAIWebSearchTools()` returns empty array
  - OpenAI's native `web_search` tool not supported
  - No Tavily integration implemented
- No real-time market data
- No competitor comparison table
- No market size visualization
- Sources section empty without web search
- No data freshness indicator
- Not accessible from dashboard

#### 🐛 Known Issues:
- Without web search, outputs rely only on LLM knowledge cutoff (Jan 2025)
- Cannot fetch live pricing, funding rounds, or recent news
- Market analysis accuracy degraded without real data

---

## 🎯 Path to Alpha Version

### Core Requirements for Alpha:
1. ✅ **Works reliably** - No critical bugs
2. ✅ **Clean UI** - Matches dashboard aesthetic
3. ✅ **Accessible** - Integrated into business dashboard navigation
4. ✅ **Copy & Download** - Copy to clipboard + PDF export for all outputs
5. ⚠️ **Basic web search** - At least for Market Analysis (#110)
6. ⚠️ **Error handling** - User-friendly error messages
7. ⚠️ **Loading states** - Clear feedback during generation

---

## 🛠️ Implementation Paths

### **Option A: Dashboard-First Integration (Recommended - 3-4 days)**

**Philosophy:** Make existing features easily accessible and polished before adding complexity

#### Day 1: Dashboard Integration & Navigation
- [ ] Create individual pages for each assistant:
  - `/dashboard/business/streamlined-plan`
  - `/dashboard/business/exec-summary`
  - `/dashboard/business/market-analysis`
- [ ] Update `QuickActions.jsx` to link to these pages
- [ ] Create unified layout component with:
  - Dark gradient background matching business theme
  - Consistent header with icon + title
  - Breadcrumb navigation
  - Back button to dashboard
- [ ] Add assistant cards to Business Track dashboard hero section

**Files to modify:**
```
app/dashboard/business/streamlined-plan/page.tsx       (NEW)
app/dashboard/business/exec-summary/page.tsx           (NEW)
app/dashboard/business/market-analysis/page.tsx        (NEW)
components/business/QuickActions.jsx                   (MODIFY)
components/business/Hero.jsx                           (MODIFY - add AI tools section)
app/dashboard/business/ai-assistant/page.tsx           (KEEP as legacy/all-in-one)
```

#### Day 2: UI/UX Polish & Theme Consistency
- [ ] Create `AssistantLayout.tsx` component with:
  - Dark gradient background: `from-gray-900 via-gray-800 to-black`
  - Glassmorphism cards: `bg-white/5 backdrop-blur border-gray-800`
  - Emerald/teal accent colors matching dashboard
  - Consistent spacing and typography
- [ ] Improve form inputs:
  - Larger, more prominent textarea
  - Better placeholder text with examples
  - Character count indicator
  - Input validation feedback
- [ ] Enhanced loading states:
  - Skeleton loaders for result sections
  - Progress indicator (estimating ~30-60s generation)
  - Animated pulse effects
- [ ] Better error displays:
  - Toast notifications instead of alerts
  - Retry button for failed requests
  - Help text for common errors

**Files to create/modify:**
```
components/ai/AssistantLayout.tsx                     (NEW)
components/ai/LoadingSkeleton.tsx                     (NEW)
components/ai/Toast.tsx                               (NEW)
app/dashboard/business/ai-assistant/TaskForm.tsx      (MODIFY)
app/dashboard/business/ai-assistant/ResultViewer.tsx  (MODIFY)
```

#### Day 3: Copy & PDF Export
- [ ] Implement proper clipboard copy:
  - Copy formatted markdown
  - Copy plain text
  - Copy as HTML (for pasting into docs)
  - Toast notification: "✓ Copied to clipboard"
- [ ] Implement PDF download using `jsPDF` or `react-pdf`:
  - Professional document formatting
  - Company branding (if available)
  - Section headers and proper spacing
  - Include metadata (date generated, assistant type)
  - Filename: `KimuntuPro_StreamlinedPlan_2025-01-11.pdf`
- [ ] Add export dropdown menu:
  - Copy as Markdown
  - Copy as Plain Text
  - Download as PDF
  - Download as Word Doc (future)

**Dependencies to add:**
```bash
npm install jspdf html2canvas
# or
npm install @react-pdf/renderer
```

**Files to modify:**
```
app/dashboard/business/ai-assistant/ResultViewer.tsx   (MODIFY)
components/ai/ExportDropdown.tsx                       (NEW)
lib/pdf/generatePDF.ts                                 (NEW)
```

#### Day 4: Web Search Integration (Tavily)
- [ ] Sign up for Tavily API (free tier: 1000 requests/month)
- [ ] Add to `.env.local`:
  ```bash
  WEBSEARCH_PROVIDER=tavily
  WEBSEARCH_API_KEY=tvly-...
  WEBSEARCH_MAX_RESULTS=10
  ```
- [ ] Implement Tavily adapter in `packages/ai-core/src/tools/webSearch.ts`:
  - Replace OpenAI web_search stub
  - Add Tavily API client
  - Map Tavily results to internal format
  - Implement caching (5min TTL)
- [ ] Update Market Analysis assistant to use web search
- [ ] Add "Live Data" badge when web search is used
- [ ] Display data freshness timestamp

**Files to modify:**
```
packages/ai-core/src/tools/webSearch.ts               (MODIFY)
packages/ai-core/src/assistants/marketAnalysis.ts     (MODIFY)
.env.example                                          (MODIFY)
app/dashboard/business/ai-assistant/ResultViewer.tsx  (MODIFY - add data badge)
```

---

### **Option B: Feature-Complete Polishing (Recommended for Post-Alpha - 1 week)**

**Philosophy:** Make each feature fully production-ready with advanced capabilities

#### Extended Features (Post-Alpha):
- [ ] **Result History:**
  - Save generated plans to database
  - View past generations in sidebar
  - Compare versions
  - Share links to results

- [ ] **Advanced Financials (#109):**
  - Interactive charts (Chart.js or Recharts)
  - Export to Excel with formulas
  - Scenario modeling (best/worst case)
  - Industry benchmark comparisons

- [ ] **Enhanced Market Analysis (#110):**
  - Competitor comparison table
  - Market size calculator
  - Trend analysis with historical data
  - SWOT matrix visualization

- [ ] **Collaborative Features:**
  - Team comments on sections
  - Version control
  - Export to Google Docs
  - Email sharing

- [ ] **Premium Features:**
  - Enable RAG with uploaded documents
  - Database-backed quotas
  - Usage analytics dashboard
  - Custom branding for exports

---

## 📋 Detailed Alpha Implementation Checklist

### Phase 1: Dashboard Integration (Day 1) ⏱️ 6-8 hours

#### 1.1 Create Individual Assistant Pages
```typescript
// app/dashboard/business/streamlined-plan/page.tsx
'use client';

import AssistantLayout from '@/components/ai/AssistantLayout';
import TaskForm from '@/app/dashboard/business/ai-assistant/TaskForm';
import ResultViewer from '@/app/dashboard/business/ai-assistant/ResultViewer';

export default function StreamlinedPlanPage() {
  const [result, setResult] = useState(null);

  return (
    <AssistantLayout
      title="Streamlined Business Plan"
      description="Generate a lean one-page business plan in under 60 seconds"
      icon="📈"
      backHref="/dashboard/business"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TaskForm
          assistant="streamlined_plan"
          onResult={setResult}
        />
        {result && <ResultViewer result={result} />}
      </div>
    </AssistantLayout>
  );
}
```

#### 1.2 Update QuickActions Component
```jsx
// components/business/QuickActions.jsx
export default function QuickActions() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Update existing cards */}
      <ActionCard
        icon="📈"
        title="Streamlined Business Plan"
        description="AI-powered lean one-page business plan"
        buttonText="Generate Plan"
        href="/dashboard/business/streamlined-plan"
        // Remove comingSoon flag
      />

      <ActionCard
        icon="💰"
        title="Executive Summary + Financials"
        description="Financial overview with 12-month projections"
        buttonText="Create Summary"
        href="/dashboard/business/exec-summary"
        // Remove comingSoon flag
      />

      <ActionCard
        icon="🔍"
        title="Market Analysis"
        description="AI-powered competitive intelligence with live data"
        buttonText="Analyze Market"
        href="/dashboard/business/market-analysis"
        // Remove comingSoon flag
      />

      {/* Keep other cards as-is */}
    </section>
  );
}
```

#### 1.3 Create Shared Layout Component
```typescript
// components/ai/AssistantLayout.tsx
'use client';

import Link from 'next/link';

interface AssistantLayoutProps {
  title: string;
  description: string;
  icon: string;
  backHref?: string;
  children: React.ReactNode;
}

export default function AssistantLayout({
  title,
  description,
  icon,
  backHref = '/dashboard/business',
  children
}: AssistantLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href={backHref} className="hover:text-emerald-400">Business Track</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-400 text-lg">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
```

---

### Phase 2: UI/UX Polish (Day 2) ⏱️ 8-10 hours

#### 2.1 Enhanced TaskForm with Loading States
```typescript
// Key improvements to TaskForm.tsx
- Add character counter: `{input.length}/1000 characters`
- Add input validation visual feedback
- Implement skeleton loader during generation
- Add estimated time remaining indicator
- Better error recovery (retry button)
```

#### 2.2 Polished ResultViewer
```typescript
// Key improvements to ResultViewer.tsx
- Use glassmorphism cards for sections
- Add smooth animations for result appearance
- Implement collapsible sections
- Add section-specific actions (copy individual section)
- Show data freshness badge for web search results
```

#### 2.3 Toast Notifications
```typescript
// components/ai/Toast.tsx
// Replace alert() with proper toast notifications
// Use react-hot-toast or custom implementation
import { Toaster, toast } from 'react-hot-toast';

// Success toast
toast.success('✓ Copied to clipboard');

// Error toast
toast.error('Failed to generate. Please try again.');

// Loading toast
const toastId = toast.loading('Generating your plan...');
// Later: toast.success('Complete!', { id: toastId });
```

---

### Phase 3: Export Features (Day 3) ⏱️ 8-10 hours

#### 3.1 Enhanced Copy to Clipboard
```typescript
// lib/clipboard/copy.ts
export function copyAsMarkdown(sections: Record<string, string>) {
  const markdown = Object.entries(sections)
    .map(([title, content]) => `## ${title}\n\n${content}`)
    .join('\n\n---\n\n');

  navigator.clipboard.writeText(markdown);
  toast.success('✓ Copied as Markdown');
}

export function copyAsPlainText(sections: Record<string, string>) {
  const text = Object.entries(sections)
    .map(([title, content]) => `${title.toUpperCase()}\n\n${content}`)
    .join('\n\n');

  navigator.clipboard.writeText(text);
  toast.success('✓ Copied as plain text');
}

export function copyAsHTML(sections: Record<string, string>) {
  const html = `
    <html>
      <body>
        ${Object.entries(sections)
          .map(([title, content]) => `
            <h2>${title}</h2>
            <p>${content.replace(/\n/g, '<br>')}</p>
          `)
          .join('')}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const item = new ClipboardItem({ 'text/html': blob });
  navigator.clipboard.write([item]);
  toast.success('✓ Copied as HTML');
}
```

#### 3.2 PDF Generation
```typescript
// lib/pdf/generatePDF.ts
import jsPDF from 'jspdf';

export function generatePDF(
  sections: Record<string, string>,
  metadata: {
    assistantType: string;
    generatedAt: Date;
    model: string;
  }
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('KimuntuPro AI Assistant', 20, 20);

  doc.setFontSize(12);
  doc.text(metadata.assistantType, 20, 30);
  doc.text(`Generated: ${metadata.generatedAt.toLocaleDateString()}`, 20, 36);

  // Sections
  let yPos = 50;
  Object.entries(sections).forEach(([title, content]) => {
    doc.setFontSize(16);
    doc.text(title, 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 5 + 10;

    // Page break if needed
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by KimuntuPro`,
      20,
      285
    );
  }

  // Download
  const filename = `KimuntuPro_${metadata.assistantType}_${metadata.generatedAt.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  toast.success('✓ PDF downloaded');
}
```

#### 3.3 Export Dropdown Component
```typescript
// components/ai/ExportDropdown.tsx
'use client';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function ExportDropdown({ result, assistantType }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
        Export
        <ChevronDownIcon className="w-5 h-5" />
      </Menu.Button>

      <Transition /* ... animation ... */>
        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => copyAsMarkdown(result.sections)}
                className={/* ... */}
              >
                📋 Copy as Markdown
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => copyAsPlainText(result.sections)}
                className={/* ... */}
              >
                📄 Copy as Plain Text
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => generatePDF(result.sections, {
                  assistantType,
                  generatedAt: new Date(),
                  model: result.meta.model
                })}
                className={/* ... */}
              >
                📥 Download PDF
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
```

---

### Phase 4: Web Search Integration (Day 4) ⏱️ 8-10 hours

#### 4.1 Tavily API Setup
1. Sign up at https://tavily.com
2. Get API key (free tier: 1000 requests/month)
3. Add to `.env.local`:
```bash
WEBSEARCH_PROVIDER=tavily
WEBSEARCH_API_KEY=tvly-xxxxxxxxxx
WEBSEARCH_MAX_RESULTS=10
WEBSEARCH_RATE_LIMIT=100
WEBSEARCH_CACHE_TTL_SEC=300
```

#### 4.2 Implement Tavily Adapter
```typescript
// packages/ai-core/src/tools/webSearch.ts
import { TavilyClient } from 'tavily';

const tavilyClient = new TavilyClient({
  apiKey: process.env.WEBSEARCH_API_KEY!
});

export async function webSearchWithTavily(
  query: string,
  options: { maxResults?: number } = {}
): Promise<WebSearchResponse> {
  const maxResults = options.maxResults || 8;

  // Check cache first
  const cacheKey = buildCacheKey(query, maxResults);
  const cached = getCache().get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  try {
    // Call Tavily API
    const response = await tavilyClient.search(query, {
      maxResults,
      searchDepth: 'advanced',
      includeAnswer: true,
      includeRawContent: false
    });

    // Map to internal format
    const results: WebSearchResult[] = response.results.map(r => ({
      title: r.title,
      snippet: r.content,
      url: r.url
    }));

    const searchResponse: WebSearchResponse = {
      query,
      results,
      timestamp: new Date().toISOString()
    };

    // Cache response
    getCache().set(cacheKey, searchResponse, 300); // 5 min TTL

    return searchResponse;
  } catch (error) {
    console.error('Tavily search failed:', error);
    return { query, results: [] };
  }
}

// Update tool builder
export function buildWebSearchTools(): ToolSpec[] {
  const config = loadConfig();

  if (!config.enabled || config.provider !== 'tavily') {
    return [];
  }

  return [{
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for up-to-date information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          }
        },
        required: ['query']
      }
    }
  }];
}
```

#### 4.3 Update Market Analysis Assistant
```typescript
// packages/ai-core/src/assistants/marketAnalysis.ts
import { webSearchWithTavily } from '../tools/webSearch.js';

export async function runMarketAnalysisAssistant(
  input: AssistantRequest
): Promise<AssistantResponse> {
  // Enable web search for this assistant
  const webSearchTool = {
    spec: buildWebSearchTools()[0],
    handler: async (args: { query: string }) => {
      return await webSearchWithTavily(args.query);
    }
  };

  const response = await execute({
    plan,
    request: input,
    tenantId,
    userId,
    tools: [webSearchTool], // Inject web search tool
  });

  return response;
}
```

#### 4.4 Add Data Freshness Badge
```typescript
// components/ai/DataBadge.tsx
export function DataBadge({ timestamp, isLive }: { timestamp?: string, isLive: boolean }) {
  if (!isLive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
        📚 Knowledge Base
      </span>
    );
  }

  const timeAgo = timestamp ? formatDistanceToNow(new Date(timestamp)) : 'just now';

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
      🌐 Live Data · {timeAgo}
    </span>
  );
}
```

---

## 🎨 UI/UX Design Guidelines

### Color Palette (Match Business Dashboard)
```css
/* Primary Gradients */
--gradient-primary: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
--gradient-background: linear-gradient(to bottom right, #111827, #1f2937, #000000);

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-backdrop: blur(10px);

/* Text */
--text-primary: #ffffff;
--text-secondary: #9ca3af;
--text-accent: #10b981;

/* Status Colors */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;
```

### Component Patterns
```typescript
// Card Component
<div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all">
  {/* Content */}
</div>

// Button Component
<button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
  Action
</button>

// Input Component
<input className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
```

### Typography
```css
/* Headers */
h1: text-4xl font-bold text-white
h2: text-2xl font-semibold text-white
h3: text-xl font-semibold text-white

/* Body */
body: text-base text-gray-300
small: text-sm text-gray-400
```

---

## 🚀 Quick Wins (Can be done in 1-2 hours each)

### Quick Win 1: Better Loading State
```typescript
// Replace basic "Generating..." with animated skeleton
<div className="space-y-4">
  {[1, 2, 3, 4].map(i => (
    <div key={i} className="bg-white/5 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  ))}
</div>
```

### Quick Win 2: Toast Notifications
```bash
npm install react-hot-toast
```
```typescript
import { Toaster, toast } from 'react-hot-toast';

// In layout
<Toaster position="top-right" />

// Replace all alert() calls
toast.success('✓ Copied!');
toast.error('Failed to generate');
```

### Quick Win 3: Character Counter
```typescript
<div className="relative">
  <textarea {...props} maxLength={1000} />
  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
    {input.length}/1000
  </div>
</div>
```

### Quick Win 4: Breadcrumb Navigation
```typescript
<nav className="mb-6 text-sm text-gray-400">
  <Link href="/dashboard">Dashboard</Link>
  <span className="mx-2">/</span>
  <Link href="/dashboard/business">Business Track</Link>
  <span className="mx-2">/</span>
  <span className="text-white">Streamlined Plan</span>
</nav>
```

---

## 📦 Dependencies to Install

```bash
# For PDF generation
npm install jspdf html2canvas

# For toast notifications
npm install react-hot-toast

# For dropdowns/menus
npm install @headlessui/react

# For icons
npm install @heroicons/react

# For web search (Tavily)
npm install tavily

# For date formatting
npm install date-fns
```

---

## 🧪 Testing Checklist

### Manual Testing Scenarios

#### Test 1: Streamlined Plan Generation
- [ ] Navigate to `/dashboard/business/streamlined-plan`
- [ ] Enter prompt: "Draft a lean plan for a mobile app teaching African languages"
- [ ] Click "Run Assistant"
- [ ] Verify loading state appears
- [ ] Verify result displays all 7 sections
- [ ] Click "Copy to Clipboard" - verify toast notification
- [ ] Click "Download PDF" - verify file downloads
- [ ] Open PDF - verify formatting is clean

#### Test 2: Executive Summary with Financials
- [ ] Navigate to `/dashboard/business/exec-summary`
- [ ] Enter prompt with financial details
- [ ] Expand "Advanced Options"
- [ ] Modify ARPU, COGS, Churn values
- [ ] Run assistant
- [ ] Verify financial calculations are accurate
- [ ] Export PDF - verify financial tables are formatted

#### Test 3: Market Analysis with Web Search
- [ ] Enable web search: `OPENAI_WEB_SEARCH_ENABLED=true`
- [ ] Navigate to `/dashboard/business/market-analysis`
- [ ] Enter prompt: "Analyze the meal-prep delivery market in Phoenix, AZ"
- [ ] Run assistant
- [ ] Verify "Live Data" badge appears
- [ ] Check sources section has web URLs
- [ ] Verify data is recent (2025)

#### Test 4: Error Handling
- [ ] Disable internet connection
- [ ] Try to generate - verify error message is user-friendly
- [ ] Enable internet
- [ ] Click retry button - verify it works
- [ ] Test with invalid OpenAI API key - verify clear error

#### Test 5: Dashboard Integration
- [ ] Go to `/dashboard/business`
- [ ] Verify QuickActions shows all three tools (no "Coming Soon")
- [ ] Click each card - verify navigation works
- [ ] Use browser back button - verify returns to dashboard

---

## 📊 Success Metrics for Alpha

### Functional Metrics
- ✅ All 3 assistants generate results without errors
- ✅ Results display within 60 seconds
- ✅ Copy to clipboard works 100% of time
- ✅ PDF download works 100% of time
- ✅ Web search returns at least 5 relevant sources for Market Analysis

### UX Metrics
- ✅ Navigation from dashboard to tools takes < 2 clicks
- ✅ Loading state clearly indicates progress
- ✅ Errors display with actionable recovery steps
- ✅ UI matches dashboard theme (validated by visual inspection)

### Code Quality Metrics
- ✅ No console errors in browser
- ✅ No TypeScript errors
- ✅ All components use consistent styling
- ✅ All user-facing text is clear and professional

---

## 🔮 Post-Alpha Enhancements (Future)

### High Priority (v1.1 - Next 2 weeks)
- [ ] Result history (save to database)
- [ ] Share results via link
- [ ] Edit and regenerate sections
- [ ] Compare multiple results side-by-side

### Medium Priority (v1.2 - 1 month)
- [ ] RAG integration (upload your own documents)
- [ ] Financial charts and visualizations
- [ ] Team collaboration (comments, feedback)
- [ ] Custom templates for each assistant

### Low Priority (v2.0 - 3 months)
- [ ] Multi-language support
- [ ] Voice input for prompts
- [ ] Mobile app
- [ ] Integration with external tools (Notion, Google Docs)

---

## 📝 Notes

### Known Limitations (Alpha)
- Web search limited to 1000 requests/month (Tavily free tier)
- No RAG (document retrieval) - requires database setup
- Quota enforcement disabled (all users have unlimited access)
- No result persistence (refresh = lose results)
- PDF formatting is basic (no charts/graphs)

### Technical Debt to Address (Post-Alpha)
- Hardcoded `demo-tenant` should be replaced with Firebase tenant ID
- Error handling could be more granular (distinguish between network, API, validation errors)
- Some components could be split into smaller pieces (TaskForm is large)
- Test coverage is minimal (add unit tests for critical paths)

---

## 🎬 Getting Started with Implementation

### Recommended Order:
1. **Start with Quick Wins** (2-3 hours total)
   - Add toast notifications
   - Add character counter
   - Add breadcrumb navigation
   - Improve loading states

2. **Dashboard Integration** (Day 1)
   - Create individual pages
   - Update QuickActions
   - Test navigation flow

3. **UI Polish** (Day 2)
   - Apply dark theme consistently
   - Add glassmorphism effects
   - Improve form inputs

4. **Export Features** (Day 3)
   - Implement PDF generation
   - Add export dropdown
   - Test all export formats

5. **Web Search** (Day 4)
   - Set up Tavily account
   - Implement adapter
   - Test Market Analysis

---

## 🤝 Support

For questions or issues during implementation:
- Check `docs/ai/RUNBOOK.md` for troubleshooting
- See `docs/ai/ARCHITECTURE.md` for technical details
- Review `docs/ai/WEBSEARCH.md` for web search specifics

---

**End of Alpha Status & Roadmap**
