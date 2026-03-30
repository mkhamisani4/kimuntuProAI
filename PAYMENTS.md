# Kimuntu Pro AI — Payments Setup Guide

This guide walks you through turning on real payments. Right now, everything works
with a mock system (no real money is charged). When you're ready to accept real
payments, follow the steps below — in order, one at a time.

**Time needed:** About 30 minutes.
**Skill level:** You don't need to write any code. It's all copy-paste and clicking.

---

## How it works right now (Mock Mode)

The app has a complete payment flow that looks and feels real:

- **Pricing page** → user picks Monthly ($19.99) or Yearly ($199.99)
- **Checkout page** → user fills in card details
- **Subscription page** → user can view, change, or cancel their plan

But no real money is charged. Card details aren't sent anywhere.
Everything is saved in the browser's local storage.

When you flip one switch (`NEXT_PUBLIC_USE_REAL_PAYMENTS=true`), the app will:

1. Use real Stripe Checkout (Stripe's own secure payment page)
2. Save subscription status to your Firebase database
3. Listen for Stripe webhooks to stay in sync

---

## Step 1: Create a Stripe Account

1. Go to **https://dashboard.stripe.com/register**
2. Sign up with your email
3. Verify your email address
4. You'll start in **Test Mode** (which is what you want — no real money yet)

> **Important:** Stay in Test Mode until you've verified everything works.
> You'll see an orange "TEST" banner at the top of the Stripe dashboard.

---

## Step 2: Get Your API Keys

1. In the Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API keys**
3. You'll see two keys:
   - **Publishable key** — starts with `pk_test_`
   - **Secret key** — click "Reveal" — starts with `sk_test_`
4. Copy both keys somewhere safe

Now open the file `.env.local` in your project (create it if it doesn't exist — it
should be in the same folder as `package.json`).

Add these lines (replace the placeholder values with your real keys):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE
```

> **Never share your Secret Key publicly.** The publishable key is safe to expose.

---

## Step 3: Create Your Two Price Plans in Stripe

1. In the Stripe Dashboard, go to **Product catalog** (left sidebar)
2. Click **+ Add product**
3. Fill in:
   - **Name:** `Kimuntu Pro AI`
   - **Description:** `Full access to all AI-powered tools and professional tracks`
4. Under **Price information**, add TWO prices:

### Price 1: Monthly
   - **Pricing model:** Standard pricing
   - **Amount:** `19.99`
   - **Currency:** USD
   - **Billing period:** Monthly
   - Click **Add another price** (or save and add the second one)

### Price 2: Yearly
   - **Pricing model:** Standard pricing
   - **Amount:** `199.99`
   - **Currency:** USD
   - **Billing period:** Yearly

5. Click **Save product**
6. Now click on the product you just created
7. Scroll to the **Pricing** section
8. Each price has a **Price ID** that starts with `price_` — copy both

Add them to your `.env.local`:

```
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_PASTE_MONTHLY_ID_HERE
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_PASTE_YEARLY_ID_HERE
```

---

## Step 4: Set Up the Webhook

Webhooks are how Stripe tells your app "hey, this person just paid" or
"this subscription was cancelled." Without this, your app won't know
when payments succeed.

### For local testing:

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
   - **Mac:** `brew install stripe/stripe-cli/stripe`
   - **Windows:** Download from the link above
2. Log in: `stripe login`
3. Run this command to forward webhooks to your local server:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. The CLI will print a **webhook signing secret** starting with `whsec_`
5. Add it to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_PASTE_YOUR_SECRET_HERE
   ```

### For production (when your app is live):

1. Go to **Developers** → **Webhooks** in the Stripe Dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL:** `https://YOUR-DOMAIN.com/api/webhooks/stripe`
4. Under **Events to send**, select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **Add endpoint**
6. Click on the endpoint you just created
7. Under **Signing secret**, click **Reveal** and copy it
8. Set it as `STRIPE_WEBHOOK_SECRET` in your hosting environment

---

## Step 5: Uncomment the Real Stripe Code

Now you need to uncomment the code that was prepared for you. There are
**4 files** to update. In each file, find the commented-out block and
remove the `//` at the start of each line.

### File 1: `app/api/payments/create-checkout/route.js`
- Find the section labeled `REAL STRIPE`
- Uncomment everything between the `═══` lines
- Delete or comment out the line that returns the 501 error below it

### File 2: `app/api/payments/status/route.js`
- Find the section labeled `REAL MODE`
- Uncomment everything between the `═══` lines
- Delete or comment out the `return NextResponse.json({ active: false, mock: false })` below it

### File 3: `app/api/payments/cancel/route.js`
- Find the section labeled `REAL MODE`
- Uncomment everything between the `═══` lines
- Delete or comment out the 501 error return below it

### File 4: `app/api/webhooks/stripe/route.js`
- Find the section labeled `REAL STRIPE WEBHOOK`
- Uncomment everything between the `═══` lines
- Delete or comment out the mock return below it

> **Tip:** Search each file for `═══` to find exactly where to uncomment.

---

## Step 6: Install the Stripe Package

Open your terminal, go to your project folder, and run:

```
npm install stripe
```

That's it — one package.

---

## Step 7: Set Your App URL

Add your app's URL to `.env.local` so Stripe knows where to redirect after payment:

```
# For local development:
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production, change to your real domain:
NEXT_PUBLIC_APP_URL=https://kimuntupro.com
```

---

## Step 8: Flip the Switch

This is the moment. Add this line to `.env.local`:

```
NEXT_PUBLIC_USE_REAL_PAYMENTS=true
```

Restart your development server (`npm run dev`), and the app now uses real Stripe.

---

## Step 9: Test with Stripe's Test Cards

Before going live, test with these fake card numbers (Stripe Test Mode):

| Card Number          | What it does                    |
|---------------------|---------------------------------|
| `4242 4242 4242 4242` | Succeeds (Visa)               |
| `5555 5555 5555 4444` | Succeeds (Mastercard)         |
| `4000 0000 0000 0002` | Declines                      |
| `4000 0000 0000 3220` | Triggers 3D Secure            |

Use any future expiry date (like `12/34`), any 3-digit CVC, and any ZIP code.

**What to verify:**
- [ ] Clicking "Subscribe" on the checkout page redirects to Stripe
- [ ] After paying with a test card, you're redirected back to the success page
- [ ] The subscription page shows the active subscription
- [ ] Cancelling works (subscription shows as cancelled)
- [ ] Check the Stripe Dashboard → Payments tab to see the test payment

---

## Step 10: Go Live (Accept Real Money)

When everything works in Test Mode:

1. In the Stripe Dashboard, toggle off **Test Mode** (top-right corner)
2. Get your **live** API keys (they start with `pk_live_` and `sk_live_`)
3. Create the same product & prices in live mode (Stripe keeps test and live separate)
4. Set up the webhook again in live mode
5. Update your `.env.local` (or hosting env vars) with all the live values
6. Deploy your app

---

## Quick Reference: All Environment Variables

Here's everything you'll need in `.env.local` when payments are live:

```env
# The master switch
NEXT_PUBLIC_USE_REAL_PAYMENTS=true

# Stripe API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Price IDs from Stripe Dashboard
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...

# Webhook signing secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Your app URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## File Map: Where Everything Lives

| File | What it does |
|------|-------------|
| `lib/payments.js` | Central config — plans, prices, mock/real switch |
| `app/dashboard/pricing/page.jsx` | The pricing page users see |
| `app/dashboard/checkout/page.jsx` | Payment form (mock) or Stripe redirect (real) |
| `app/dashboard/subscription/page.jsx` | Manage active subscription |
| `app/api/payments/create-checkout/route.js` | Creates Stripe Checkout Session |
| `app/api/payments/status/route.js` | Returns subscription status |
| `app/api/payments/cancel/route.js` | Cancels subscription |
| `app/api/webhooks/stripe/route.js` | Receives events from Stripe |
| `.env.local` | Your secret keys (never commit this) |

---

## Troubleshooting

**"Payment setup failed" error after enabling real payments:**
→ You probably forgot to uncomment the Stripe code in Step 5. Check all 4 files.

**Stripe redirects back but subscription doesn't show:**
→ The webhook isn't reaching your app. Make sure `stripe listen` is running
   (for local dev) or the webhook URL is correct (for production).

**"Invalid signature" webhook error:**
→ Your `STRIPE_WEBHOOK_SECRET` doesn't match. Get a fresh one from the
   Stripe Dashboard or from the `stripe listen` CLI output.

**Everything works in test mode but not in live mode:**
→ You're probably still using test API keys. Live keys start with `pk_live_`
   and `sk_live_`. Also make sure you created the product and prices in live mode.

---

## Changing Prices Later

To change the price (e.g., from $19.99 to $24.99):

1. Go to Stripe Dashboard → Product catalog → Kimuntu Pro AI
2. Archive the old price
3. Create a new price with the new amount
4. Copy the new Price ID
5. Update `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` (or yearly) in `.env.local`
6. Update the `price` field in `lib/payments.js` to match
7. Restart your app

Existing subscribers keep their old price until they change plans.

---

That's it! If you run into issues, check the Stripe docs at https://stripe.com/docs
or open an issue in the project repository.
