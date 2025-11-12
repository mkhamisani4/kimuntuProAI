-- Post-Migration SQL
-- Run this AFTER initial data load (embeddings exist)
-- This creates the IVFFlat index for efficient vector similarity search

-- IVFFlat index requires data to be present for clustering
-- lists = 100 is appropriate for ~10,000 - 100,000 vectors
-- Adjust based on your data size: sqrt(num_vectors) is a good starting point

CREATE INDEX IF NOT EXISTS "embeddings_vector_idx"
ON "embeddings"
USING ivfflat ("vector" vector_cosine_ops)
WITH (lists = 100);

-- Note: If you have a large dataset, you may want to increase lists:
-- For 1M vectors: lists = 1000
-- For 10M vectors: lists = 3162 (sqrt(10M))
--
-- You can rebuild the index later with:
-- DROP INDEX IF EXISTS embeddings_vector_idx;
-- CREATE INDEX embeddings_vector_idx ON embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = N);
