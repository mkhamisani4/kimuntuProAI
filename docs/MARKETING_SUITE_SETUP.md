# Marketing + SEO Suite — Complete Setup Guide

This guide covers every external account, API key, and configuration step needed to run the full Marketing & SEO Suite in KimuntuPro AI.

There are **5 external services** that power this suite. Each section below tells you exactly what to create, where to go, and what to paste into your `.env` file.

---

## Quick Reference

| Service | Purpose | Env Vars | Pricing | Required? |
|---------|---------|----------|---------|-----------|
| **Ayrshare** | Social media scheduling & analytics | `AYRSHARE_API_KEY` | Free tier available (limited posts) | Yes, for social features |
| **DataForSEO** | Keyword research & suggestions | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | Pay-as-you-go (~$0.05/request) | Yes, for keyword research |
| **Google PageSpeed Insights** | SEO site audits | `NEXT_PUBLIC_PAGESPEED_API_KEY` | Free (optional key for higher quotas) | Optional key, API works without it |
| **Mailchimp** | Email campaigns & contact management | `MAILCHIMP_CLIENT_ID`, `MAILCHIMP_CLIENT_SECRET`, `MAILCHIMP_REDIRECT_URI`, `MAILCHIMP_WEBHOOK_SECRET` | Free tier up to 500 contacts | Yes, for email features |
| **Anthropic** | AI content generation & segmentation | `ANTHROPIC_API_KEY` | Pay-per-token | Yes, for AI features across the app |

---

## 1. Ayrshare — Social Media Scheduling

### What it powers
- Schedule posts to Instagram, Twitter/X, LinkedIn, Facebook, TikTok, etc.
- Delete scheduled posts
- Fetch post analytics (impressions, clicks, engagements)
- OAuth linking flow so users connect their own social accounts

### Account setup

1. Go to [ayrshare.com](https://www.ayrshare.com/) and create an account
2. Choose a plan (Free tier: 1 profile, limited posts/month)
3. From the dashboard, go to **API Key** section
4. Copy your API key

### In your social accounts
- After the app is running, users click "Connect Social Accounts" in the Marketing Dashboard
- This opens Ayrshare's profile linking page where they authorize their social platforms
- No user-side API keys needed — it's all handled via the Ayrshare-hosted OAuth UI

### Env vars to add

```env
AYRSHARE_API_KEY=your_ayrshare_api_key_here
```

### Features unlocked
- Content Planner: schedule, edit, delete social posts
- Post analytics: views/impressions and clicks/engagements per post
- Multi-platform publishing from a single interface

---

## 2. DataForSEO — Keyword Research

### What it powers
- Keyword suggestion tool in SEO Tools tab
- Returns search volume, keyword difficulty, and CPC for each suggestion
- Supports filtering by geographic location and language

### Account setup

1. Go to [dataforseo.com](https://dataforseo.com/) and create an account
2. After signing up, go to **Dashboard > API Settings**
3. Your login email is your `DATAFORSEO_LOGIN`
4. Your API password is shown in the dashboard (it's NOT your account password) — this is your `DATAFORSEO_PASSWORD`
5. Fund your account — DataForSEO is pay-as-you-go:
   - Keyword Suggestions endpoint costs ~$0.05 per request
   - Minimum deposit is usually $1
   - You can set spending limits in the dashboard

### Env vars to add

```env
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_password_here
```

### Features unlocked
- SEO Tools > Keyword Research: enter a seed keyword and get 20 suggestions with volume, difficulty, and CPC data
- Save keywords to track them per campaign

---

## 3. Google PageSpeed Insights — SEO Audits

### What it powers
- Site Audit tool in SEO Tools tab
- Runs Google Lighthouse SEO analysis on any URL
- Returns an SEO score (0-100) plus individual audit findings (missing meta tags, mobile issues, etc.)

### Account setup

The PageSpeed API **works without an API key** but has lower rate limits (a few requests per minute). To get higher quotas:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. Go to **APIs & Services > Library**
4. Search for **PageSpeed Insights API** and click **Enable**
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > API Key**
7. Copy the API key
8. (Recommended) Click **Restrict Key**:
   - Under "API restrictions", select **PageSpeed Insights API** only
   - Under "Application restrictions", add your domain or leave unrestricted for dev

### Env vars to add

```env
NEXT_PUBLIC_PAGESPEED_API_KEY=your_google_api_key_here
```

> **Note:** This var uses the `NEXT_PUBLIC_` prefix because the original code references it that way. The API call is made server-side in the `/api/marketing/audit` route, so the key is not exposed to browsers despite the prefix.

### Features unlocked
- SEO Tools > Site Audit: enter any URL to get an SEO score and actionable findings
- Works without a key (just with lower rate limits)

---

## 4. Mailchimp — Email Campaigns

### What it powers
- Full email campaign management (create, edit, send, schedule)
- Contact management (add, import CSV, delete)
- AI-powered audience segmentation
- Real-time analytics via webhooks (opens, clicks, bounces, unsubscribes)

### Account setup

**Step 1: Create a Mailchimp account**
1. Go to [mailchimp.com](https://mailchimp.com/) and sign up
2. Free tier supports up to 500 contacts and 1,000 sends/month

**Step 2: Create an audience**
1. In Mailchimp, go to **Audience > All contacts**
2. If you don't have an audience yet, create one (this is your mailing list)
3. Users will select their audience when they connect Mailchimp in the app

**Step 3: Register an OAuth app**
1. Go to [mailchimp.com/developer](https://mailchimp.com/developer/)
2. Log in and click **Register An App** (under your account menu)
3. Fill in the form:
   - **App name:** KimuntuPro AI (or your app name)
   - **App description:** Email campaign management
   - **Company/Organization:** Your org name
   - **App website:** Your domain or `http://localhost:3000`
   - **Redirect URI:** `http://localhost:3000/api/marketing/email/oauth/callback` (for development)
4. After registering, you'll see:
   - **Client ID** — copy this
   - **Client Secret** — copy this (shown once, save it)

**Step 4: Set up webhooks (for production)**
- Webhooks require a publicly accessible URL
- For local development, use [ngrok](https://ngrok.com/) or similar:
  ```bash
  ngrok http 3000
  ```
  Then your webhook URL would be: `https://your-ngrok-id.ngrok.io/api/marketing/email/webhooks?secret=your_webhook_secret`
- In production, webhooks are automatically registered when a user connects their Mailchimp account
- Choose any random string as your `MAILCHIMP_WEBHOOK_SECRET` (used to validate incoming webhook requests)

### What users do
- Click "Connect Mailchimp" in the Email Campaigns page
- Log into their Mailchimp account and authorize the app (OAuth)
- Select which audience to use
- Everything else (token, server, list ID) is stored automatically in Firestore
- **Users never need to enter any API keys**

### Env vars to add

```env
MAILCHIMP_CLIENT_ID=your_oauth_client_id
MAILCHIMP_CLIENT_SECRET=your_oauth_client_secret
MAILCHIMP_REDIRECT_URI=http://localhost:3000/api/marketing/email/oauth/callback
MAILCHIMP_WEBHOOK_SECRET=any_random_string_you_choose
```

> **For production:** Change `MAILCHIMP_REDIRECT_URI` to your production domain, and update the Redirect URI in Mailchimp's developer portal to match.

### Features unlocked
- Email Campaigns tab: create, edit, preview, send, schedule campaigns
- Contacts tab: view, add, CSV import, archive contacts
- AI audience segmentation (requires Anthropic key too)
- Analytics tab: open rate, click rate, bounce rate, unsubscribe tracking
- Error log with client-triggered retry for failed operations

---

## 5. Anthropic — AI Features

### What it powers
- **Email content generation:** AI writes full HTML email templates
- **Subject line suggestions:** AI generates 5 compelling subject lines
- **Audience segmentation:** AI analyzes contact tags and suggests targeted segments
- Also powers AI features across the rest of the app (project ideas, descriptions, etc.)

### Account setup

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account and add a payment method
3. Go to **API Keys** and create a new key
4. Copy the key

### Env vars to add

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> This key is likely already configured if you're using other AI features in the app. The marketing suite uses the `claude-haiku-4-5-20251001` model for all AI features (cost-effective for email copywriting and segmentation).

> **Note about embeddings:** If you use RAG features (document search, knowledge base), you also need an OpenAI API key for embeddings only, since Anthropic has no embeddings API:
> ```env
> OPENAI_EMBEDDINGS_API_KEY=sk-proj-your-key-here
> ```

### Features unlocked
- Campaign editor: "AI Generate" button creates full HTML email content
- Campaign editor: "AI Suggest" generates subject line options
- Contact manager: "AI Segment" creates targeted audience segments in Mailchimp

---

## Complete `.env` additions

Copy and fill in all marketing-related vars:

```env
# ──── Marketing Suite ────

# Ayrshare (Social Scheduling)
AYRSHARE_API_KEY=

# DataForSEO (Keyword Research)
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# Google PageSpeed Insights (SEO Audit) — optional, works without it
NEXT_PUBLIC_PAGESPEED_API_KEY=

# Mailchimp (Email Campaigns)
MAILCHIMP_CLIENT_ID=
MAILCHIMP_CLIENT_SECRET=
MAILCHIMP_REDIRECT_URI=http://localhost:3000/api/marketing/email/oauth/callback
MAILCHIMP_WEBHOOK_SECRET=

# Anthropic (AI Features) — likely already set
ANTHROPIC_API_KEY=
```

---

## Verification Checklist

After setting up all services, verify each one works:

- [ ] **Ayrshare:** Go to Marketing Suite > Content Planner > click "Connect Social Accounts" > link at least one platform > create and schedule a test post
- [ ] **DataForSEO:** Go to Marketing Suite > SEO Tools > Keyword Research > search for any keyword > verify results appear with volume/difficulty/CPC
- [ ] **PageSpeed:** Go to Marketing Suite > SEO Tools > Site Audit > enter any URL (e.g., `https://google.com`) > verify score and audit items appear
- [ ] **Mailchimp:** Go to Marketing Suite > click "Email Campaigns" card > click "Connect Mailchimp" > complete OAuth > select an audience > create a test campaign
- [ ] **Anthropic + Email:** In the campaign editor, click "AI Generate" > verify HTML content is generated > click "AI Suggest" on subject line > verify suggestions appear

---

## Architecture Notes

- All external API calls are proxied through Next.js API routes (`/app/api/marketing/...`) — no external API keys are exposed to the browser
- Ayrshare, DataForSEO, and PageSpeed use **app-level keys** (one key for all users)
- Mailchimp uses **per-user OAuth** (each user connects their own Mailchimp account)
- Anthropic uses an **app-level key** but serves per-user requests
- All credentials and tokens are stored in Firestore `marketing_settings` collection, scoped by `tenantId` + `userId`
