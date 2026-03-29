# @kimuntupro/db

Database layer for KimuntuPro AI with Prisma and pgvector support.

## Features

- **PostgreSQL** with **pgvector** extension for vector similarity search
- **Prisma ORM** for type-safe database access
- **Multi-tenancy** support built-in
- **Full-text search** on document chunks
- **Vector embeddings** (1536 dimensions for text-embedding-3-small)
- **Usage tracking** for cost metering
- **Feature flags** for kill switches

## Quick Start

### 1. Install PostgreSQL with pgvector

**Using Docker (Recommended)**:
```bash
docker run -d \
  --name kimuntupro-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kimuntupro_dev \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

**Or install locally**:
- macOS: `brew install pgvector`
- Ubuntu: `sudo apt install postgresql-15-pgvector`

### 2. Configure Environment

Create `.env.local` in the root:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kimuntupro_dev?schema=public"
```

### 3. Run Migrations

```bash
cd packages/db
npm run db:migrate
```

### 4. Seed Sample Data

```bash
npm run db:seed
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Generate Prisma client + compile TypeScript |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply migrations (dev) |
| `npm run db:migrate:create` | Create migration without applying |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed sample data |
| `npm run db:push` | Push schema without migration |

## Usage

### Import Prisma Client

```typescript
import { prisma } from '@kimuntupro/db';

// Query data
const users = await prisma.user.findMany({
  where: { tenantId: 'tenant-123' },
  include: { tenant: true },
});

// Create data
const document = await prisma.document.create({
  data: {
    tenantId: 'tenant-123',
    title: 'Business Plan',
    tags: ['business', 'planning'],
  },
});
```

### Vector Similarity Search

```typescript
import { prisma } from '@kimuntupro/db';

// Find similar embeddings using cosine similarity
const results = await prisma.$queryRaw`
  SELECT
    e.id,
    c.content,
    1 - (e.vector <=> ${embedding}::vector) AS similarity
  FROM embeddings e
  JOIN chunks c ON e."chunkId" = c.id
  WHERE e."tenantId" = ${tenantId}
  ORDER BY e.vector <=> ${embedding}::vector
  LIMIT ${limit}
`;
```

### Full-Text Search

```typescript
// Search chunks by content
const results = await prisma.$queryRaw`
  SELECT
    id,
    content,
    ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) AS rank
  FROM chunks
  WHERE
    "tenantId" = ${tenantId}
    AND to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
  ORDER BY rank DESC
  LIMIT ${limit}
`;
```

## Schema

### Models

- **Tenant**: Multi-tenancy organization
- **User**: User accounts linked to tenants
- **Document**: Source documents for RAG
- **Chunk**: Document chunks (500 tokens each)
- **Embedding**: Vector embeddings (1536 dimensions)
- **UsageLog**: Cost tracking and metering for AI calls
- **FeatureFlag**: Kill switches for assistants

### Indexes

- B-tree indexes on all foreign keys and timestamps
- GIN index for full-text search on chunk content
- IVFFlat index for vector similarity search (requires data)
- Unique constraints on emails and feature flags

## Post-Migration Steps

After seeding embeddings data, create the vector index:

```bash
psql $DATABASE_URL -f prisma/migrations/20250110000000_init/post_migration.sql
```

This creates the IVFFlat index for efficient vector similarity search.

## Troubleshooting

### "extension 'vector' is not available"

Install pgvector:
- Docker: Use `pgvector/pgvector:pg15` image
- macOS: `brew install pgvector`
- Ubuntu: `sudo apt install postgresql-15-pgvector`

### IVFFlat index creation fails

The IVFFlat index requires existing embedding data. Run `post_migration.sql` AFTER seeding or importing embeddings.

### Connection pool exhaustion

The singleton pattern in `src/index.ts` prevents this in development. For production, configure `DATABASE_URL` with connection pooling (e.g., PgBouncer).

## Production Deployment

1. Set `DATABASE_URL` environment variable
2. Run migrations: `npm run db:deploy`
3. Optionally seed: `npm run db:seed`
4. Create vector index after data load (see post_migration.sql)

## Development

- **Prisma Studio**: `npm run db:studio` - GUI for browsing data
- **Schema changes**: Edit `prisma/schema.prisma`, then `npm run db:migrate`
- **Reset database**: `npm run db:reset` (⚠️ deletes all data)
