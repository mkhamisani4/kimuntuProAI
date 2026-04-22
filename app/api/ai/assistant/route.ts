/**
 * POST /api/ai/assistant
 * General-purpose floating chatbot — handles text + optional image (vision).
 * Falls back to keyword-matched responses when ANTHROPIC_API_KEY is not set.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `You are the Kimuntu AI assistant — an expert on the Kimuntu platform and a knowledgeable general-purpose assistant. You help users navigate the platform, answer questions about features and pricing, and assist with a wide range of topics.

## About Kimuntu AI (ProLaunch Platform)

Kimuntu AI (by Kimuntu Power Inc.) is an all-in-one AI ecosystem with four intelligence tracks: Career, Business, Legal, and Innovation. It serves job seekers, professionals, entrepreneurs, students, newcomers, and legal self-help users in Canada and the USA.

**Contact & Support:**
- Email: support@kimuntu.ai (24-hour response) | contact@kimuntu.ai (general)
- Phone: +1 (613) 290-32-00 (Mon–Fri, 9 AM – 6 PM EST)
- Live Chat: Mon–Fri, 9 AM – 6 PM EST
- Support page: Dashboard → Support

**Security & Compliance:** GDPR, CCPA, PIPEDA compliant. AES-256 encryption. Firebase Auth. Payments via Stripe (PCI compliant). Data is never sold.

---

## Platform Navigation (Dashboard)

The left sidebar has these sections:
- **Overview** — /dashboard (home/summary)
- **Career** — /dashboard/career
- **Business** — /dashboard/business
- **Legal** — /dashboard/legal
- **Innovative** — /dashboard/innovative
- **Documents** — /dashboard/documents (all generated documents)
- **Support** — /dashboard/support (contact, FAQ, live chat)
- **Settings** — /dashboard/settings (profile, password, preferences)
- **Pricing** — /dashboard/pricing (plans, credits, upgrade)

---

## How To: Common Tasks

**Reset / Change Password:**
1. Go to Dashboard → Settings (/dashboard/settings)
2. Scroll to the "Privacy & Security" section
3. Find "Change Password"
4. Enter your Current Password, New Password (min 6 characters), and Confirm New Password
5. Click "Update Password"
Note: This only applies to email/password accounts. Google Sign-In users authenticate via Google — there is no Kimuntu password to change.

**Manage Subscription / Cancel Plan:**
- Go to Dashboard → Pricing (/dashboard/pricing) to upgrade or change plans
- Go to Dashboard → Subscription (/dashboard/subscription) to view, downgrade, or cancel
- Cancellation takes effect at the end of the current billing period (no mid-period refund)

**Switch Monthly/Yearly Billing:** Dashboard → Pricing → toggle the billing switch (yearly saves 20%)

**Delete Account:** Dashboard → Settings → Privacy & Security → "Delete Account"

**Change Language or Theme:** Dashboard → Settings → Preferences

**Download / Access Documents:** Dashboard → Documents (/dashboard/documents)

---

## Pricing Plans

| Plan | Monthly | Yearly (save 20%) |
|---|---|---|
| Free | $0 forever | — |
| Career Premium | $19.99/mo | $191.90/yr |
| Business Premium | $29.99/mo | $287.90/yr |
| Legal Premium | $29.99/mo | $287.90/yr |
| Innovation Premium | $79.99/mo | $767.90/yr |
| **Full Package (Best Seller)** | **$99/mo** | **$950.40/yr** |

**Free Tier includes:** 3 CV generations/month (watermarked), 1 business plan preview, 5 legal chatbot questions/month, 1 free 10-min Avatar session (Career), community forum access. No credit card required.

**Full Package ($99/mo)** includes all 4 tracks + priority processing + unlimited document generation + 5 Avatar sessions/month + dedicated account manager + API access (100 calls/month). Saves $60.96/month vs. buying tracks separately.

**Payment:** Visa, Mastercard, Amex, debit cards via Stripe.

**Pay-Per-Use Credits (no subscription required):**
- Starter Pack: 5 credits — $19.99 ($4.00/credit)
- Standard Pack: 15 credits — $44.99 ($3.00/credit, save 25%)
- Pro Pack: 40 credits — $99.99 ($2.50/credit, save 38%)
- Team Pack: 100 credits — $199.99 ($2.00/credit, save 50%)

Credit uses: Live Avatar session (1 credit), Legal consultation (1 credit), Complex legal doc (1 credit), Professional business plan (2 credits), Patent drafting session (2 credits), Immigration court simulation (2 credits), AI cold-calling campaign (3 credits).

---

## The Four Tracks

### 1. Career Development — $19.99/month
- ATS-Optimized Resume & Cover Letter builder (15+ templates, bilingual EN/FR)
- AI Job Matching Engine — 50,000+ live job postings (US & Canada)
- Personalized Career Roadmap (skills gap analysis)
- LinkedIn optimizer, salary negotiator
- Interview Prep Suite (industry-specific question banks)
- Live Avatar Interview Coach — 2 free 20-min sessions/month ($4.99/session after)

### 2. Business Growth — $29.99/month
- Business Plan Generator (Basic / Medium / Professional)
- AI Financial Projections (3-year P&L, cash flow, break-even)
- Funding Opportunities Finder (US: SBA, SBIR; Canada: BDC, IRAP)
- AI Website Builder (professional site in under 60 minutes)
- Marketing Toolkit (ad copy, social scheduler, email sequences)
- ProLaunch TeamAI — virtual CEO, HR, Finance, Sales AI agents
- AI Cold Outreach Engine (Twilio integration)

### 3. Legal Support — $29.99/month
- 50+ Legal Document Templates (US & Canada)
- Virtual Lawyer Chatbot (unlimited questions)
- AI Immigration Statement Builder (USCIS / IRCC)
- Contract Review Tool (flags risky clauses in plain English)
- Immigration Court Simulation (practice with AI judges/lawyers)
- AI Legal Match Finder (pro-bono and low-cost attorneys)
- Live Avatar Legal Consultation — 2 free 20-min sessions/month ($7.99/session after)
- Coverage: Family, Criminal, Business/Contract, Consumer Rights, Immigration, Labor, Civil Litigation

⚠️ Kimuntu AI is NOT a law firm. AI-generated legal content is for informational purposes only — not a substitute for a licensed attorney.

### 4. Innovation Hub — $79.99/month
- Patent Intelligence Engine (prior art search + drafting, USPTO + CIPO)
- Idea Stress-Tester and ESG & Sustainability Suite
- Startup Pitch Coach (AI feedback on decks and financials)
- Smart Policy Simulation
- AI Learning Hub (personalized upskilling paths)
- Kimuntu Innovation Network (VCs, accelerators, universities)
- Dedicated account manager + priority support (24-hour response)

---

## Refund & Cancellation Policy

- **Cancel anytime** via Dashboard → Subscription → Cancel Plan
- Access continues until the end of the current billing period — no partial refunds for unused days
- If Kimuntu AI terminates service for convenience: 30-day notice + pro-rated refund of unused prepaid period
- If account is terminated for cause (breach, fraud): immediate suspension, no refund
- After account deletion: data downloadable for 30 days, then permanently deleted

---

## Data & Privacy

- Data is never sold to third parties
- AES-256 encryption in transit and at rest
- GDPR, CCPA, PIPEDA (Canadian), Quebec Law 25 compliant
- Payment data (card numbers) processed by Stripe — Kimuntu only stores last 4 digits
- Legal documents retained 7 years (legal compliance); AI-generated career/business docs retained 24 months
- Inactive accounts (no login for 24 months) deleted after 90-day notice
- User rights: access, rectification, erasure, data portability, opt-out of marketing
- Contact: privacy@kimuntu.ai

---

## General Assistance

Beyond Kimuntu platform questions, you can also help with:
- Legal questions (Canadian and US law comparisons, rights, procedures)
- Business strategy, planning, market analysis, and growth
- Career guidance, resume advice, and job searching
- Immigration questions and processes
- General knowledge and research

## Guidelines

- Be concise but thorough. Match response length to question complexity.
- For platform navigation questions, give specific step-by-step directions.
- When providing helpful resources, format links as [descriptive text](https://url.com) so they render as clickable links.
- When you don't know a specific platform detail (e.g., a specific refund for a specific item), say so and direct the user to support@kimuntu.ai.
- Never provide harmful, illegal, or deceptive information.
- Always remind users that legal/financial/immigration content is for informational purposes only and not professional advice.`;

/* ------------------------------------------------------------------ */
/*  Keyword-matched fallback — used when no API key is configured      */
/* ------------------------------------------------------------------ */
function buildFallbackResponse(lastUserMessage: string): string {
  const q = lastUserMessage.toLowerCase();

  /* ---- Platform / navigation ---- */

  if (q.includes('password') && (q.includes('reset') || q.includes('change') || q.includes('forgot') || q.includes('update') || q.includes('how') || q.includes('where') || q.includes('find'))) {
    return "To change your password:\n\n1. Go to **Dashboard → Settings** (/dashboard/settings)\n2. Scroll to the **Privacy & Security** section\n3. Find **Change Password**\n4. Enter your Current Password, a New Password (min 6 characters), and confirm it\n5. Click **Update Password**\n\nIf you signed in with Google, you don't have a Kimuntu password — manage your password through your Google account instead.\n\nStill having trouble? Email support@kimuntu.ai or call +1 (613) 290-32-00 (Mon–Fri, 9 AM – 6 PM EST).";
  }

  if (q.includes('refund') || q.includes('money back')) {
    return "**Kimuntu AI Refund Policy:**\n\n- You can cancel your subscription at any time via **Dashboard → Subscription → Cancel Plan**\n- Your access continues until the end of the current billing period — unused days are not refunded\n- If Kimuntu AI ever discontinues service for convenience, you'll receive a 30-day notice and a pro-rated refund for any prepaid unused period\n- Accounts terminated for policy violations are not eligible for refunds\n\nFor a specific refund request, contact support@kimuntu.ai — our team reviews requests case by case.";
  }

  if (q.includes('cancel') || q.includes('cancellation') || q.includes('unsubscribe')) {
    return "To cancel your subscription:\n\n1. Go to **Dashboard → Subscription** (/dashboard/subscription)\n2. Click **Cancel Plan**\n3. Your access will continue until the end of your current billing period\n\nYou won't be charged again after cancellation. Need help? Email support@kimuntu.ai.";
  }

  if ((q.includes('how') && q.includes('delete') && q.includes('account')) || q.includes('delete account') || q.includes('close account')) {
    return "To delete your account:\n\n1. Go to **Dashboard → Settings** (/dashboard/settings)\n2. Scroll to **Privacy & Security**\n3. Click **Delete Account**\n\nAfter deletion, you have 30 days to download your data — after that it is permanently removed. If you need help, contact privacy@kimuntu.ai.";
  }

  if (q.includes('upgrade') || q.includes('switch plan') || q.includes('change plan') || (q.includes('switch') && q.includes('plan'))) {
    return "To upgrade or change your plan:\n\n1. Go to **Dashboard → Pricing** (/dashboard/pricing)\n2. Select the plan you want\n3. Complete checkout\n\nYou can switch between monthly and yearly billing anytime — yearly billing saves 20%. To downgrade, go to **Dashboard → Subscription** instead.";
  }

  if (q.includes('settings') || (q.includes('change') && (q.includes('profile') || q.includes('name') || q.includes('email') || q.includes('language') || q.includes('theme')))) {
    return "All account settings are in **Dashboard → Settings** (/dashboard/settings):\n\n- **Profile:** Display name, job title, company, phone, location, bio, avatar photo\n- **Preferences:** Dark/Light theme, Language (English / Français)\n- **Privacy & Security:** Change password, delete account\n\nYour email address is read-only (managed through Firebase Auth).";
  }

  if (q.includes('where') && (q.includes('document') || q.includes('resume') || q.includes('cv') || q.includes('find my'))) {
    return "All your generated documents (resumes, CVs, business plans, legal templates, etc.) are saved in **Dashboard → Documents** (/dashboard/documents).\n\nYou can download them anytime from there.";
  }

  if (q.includes('contact') || q.includes('reach') || q.includes('support') || (q.includes('talk') && q.includes('human'))) {
    return "You can reach the Kimuntu support team through:\n\n- **Email:** support@kimuntu.ai (replies within 24 hours for premium members)\n- **Live Chat:** Dashboard → Support — available Mon–Fri, 9 AM – 6 PM EST\n- **Phone:** +1 (613) 290-32-00 (Mon–Fri, 9 AM – 6 PM EST)\n\nFor legal/privacy matters: legal@kimuntu.ai or privacy@kimuntu.ai\n\nVisit the full Support page at **Dashboard → Support**.";
  }

  /* ---- Pricing & plans ---- */

  if (q.includes('free') && (q.includes('trial') || q.includes('tier') || q.includes('plan') || q.includes('version'))) {
    return "Yes! Kimuntu AI has a **Free Tier** — no credit card required. It includes:\n\n- 3 CV/resume generations per month (watermarked)\n- 1 business plan preview (executive summary only)\n- 5 legal chatbot questions per month\n- 1 free 10-minute Live Avatar session (Career track)\n- Community forum access\n\nTo upgrade, go to **Dashboard → Pricing**.";
  }

  if (q.includes('how much') || q.includes('price') || q.includes('cost') || q.includes('pricing') || q.includes('subscription') || q.includes('plan') || q.includes('paid')) {
    return "**Kimuntu AI Plans:**\n\n| Plan | Monthly | Yearly |\n|---|---|---|\n| Free | $0 | — |\n| Career Premium | $19.99 | $191.90 |\n| Business Premium | $29.99 | $287.90 |\n| Legal Premium | $29.99 | $287.90 |\n| Innovation Premium | $79.99 | $767.90 |\n| **Full Package** *(Best Seller)* | **$99** | **$950.40** |\n\nYearly billing saves 20%. The Full Package includes all 4 tracks and saves $60.96/month vs. buying them separately.\n\nSee full details at **Dashboard → Pricing** or ask me about any specific plan.";
  }

  if (q.includes('credit') && (q.includes('buy') || q.includes('purchase') || q.includes('pack') || q.includes('how') || q.includes('what'))) {
    return "**Pay-Per-Use Credits** let you access premium features without a full subscription:\n\n| Pack | Credits | Price |\n|---|---|---|\n| Starter | 5 | $19.99 |\n| Standard | 15 | $44.99 (save 25%) |\n| Pro | 40 | $99.99 (save 38%) |\n| Team | 100 | $199.99 (save 50%) |\n\n**What credits buy:**\n- 1 credit → Live Avatar session (20 min), legal consultation, or complex document\n- 2 credits → Professional business plan, patent drafting, immigration court simulation\n- 3 credits → AI cold-calling campaign (50 contacts)\n\nBuy credits at **Dashboard → Pricing**.";
  }

  if (q.includes('full package') || q.includes('bundle') || (q.includes('all') && q.includes('track'))) {
    return "The **Full Package** ($99/month | $950.40/year) includes all four tracks:\n\n✅ Career Premium\n✅ Business Premium\n✅ Legal Premium\n✅ Innovation Premium\n\nPlus exclusive benefits:\n- Priority AI processing (2× faster)\n- Unlimited document generation\n- 5 Live Avatar sessions/month\n- Dedicated account manager\n- White-label documents (no Kimuntu branding)\n- API access (100 calls/month)\n- 12-hour support response guarantee\n\nSaves $60.96/month vs. buying all tracks separately. View at **Dashboard → Pricing**.";
  }

  /* ---- Features / tracks ---- */

  if (q.includes('career') && (q.includes('track') || q.includes('what') || q.includes('feature') || q.includes('include') || q.includes('do'))) {
    return "The **Career Development Track** ($19.99/month) includes:\n\n- **ATS-Optimized Resume Builder** — 15+ templates, bilingual EN/FR, cover letters\n- **AI Job Matching Engine** — 50,000+ live job postings across US & Canada\n- **Personalized Career Roadmap** — skills gap analysis + action plan\n- **AI Career Accelerator** — LinkedIn optimizer, salary negotiator\n- **Interview Prep Suite** — industry-specific question banks\n- **Live Avatar Interview Coach** — 2 free 20-min sessions/month ($4.99/session extra)\n\nAccess it at **Dashboard → Career**.";
  }

  if (q.includes('business') && (q.includes('track') || q.includes('what') || q.includes('feature') || q.includes('include') || q.includes('do'))) {
    return "The **Business Growth Track** ($29.99/month) includes:\n\n- **Business Plan Generator** — Basic, Medium, and Professional levels\n- **AI Financial Projections** — 3-year P&L, cash flow, break-even analysis\n- **Funding Finder** — US (SBA, SBIR) & Canada (BDC, IRAP) grants and VC directories\n- **AI Website Builder** — professional site in under 60 minutes\n- **Marketing Toolkit** — ad copy, social scheduler, email sequences\n- **ProLaunch TeamAI** — virtual CEO, HR, Finance, Sales AI agents\n- **AI Cold Outreach Engine** (Twilio)\n\nAccess it at **Dashboard → Business**.";
  }

  if (q.includes('legal') && (q.includes('track') || q.includes('what') || q.includes('feature') || q.includes('include') || q.includes('do') || q.includes('cover'))) {
    return "The **Legal Support Track** ($29.99/month) includes:\n\n- **50+ Legal Document Templates** (US & Canada)\n- **Virtual Lawyer Chatbot** — unlimited questions\n- **AI Immigration Statement Builder** (USCIS / IRCC)\n- **Contract Review Tool** — flags risky clauses in plain English\n- **Immigration Court Simulation** — practice with AI judges and lawyers\n- **AI Legal Match Finder** — pro-bono and low-cost attorneys\n- **Live Avatar Legal Consultation** — 2 free 20-min sessions/month ($7.99/session extra)\n\nCovers: Family, Criminal, Business/Contract, Consumer Rights, Immigration, Labor, and Civil Litigation law in both Canada and the USA.\n\n⚠️ Not a law firm — AI content is for informational purposes only.\n\nAccess at **Dashboard → Legal**.";
  }

  if (q.includes('innovation') || q.includes('innovative') && (q.includes('track') || q.includes('what') || q.includes('feature'))) {
    return "The **Innovation Hub Track** ($79.99/month) includes:\n\n- **Patent Intelligence Engine** — prior art search + patent drafting (USPTO + CIPO)\n- **Idea Stress-Tester** — AI validates business/invention viability\n- **ESG & Sustainability Suite** — carbon footprint, CSR strategy, B-Corp checklist\n- **Startup Pitch Coach** — AI feedback on decks and financials\n- **Smart Policy Simulation** — model regulatory impact on your business\n- **AI Learning Hub** — personalized upskilling paths\n- **Kimuntu Innovation Network** — VCs, accelerators, universities\n- Dedicated account manager + 24-hour priority support\n\nAccess at **Dashboard → Innovative**.";
  }

  if (q.includes('avatar') || (q.includes('live') && q.includes('session'))) {
    return "**Live Avatar Sessions** are real-time AI-powered coaching consultations:\n\n- **Career Track:** Interview coaching — 2 free 20-min sessions/month, then $4.99/session\n- **Legal Track:** Legal consultation — 2 free 20-min sessions/month, then $7.99/session\n- **Full Package subscribers:** 5 free sessions/month at a discounted $3.99/session after\n\nYou can also buy **Pay-Per-Use credits** (1 credit = 1 session) without a subscription. Credits start at $19.99 for 5 credits.";
  }

  /* ---- Privacy & security ---- */

  if (q.includes('privacy') || q.includes('data') || q.includes('gdpr') || q.includes('pipeda') || (q.includes('my') && q.includes('information'))) {
    return "**Kimuntu AI Privacy & Security:**\n\n- 🔒 AES-256 encryption (data in transit and at rest)\n- ✅ GDPR, CCPA, PIPEDA, and Quebec Law 25 compliant\n- 🚫 Your data is **never sold** to third parties\n- 💳 Card numbers are processed by Stripe — Kimuntu only sees the last 4 digits\n- 🗑️ You can request data deletion anytime — processed within 30 days\n- 📥 You can export your data (JSON/CSV format)\n\n**Data retention:** AI-generated career/business docs are kept 24 months; legal documents are kept 7 years (legal compliance).\n\nContact privacy@kimuntu.ai for any privacy questions.";
  }

  /* ---- General legal (Canadian & US law) ---- */

  if (q.includes('theft') || q.includes('larceny') || q.includes('steal'))
    return 'In Canada, theft is governed by section 322 of the Criminal Code and split into theft over $5,000 (indictable, up to 10 years) and theft under $5,000 (hybrid offense). In the United States, definitions vary by state, distinguishing between petty theft (misdemeanor) and grand theft (felony) based on value thresholds ranging from $500–$2,500. Canadian law uses a single unified provision; many U.S. states still maintain separate statutes for larceny, robbery, and embezzlement.';

  if (q.includes('assault') || q.includes('battery'))
    return 'Canadian Criminal Code sections 265–268 define assault as intentionally applying force, attempting to apply force, or threatening force while carrying a weapon. Aggravated assault (s.268) carries up to 14 years. In the U.S., common-law assault is the apprehension of imminent contact; battery is the actual unlawful touching. The Model Penal Code (s.211.1) unifies these into a single provision with simple and aggravated categories.';

  if (q.includes('self-defense') || q.includes('self defense') || q.includes('stand your ground'))
    return "Canada's self-defense law (Criminal Code s.34, reformed 2012) asks whether the accused reasonably believed force was threatened, acted for defensive purposes, and responded reasonably. About 30 U.S. states have 'stand your ground' laws removing the duty to retreat. Other states follow the 'castle doctrine' (no retreat at home only). The MPC generally requires retreat when safe to do so outside one's dwelling.";

  if (q.includes('bail') || q.includes('pretrial') || q.includes('remand'))
    return "Canada's bail system (Criminal Code ss.515–524) uses the 'ladder principle' — least restrictive release first. The U.S. Bail Reform Act of 1984 presumes release on personal recognizance but permits detention if no conditions ensure safety or court appearance. Many U.S. states still rely heavily on cash bail, though reforms in New Jersey, Illinois, and New York have reduced or eliminated it.";

  if (q.includes('murder') || q.includes('homicide') || q.includes('manslaughter'))
    return 'Canadian law classifies culpable homicide as first-degree murder (mandatory life, 25 years before parole), second-degree murder (life, 10–25 years), or manslaughter. The U.S. generally distinguishes first-degree (premeditated), second-degree (intentional but not premeditated), voluntary manslaughter (heat of passion), and involuntary manslaughter. The U.S. felony murder rule has no direct Canadian equivalent.';

  if (q.includes('drug') || q.includes('cannabis') || q.includes('marijuana') || q.includes('narcotic'))
    return 'Canada governs drug offenses through the Controlled Drugs and Substances Act (CDSA). Cannabis is legal for adult recreational use under the Cannabis Act (2018). In the U.S., the federal Controlled Substances Act (CSA) classifies drugs into five schedules; cannabis remains Schedule I federally despite many state legalizations. Federal mandatory minimums remain significant in the U.S.';

  if (q.includes('dui') || q.includes('dwi') || q.includes('impaired driving') || q.includes('drunk driv'))
    return 'Canada overhauled impaired driving laws in 2018 (Criminal Code s.320.14). The BAC limit is 0.08% with mandatory alcohol screening powers. First offense: $1,000 minimum fine + 1-year driving prohibition. In the U.S., all 50 states set the per se BAC limit at 0.08% (0.04% for commercial drivers). Penalties vary widely by state — typically $500–$2,000 fines and 90-day to 1-year suspensions for first offenses.';

  if (q.includes('search') || q.includes('seizure') || q.includes('warrant') || q.includes('fourth amendment'))
    return "Section 8 of the Canadian Charter protects against unreasonable search and seizure. Evidence obtained in violation may be excluded under s.24(2) using the Grant framework (R. v. Grant, 2009). The U.S. Fourth Amendment similarly requires warrants supported by probable cause. The U.S. exclusionary rule bars illegally obtained evidence, though the good-faith exception (U.S. v. Leon, 1984) has softened its application.";

  if (q.includes('counsel') || q.includes('lawyer') || q.includes('miranda') || q.includes('attorney'))
    return "Canada's Charter s.10(b) guarantees the right to retain counsel without delay upon arrest. Unlike the U.S., no lawyer presence is required during interrogation — only a reasonable opportunity to consult beforehand. U.S. Miranda rights (1966) require informing custodial suspects of their right to silence and an attorney. Gideon v. Wainwright (1963) established court-appointed counsel for indigent defendants in felony cases.";

  /* ---- Business & career general ---- */

  if (q.includes('business plan') || q.includes('startup') || q.includes('entrepreneur'))
    return 'A strong business plan covers: executive summary, market analysis, competitive landscape, product/service description, go-to-market strategy, financial projections (3–5 years), and funding requirements. For startups, validate your idea with customer discovery before writing the full plan. The Kimuntu Business track can generate detailed market analysis and financial overviews — go to **Dashboard → Business**.';

  if (q.includes('market analysis') || q.includes('market research') || q.includes('target market'))
    return 'Effective market analysis includes: (1) Total Addressable Market (TAM) sizing, (2) Serviceable Addressable Market (SAM), (3) competitor mapping, (4) customer segmentation, and (5) pricing benchmarks. Tools like Statista, IBISWorld, and Google Trends provide market data. The Kimuntu Business track can generate a full market analysis report — navigate to **Dashboard → Business**.';

  if (q.includes('funding') || q.includes('investor') || q.includes('venture capital') || q.includes('grant'))
    return 'Common funding paths: (1) Bootstrapping — no dilution, slow growth; (2) Friends & family — quick but personal risk; (3) Angel investors — $25K–$500K, early stage; (4) Venture capital — $500K+, high growth required; (5) Government grants — non-dilutive, competitive (BDC, SR&ED in Canada; SBA in the U.S.); (6) Revenue-based financing — repay from revenue, no equity loss. Kimuntu\'s Business track has a Funding Finder for Canadian and US programs.';

  if (q.includes('resume') || q.includes('cv') || q.includes('cover letter'))
    return 'Resume best practices: (1) Tailor it to each job using keywords from the job description; (2) Lead with a strong summary statement; (3) Quantify achievements ("increased sales by 32%"); (4) Keep it to 1–2 pages; (5) Use ATS-friendly formatting (no tables or graphics). The Kimuntu Career track can build a tailored, ATS-optimized resume and cover letter — go to **Dashboard → Career**.';

  if (q.includes('interview') || q.includes('job search') || q.includes('job offer') || q.includes('salary'))
    return 'Interview tips: (1) Use the STAR method (Situation, Task, Action, Result) for behavioral questions; (2) Research the company thoroughly; (3) Prepare 3–5 questions to ask; (4) For salary, research ranges on Glassdoor and LinkedIn Salary before negotiating — always negotiate. Most offers have 10–20% flexibility. The Kimuntu Career track has AI-powered interview preparation and Live Avatar coaching at **Dashboard → Career**.';

  if (q.includes('immigration') || q.includes('visa') || q.includes('work permit') || q.includes('permanent resident'))
    return "Canadian immigration pathways include: Express Entry (Federal Skilled Worker, Canadian Experience Class, Federal Skilled Trades), Provincial Nominee Programs (PNPs), Family Sponsorship, and Start-up Visa. For U.S. immigration: H-1B (specialty occupation), EB-1/EB-2/EB-3 employment-based green cards, and O-1 (extraordinary ability). The Kimuntu Legal track has an AI Immigration Statement Builder and Immigration Court Simulation — go to **Dashboard → Legal**. Always consult a licensed immigration consultant (RCIC in Canada, immigration attorney in the U.S.) for your specific case.";

  /* ---- Help / default ---- */

  if (q.includes('help') || q.includes('how do i') || q.includes('how to') || q.includes('what can'))
    return "Here are some things I can help you with:\n\n**Platform Questions:**\n• How do I reset my password?\n• How do I cancel my subscription?\n• What's included in the Full Package?\n• Where are my saved documents?\n\n**Track Features:**\n• What does the Career / Business / Legal / Innovation track include?\n• How do Live Avatar sessions work?\n• How do Pay-Per-Use credits work?\n\n**General Knowledge:**\n• Legal questions (Canadian & US law)\n• Business strategy and market analysis\n• Career advice and resume tips\n• Immigration pathways\n\nJust ask!";

  // Default
  return "I'm the Kimuntu AI assistant. I can help with:\n\n🏠 **Platform navigation** — settings, password reset, subscription, documents\n💰 **Pricing & plans** — features, upgrades, credits, cancellation\n⚖️ **Legal questions** — Canadian & US law comparisons, rights, procedures\n💼 **Business planning** — strategy, funding, market analysis\n👔 **Career advice** — resumes, interviews, job search\n🛂 **Immigration** — Express Entry, visas, work permits\n\nWhat would you like to know?";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // No API key — use keyword fallback
    if (!apiKey) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      const content = buildFallbackResponse(lastUserMsg?.content || '');
      return NextResponse.json({ ok: true, content }, { status: 200 });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ ok: true, content }, { status: 200 });
  } catch (error: any) {
    console.error('[Assistant] API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', message: error.message },
      { status: 500 }
    );
  }
}
