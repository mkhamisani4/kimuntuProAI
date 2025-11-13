/**
 * RAG Search API (MVP)
 * Query vector DB for relevant chunks
 */

import { NextRequest, NextResponse } from 'next/server';
import { retrieve } from '@kimuntupro/rag-core';

export const runtime = 'nodejs';

/**
 * GET /api/rag/search?tenantId=...&q=...&topK=8
 * Search for relevant document chunks
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const tenantId = searchParams.get('tenantId');
    const query = searchParams.get('q');
    const topK = parseInt(searchParams.get('topK') || '8', 10);

    // Validation
    if (!tenantId) {
      return NextResponse.json(
        { ok: false, error: 'Missing tenantId' },
        { status: 400 }
      );
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Missing query (q parameter)' },
        { status: 400 }
      );
    }

    console.log(`[RAG Search] Query: "${query.slice(0, 50)}..." for tenant ${tenantId}, topK=${topK}`);

    // Retrieve from vector DB
    const items = await retrieve({
      tenantId,
      query,
      topK,
    });

    console.log(`[RAG Search] Found ${items.length} results`);

    return NextResponse.json({
      ok: true,
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error('[RAG Search] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
