/**
 * RAG Upload API (MVP)
 * Upload file → Firebase Storage → Firestore metadata → Chunk → Embed → Weaviate
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveDocumentMeta, getDocumentMeta } from '@kimuntupro/db';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/packages/db/src/firebase/client';
import { chunkText, generateEmbeddings, WeaviateClient } from '@kimuntupro/rag-core';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for large file processing

/**
 * POST /api/rag/upload
 * Upload document and ingest into vector DB
 */
export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string;
    const userId = formData.get('userId') as string;

    // Validation
    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!tenantId || !userId) {
      return NextResponse.json(
        { ok: false, error: 'Missing tenantId or userId' },
        { status: 400 }
      );
    }

    // Check file type (PDF, TXT, MD)
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|md)$/i)) {
      return NextResponse.json(
        { ok: false, error: 'Only PDF, TXT, and MD files are supported' },
        { status: 400 }
      );
    }

    console.log(`[RAG Upload] Processing ${file.name} (${file.size} bytes) for tenant ${tenantId}`);

    // 1) Upload to Firebase Storage
    const storage = getStorage(app);
    const storagePath = `docs/${tenantId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, storagePath);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await uploadBytes(fileRef, fileBuffer, {
      contentType: file.type,
    });

    console.log(`[RAG Upload] Uploaded to Storage: ${storagePath}`);

    // 2) Save metadata to Firestore
    const docId = await saveDocumentMeta({
      tenantId,
      userId,
      name: file.name,
      mime: file.type || 'application/octet-stream',
      size: file.size,
      storagePath,
    });

    console.log(`[RAG Upload] Saved Firestore metadata: ${docId}`);

    // 3) Extract text (MVP: simple text extraction)
    let text: string;
    try {
      text = await file.text();
    } catch (error) {
      console.error('[RAG Upload] Failed to extract text:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to extract text from file', docId },
        { status: 500 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'File contains no text', docId },
        { status: 400 }
      );
    }

    console.log(`[RAG Upload] Extracted ${text.length} characters`);

    // 4) Chunk text
    const chunks = chunkText(text, { chunkSize: 800, chunkOverlap: 160 });

    if (chunks.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No chunks generated', docId },
        { status: 400 }
      );
    }

    console.log(`[RAG Upload] Created ${chunks.length} chunks`);

    // 5) Generate embeddings
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);

    console.log(`[RAG Upload] Generated ${embeddings.length} embeddings`);

    // 6) Upsert to Weaviate
    const weaviateClient = new WeaviateClient();
    await weaviateClient.initialize();

    const items = chunks.map((chunk, idx) => ({
      id: `${docId}:${chunk.order}`,
      text: chunk.text,
      docId,
      tenantId,
      embedding: embeddings[idx],
      docTitle: file.name,
      storagePath,
    }));

    await weaviateClient.upsert(items);

    console.log(`[RAG Upload] Upserted ${items.length} chunks to Weaviate`);

    // Success
    return NextResponse.json({
      ok: true,
      docId,
      chunks: chunks.length,
      message: 'Document uploaded and indexed successfully',
    });
  } catch (error: any) {
    console.error('[RAG Upload] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
