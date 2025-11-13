# Alpha Setup Guide - KimuntuPro AI

**Version:** Alpha v1.0.0
**Date:** January 2025

This guide will walk you through setting up the complete development environment for Alpha testing.

---

## Prerequisites

- Node.js 18+ installed ✅ (you have this)
- npm installed ✅ (you have this)
- **PostgreSQL 15 or 16** (needs installation)

---

## Step 1: Install PostgreSQL

### Windows Installation

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (PostgreSQL 15 or 16)
   - File size: ~300 MB

2. **Run the Installer:**
   - Double-click the downloaded .exe file
   - Accept defaults for installation directory
   - **Set a password for postgres user** (e.g., `postgres123`)
   - Port: Keep default `5432`
   - Locale: Keep default
   - Install pgAdmin 4 (yes)
   - Install Stack Builder (optional, can skip)

3. **Verify Installation:**
   ```bash
   # Open PowerShell or Command Prompt
   "C:\Program Files\PostgreSQL\15\bin\psql" --version
   ```

   Should output: `psql (PostgreSQL) 15.x`

---

## Step 2: Create Database

### Option A: Using pgAdmin 4 (GUI)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to `PostgreSQL 15` (enter your postgres password)
3. Right-click **Databases** → **Create** → **Database**
4. Database name: `kimuntupro_dev`
5. Owner: `postgres`
6. Click **Save**

### Option B: Using Command Line

```bash
# Open PowerShell as Administrator
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
.\psql.exe -U postgres

# In psql console:
CREATE DATABASE kimuntupro_dev;
\q
```

---

## Step 3: Configure Environment Variables

**Edit `.env.local` file:**

Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation:

```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/kimuntupro_dev?schema=public"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/kimuntupro_dev?schema=public"
```

---

## Step 4: Run Database Migrations

Now that PostgreSQL is running and configured, set up the database schema:

```bash
# From project root directory
cd packages/db

# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# Verify tables were created
npm run prisma:studio
```

This will:
- Create all database tables (tenants, users, documents, chunks, embeddings, usage_logs, etc.)
- Set up pgvector extension for embeddings
- Generate the Prisma client for database access

**Expected Output:**
```
✓ Prisma Client generated successfully
✓ Migration applied: 001_init
✓ Database schema is up to date
```

---

## Step 5: Verify Database Setup

### Check Database Connection

```bash
cd packages/db
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555` where you can:
- View all database tables
- Verify schema structure
- Inspect data (will be empty initially)

### Test Connection from App

```bash
# From project root
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✓ Database connected')).catch(e => console.error('✗ Connection failed:', e.message))"
```

---

## Step 6: Restart Development Server

Now that database is configured:

```bash
# Stop current dev server (Ctrl+C)

# Restart with new database connection
npm run dev
```

---

## Step 7: Test AI Assistants

### Test Streamlined Plan (No DB required)

```bash
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d "{\"assistant\":\"streamlined_plan\",\"input\":\"Create a meal prep delivery service for college students\",\"tenantId\":\"demo\",\"userId\":\"test\"}"
```

### Test Market Analysis (With Tavily Web Search)

```bash
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d "{\"assistant\":\"market_analysis\",\"input\":\"Analyze the meal prep market in 2025\",\"tenantId\":\"demo\",\"userId\":\"test\"}"
```

**Expected response includes:**
- ✅ `"ok": true`
- ✅ `"toolInvocations": { "webSearch": 1 }` (confirms Tavily called)
- ✅ No database errors in terminal
- ✅ Usage logged to database

---

## Troubleshooting

### Issue: "Can't reach database server at localhost:5432"

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows Task Manager → Services → Look for "postgresql-x64-15"
   ```
2. Start PostgreSQL service if stopped:
   ```bash
   # PowerShell as Admin:
   net start postgresql-x64-15
   ```
3. Verify DATABASE_URL in `.env.local` has correct password

### Issue: "Relation 'UsageLog' does not exist"

**Solution:**
```bash
cd packages/db
npm run prisma:migrate
```

### Issue: "[Tavily] Search error: TypeError: tavily is not a function"

**Solution:**
- ✅ Fixed in latest code (using `new TavilyClient()` instead)
- Rebuild: `cd packages/ai-core && npm run build`

### Issue: Planner schema error "got 'type: None'"

**Solution:**
- This is an OpenAI API issue with structured outputs
- The system automatically falls back to heuristic planning
- Not critical for Alpha testing

---

## Database Schema Overview

The database includes these tables:

| Table | Purpose |
|-------|---------|
| `tenants` | Multi-tenancy support |
| `users` | User accounts per tenant |
| `documents` | Uploaded documents for RAG |
| `chunks` | Document chunks for retrieval |
| `embeddings` | Vector embeddings (pgvector) |
| `usage_logs` | API usage tracking (Phase 5) |
| `feature_flags` | Per-tenant feature toggles |

---

## Environment Variables Checklist

Verify these are set in `.env.local`:

```env
# ✅ Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/kimuntupro_dev?schema=public"

# ✅ OpenAI
OPENAI_API_KEY=sk-proj-...

# ✅ Tavily (for web search)
WEBSEARCH_PROVIDER=tavily
WEBSEARCH_API_KEY=tvly-dev-...

# ✅ Firebase (for auth)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase vars
```

---

## Next Steps

Once setup is complete:

1. **Test all assistants:**
   - Streamlined Plan
   - Market Analysis
   - Executive Summary
   - Financial Overview

2. **Monitor Tavily Dashboard:**
   - Visit https://app.tavily.com
   - Check API usage logs
   - Verify web search requests appear

3. **Check Database Logs:**
   - Open Prisma Studio: `cd packages/db && npm run prisma:studio`
   - Navigate to `usage_logs` table
   - Verify requests are being logged

4. **Review Structured Logs:**
   - Check terminal output for JSON logs
   - Look for `request_id`, `toolInvocations`, `costCents`
   - All requests should have request IDs in headers

---

## Support

If you encounter issues:

1. Check terminal logs for specific error messages
2. Verify PostgreSQL service is running
3. Ensure all environment variables are set
4. Check Prisma Client is generated: `cd packages/db && npm run prisma:generate`

---

**Status:** Ready for Alpha Testing 🚀

All systems are production-ready for internal Alpha testing with Phase 5 observability features enabled.
