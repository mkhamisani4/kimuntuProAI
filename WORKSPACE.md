# KimuntuPro AI - Monorepo Workspace

This repository uses **npm workspaces** to organize the AI assistant infrastructure alongside the Next.js web application.

## Structure

```
kimuntuProAI/
├── app/                          # Next.js 15 App Router (web frontend)
├── packages/                     # Workspace packages
│   ├── ai-core/                 # AI orchestration (planner, executor, LLM client)
│   ├── db/                      # Database layer (Prisma + pgvector)
│   └── shared/                  # Shared types and utilities
├── tools/
│   └── ingest/                  # Document ingestion CLI (planned)
└── docs/                        # Documentation
```

## Packages

### @kimuntupro/ai-core
Core AI functionality including planner, executor, RAG retrieval, and tools (web-search, finance).

**Dependencies**: openai, zod

### @kimuntupro/db
Database layer with Prisma client and pgvector integration for embeddings.

**Dependencies**: @prisma/client

### @kimuntupro/shared
Shared TypeScript types, Zod schemas, and utilities used across packages.

**Dependencies**: None

## Development

```bash
# Install all dependencies
npm install

# Build all workspace packages
npm run build:packages

# Type-check all packages
npm run type-check

# Run tests
npm run test

# Start Next.js dev server (with packages)
npm run dev
```

## Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- TypeScript 5.6+
- Postgres 15+ with pgvector extension (for database package)

## Sprint Context

This workspace structure supports the AI Assistant sprint (#108, #109, #110) with RAG + Web Search capabilities. See `/docs/ai/` for detailed architecture and implementation docs (created in later steps).
