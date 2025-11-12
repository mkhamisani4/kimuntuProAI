# Database Migrations

This directory contains Prisma migrations for the KimuntuPro AI database.

## Prerequisites

1. **PostgreSQL 15+** with **pgvector** extension installed
2. Connection string in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/kimuntupro_dev?schema=public"
   ```

## Installing pgvector

### macOS (Homebrew)
```bash
brew install pgvector
```

### Ubuntu/Debian
```bash
sudo apt install postgresql-15-pgvector
```

### Docker (Recommended for Development)
```bash
docker run -d \
  --name kimuntupro-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kimuntupro_dev \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

## Running Migrations

### First Time Setup

1. **Create database** (if using Docker, this is done automatically):
   ```bash
   createdb kimuntupro_dev
   ```

2. **Run migrations**:
   ```bash
   cd packages/db
   npm run db:migrate
   ```

3. **Seed database** with sample data:
   ```bash
   npm run db:seed
   ```

4. **Run post-migration SQL** (AFTER you have embeddings data):
   ```bash
   psql $DATABASE_URL -f prisma/migrations/20250110000000_init/post_migration.sql
   ```

### Production Deployment

Use `db:deploy` for production (no interactive prompts):
```bash
npm run db:deploy
```

## Migration Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Create and apply migrations (dev)
- `npm run db:migrate:create` - Create migration without applying
- `npm run db:deploy` - Apply migrations (production)
- `npm run db:reset` - Reset database (⚠️ deletes all data)
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed sample data
- `npm run db:push` - Push schema without migration

## Schema Features

### Tables
- **tenants** - Multi-tenancy support
- **users** - User accounts linked to tenants
- **documents** - Source documents for RAG
- **chunks** - Document chunks (500 tokens each)
- **embeddings** - Vector embeddings (1536 dimensions)
- **usage_logs** - Cost tracking and metering
- **feature_flags** - Kill switches for assistants

### Indexes
- **B-tree indexes** on foreign keys and timestamps
- **GIN index** for full-text search on chunk content
- **IVFFlat index** for vector similarity search (post-migration)
- **Unique constraints** on emails and feature flags

### Extensions
- **pgvector** - Vector similarity search
- **pg_trgm** - Trigram similarity (optional)

## Troubleshooting

### "extension 'vector' is not available"
Install pgvector extension (see prerequisites above).

### IVFFlat index creation fails
The IVFFlat index requires existing data. Run `post_migration.sql` AFTER seeding or importing embeddings.

### Migration conflicts
If you have schema drift:
```bash
npm run db:push  # Push schema without migration
```

Or reset and re-migrate (⚠️ loses data):
```bash
npm run db:reset
```
