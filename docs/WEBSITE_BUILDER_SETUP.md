# AI Website Builder - Setup Guide

## Overview

The AI Website Builder uses Claude Sonnet 4.5 to generate complete, production-ready HTML websites based on user input from a wizard interface. This guide will help you set up and test the website generation feature.

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Firebase project configured (already set up in this project)
- **Anthropic API key** (required for website generation)

## Setup Instructions

### 1. Get an Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (it starts with `sk-ant-`)

### 2. Configure Environment Variables

Open `.env.local` in the project root directory and add your API key:

```bash
# Anthropic Configuration (for Website Builder)
# Get your API key from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

**Important:** Replace `sk-ant-your-actual-key-here` with your actual API key from step 1.

### 3. Verify Configuration

Run the integration tests to verify everything is set up correctly:

```bash
npx vitest run app/api/websites/__tests__/generate.integration.test.ts --root .
```

✅ **All tests should pass** and you should see:
```
✓ Anthropic API key is configured - generation enabled
✓ System is ready for website generation
```

If you see warnings about missing API key, double-check step 2.

### 4. Build the Project

Build all packages to ensure TypeScript compilation succeeds:

```bash
npm run build:packages
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing Website Generation

### Option 1: Using the Web Interface

1. Navigate to `http://localhost:3000/dashboard/business/websites/new`
2. Fill out the website wizard form:
   - **Company Name:** Your company name
   - **Tagline:** A short tagline
   - **Business Type:** Select your industry
   - **Sections:** Choose which sections to include
   - **Theme & Style:** Select colors and layout
   - **Contact Info:** Add your contact details
3. Click **"Generate Website"**
4. The website will be generated in the background
5. Check the status in Firestore or the dashboard

### Option 2: Using the API Directly

Send a POST request to the generation endpoint:

```bash
curl -X POST http://localhost:3000/api/websites/generate \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test-tenant",
    "userId": "test-user",
    "businessPlanId": null,
    "wizardInput": {
      "companyName": "My Test Company",
      "tagline": "Innovation at its finest",
      "theme": "ocean",
      "layoutStyle": "modern",
      "businessType": "technology",
      "mainGoal": "lead_generation",
      "brandVoice": "professional",
      "enabledSections": {
        "about": true,
        "services": true,
        "contact": true
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "websiteId": "generated-website-id",
  "status": "generating",
  "message": "Website generation started. You can navigate away."
}
```

## Monitoring Generation

### View Generation Progress

The generation happens in the background. Check the server logs for:

```
[WebsiteGeneration] Starting Claude generation for website: xxx
[WebsiteGeneration] Claude generation complete for xxx
[WebsiteGeneration] Successfully generated website xxx - 4000 tokens, 42¢
```

### Check Firestore

The generated website is stored in Firestore:

**Collection:** `websites`

**Document Fields:**
- `websiteId`: Unique identifier
- `status`: `draft` → `generating` → `ready` (or `failed`)
- `siteCode`: Complete HTML code
- `siteSpec`: Structured site specification
- `generationMetadata`: Usage stats (tokens, cost, latency)

### View Usage Tracking

Generation usage is tracked in the `usage_logs` collection:

```javascript
{
  tenantId: "test-tenant",
  userId: "test-user",
  assistant: "website_builder",
  model: "claude-sonnet-4-20250514",
  tokensIn: 1500,
  tokensOut: 2500,
  totalTokens: 4000,
  costCents: 42,
  latencyMs: 3000,
  createdAt: timestamp
}
```

## Cost Estimation

**Model:** Claude Sonnet 4.5

**Pricing:**
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

**Typical Website Generation:**
- Input tokens: ~1,500 tokens
- Output tokens: ~2,500 tokens
- **Cost per website: ~$0.42 (42 cents)**

## Troubleshooting

### "ANTHROPIC_API_KEY is required" Error

**Cause:** API key not set in environment

**Solution:**
1. Check `.env.local` file exists
2. Ensure `ANTHROPIC_API_KEY=sk-ant-...` is set correctly
3. Restart your development server

### Website Status Stuck on "generating"

**Cause:** Background generation may have failed

**Solution:**
1. Check server logs for error messages
2. Look for `[WebsiteGeneration] Failed` in logs
3. Check Firestore for `errorMessage` field in website document

### "Rate limit exceeded" Error

**Cause:** Too many requests to Anthropic API

**Solution:**
1. Wait a few minutes before retrying
2. Check your Anthropic account usage limits
3. Consider implementing request queuing

### Invalid HTML Output

**Cause:** Rare Claude generation issue

**Solution:**
1. Check `siteCode` field in Firestore
2. Regenerate the website with adjusted input
3. Report issue if it persists

## Architecture Overview

### Components

1. **ClaudeClient** (`packages/ai-core/src/llm/claudeClient.ts`)
   - Wrapper for Anthropic SDK
   - Retry logic with exponential backoff
   - Cost calculation and tracking

2. **WebsiteGenerator** (`packages/ai-core/src/generators/websiteGenerator.ts`)
   - Prompt engineering for website generation
   - HTML post-processing and validation
   - Site spec extraction

3. **API Route** (`app/api/websites/generate/route.ts`)
   - Request validation and quota checking
   - Fire-and-forget background generation
   - Firestore integration

4. **Firestore Functions** (`packages/db/src/firebase/websites.ts`)
   - Website CRUD operations
   - Usage tracking
   - Metadata persistence

### Generation Flow

```
User Input (Wizard)
        ↓
POST /api/websites/generate
        ↓
Create Website Document (status: draft)
        ↓
Update Status (status: generating)
        ↓
Background Generation
        ├─ Build Prompts
        ├─ Call Claude API
        ├─ Process HTML
        └─ Extract Site Spec
        ↓
Update Website (status: ready)
        ├─ Save siteCode
        ├─ Save siteSpec
        └─ Save metadata
        ↓
Record Usage (tokens, cost)
```

## Test Coverage

### Unit Tests

- **Website Generator:** 21/21 tests ✓
- **Firestore Functions:** 13/13 tests ✓
- **Integration:** 12/12 tests ✓

### Running Tests

```bash
# All website tests
npm test

# Specific test suites
npm test -- packages/ai-core/src/generators/__tests__/websiteGenerator.test.ts
npm test -- packages/db/src/firebase/__tests__/websites.test.ts
npx vitest run app/api/websites/__tests__/generate.integration.test.ts --root .
```

## Next Steps

After successful setup:

1. ✅ **Phase 3 Complete:** Claude integration working
2. 🚧 **Phase 4:** Build frontend wizard UI
3. 🚧 **Phase 5:** Add preview and editing capabilities
4. 🚧 **Phase 6:** Implement publishing and deployment

## Support

For issues or questions:
- Check server logs for detailed error messages
- Review Firestore documents for generation status
- Verify API key is valid and has sufficient credits
- Ensure all environment variables are set correctly

---

**Last Updated:** November 15, 2025
**Version:** Phase 3 - Claude Integration Complete
