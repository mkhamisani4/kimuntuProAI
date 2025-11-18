# 🚀 Quick Start: AI Website Builder

## ⚡ 3-Step Setup (5 minutes)

### 1️⃣ Get Your API Key
```bash
Visit: https://console.anthropic.com/
→ Sign up/Login
→ Create API Key
→ Copy key (starts with sk-ant-)
```

### 2️⃣ Add API Key to .env.local
Open `.env.local` in project root and find this line:
```bash
ANTHROPIC_API_KEY=
```

Add your key:
```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

**⚠️ IMPORTANT:** Make sure there's no space after the `=` sign!

### 3️⃣ Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

## ✅ Verify Setup

Run this command to test:
```bash
npx vitest run app/api/websites/__tests__/generate.integration.test.ts --root .
```

**Expected output:**
```
✓ Anthropic API key is configured - generation enabled
✓ System is ready for website generation
Test Files  1 passed (1)
Tests  12 passed (12)
```

## 🎯 Generate Your First Website

### Option A: Using the Web Interface (Recommended)
1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/dashboard/business/websites/new`
3. Fill out the wizard form
4. Click "Generate Website"
5. Wait ~5-10 seconds for generation to complete

### Option B: Using the API
```bash
curl -X POST http://localhost:3000/api/websites/generate \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test-tenant",
    "userId": "test-user",
    "businessPlanId": null,
    "wizardInput": {
      "companyName": "My Awesome Company",
      "tagline": "We build amazing things",
      "theme": "ocean",
      "layoutStyle": "modern",
      "businessType": "technology",
      "mainGoal": "lead_generation",
      "brandVoice": "professional",
      "enabledSections": {
        "about": true,
        "services": true,
        "contact": true
      },
      "heroHeadline": "Welcome to the Future",
      "primaryCtaText": "Get Started",
      "contactEmail": "hello@example.com"
    }
  }'
```

## 💰 Pricing

**~$0.42 per website** (typical)

Claude Sonnet 4.5 pricing:
- Input: $3/million tokens
- Output: $15/million tokens
- Average website: 1,500 input + 2,500 output tokens

## 📊 Monitor Generation

Watch server logs for:
```
[WebsiteGeneration] Starting Claude generation for website: xxx
[WebsiteGeneration] Claude generation complete for xxx
[WebsiteGeneration] Successfully generated website xxx - 4000 tokens, 42¢
```

Check Firestore `websites` collection for:
- `status`: `draft` → `generating` → `ready`
- `siteCode`: Full HTML
- `generationMetadata`: Usage stats

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "ANTHROPIC_API_KEY is required" | Check `.env.local` file, restart server |
| Status stuck on "generating" | Check server logs for errors |
| "Rate limit exceeded" | Wait 1-2 minutes, try again |
| Tests fail | Verify API key is correct and starts with `sk-ant-` |

## 📚 Documentation

Full documentation: `docs/WEBSITE_BUILDER_SETUP.md`

## ✨ What You Get

Each generated website includes:
- ✅ Responsive HTML/CSS (mobile-first)
- ✅ Modern, professional design
- ✅ SEO-optimized structure
- ✅ Accessible (ARIA labels, semantic HTML)
- ✅ Production-ready code
- ✅ Customized to your brand and content

## 🎉 You're Ready!

Once your API key is added and the server is restarted, you can start generating websites!

---

**Need Help?** Check `docs/WEBSITE_BUILDER_SETUP.md` for detailed documentation.
