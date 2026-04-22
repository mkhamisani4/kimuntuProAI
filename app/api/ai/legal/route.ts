/**
 * POST /api/ai/legal
 * Legal Track AI Agent Entry Point
 * Accepts documents (PDF, TXT, MD) + text description + prompt
 * Returns legal analysis, predicted outcome, and action plan
 *
 * Issues: #187 (document intake), #188 (analysis + prediction),
 *         #189 (action plan), #57 (judicial outcomes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runLegalAnalysisAssistant } from '@kimuntupro/ai-core/assistants';
import {
  createRequestContext,
  calculateLatency,
  logRequestEnd,
  logRequestError,
} from '@kimuntupro/ai-core/logging';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import { generateTitle, generateSummary } from '@kimuntupro/db';
import { saveAssistantResultAdmin } from '@kimuntupro/db/firebase/assistantResults.server';

export const runtime = 'nodejs';
export const maxDuration = 120; // Legal analysis may take longer due to web search + escalated model

/**
 * Extract text content from uploaded file
 * Supports PDF (text layer), TXT, and MD files
 */
async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return await file.text();
  }

  if (name.endsWith('.pdf')) {
    // For PDF: attempt text extraction via arrayBuffer
    // Note: This extracts raw text. For scanned PDFs, OCR would be needed (future enhancement)
    const buffer = Buffer.from(await file.arrayBuffer());
    // Simple PDF text extraction - look for text between BT/ET markers
    // For production, consider pdf-parse or similar library
    const text = buffer.toString('utf-8');
    // Filter to printable text segments
    const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (printable.length > 50) {
      return printable;
    }
    // Fallback: return raw text conversion
    return await file.text();
  }

  return await file.text();
}

/**
 * Handle POST request to /api/ai/legal
 * Accepts multipart form data with:
 *   - files: File[] (optional, PDF/TXT/MD documents)
 *   - input: string (case description / prompt)
 *   - jurisdiction: string (optional, e.g., "US", "Canada")
 *   - caseType: string (optional, e.g., "contract", "employment")
 *   - tenantId: string
 *   - userId: string
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let requestContext;

  try {
    const formData = await req.formData();

    // Extract fields
    const input = formData.get('input') as string;
    const tenantId = (formData.get('tenantId') as string) || 'demo-tenant';
    const userId = formData.get('userId') as string;
    const jurisdiction = formData.get('jurisdiction') as string | null;
    const caseType = formData.get('caseType') as string | null;

    // Validate required fields
    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Missing required field: input (case description or prompt)' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'missing_auth', message: 'User authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Extract text from uploaded files
    const files = formData.getAll('files') as File[];
    let documentText = '';

    if (files.length > 0) {
      const textParts: string[] = [];
      for (const file of files) {
        // Validate file type
        if (!file.name.match(/\.(pdf|txt|md)$/i)) {
          return NextResponse.json(
            { error: 'invalid_file', message: `Unsupported file type: ${file.name}. Only PDF, TXT, and MD files are accepted.` },
            { status: 400 }
          );
        }

        try {
          const text = await extractFileText(file);
          if (text.trim()) {
            textParts.push(`=== Document: ${file.name} ===\n${text}`);
          }
        } catch (err: any) {
          console.error(`[Legal] Failed to extract text from ${file.name}:`, err);
          // Continue with other files
        }
      }
      documentText = textParts.join('\n\n');
    }

    // Create request context for logging
    requestContext = createRequestContext('legal_analysis', tenantId, userId);

    console.log(`[Legal] Processing request for user ${userId} with ${files.length} document(s)`);

    // Run legal analysis assistant
    const response = await runLegalAnalysisAssistant({
      assistant: 'legal_analysis',
      input: input.trim(),
      tenantId,
      userId,
      extra: {
        documentText: documentText || undefined,
        jurisdiction: jurisdiction || undefined,
        caseType: caseType || undefined,
        fileCount: files.length,
        fileNames: files.map((f) => f.name),
      },
    });

    // Calculate metrics
    const latencyMs = calculateLatency(requestContext);
    const tokensTotal = response.metadata?.tokensUsed || 0;
    const tokensIn = Math.floor(tokensTotal * 0.4);
    const tokensOut = tokensTotal - tokensIn;
    const costCents = Math.round((response.metadata?.cost || 0) * 100);

    // Log request completion
    logRequestEnd(requestContext.requestId, 'legal_analysis', {
      tenantId,
      userId,
      model: response.metadata?.model || 'unknown',
      costCents,
      latencyMs,
      tokensIn,
      tokensOut,
    });

    // Record usage
    await logRequestUsage({
      tenantId,
      userId,
      assistant: 'legal_analysis',
      model: response.metadata?.model || 'unknown',
      tokensIn,
      tokensOut,
      costCents,
      latencyMs,
      toolInvocations: response.metadata?.toolInvocations || {},
      requestId: requestContext.requestId,
    });

    // Save result for Recent Activity
    let resultId: string | undefined;
    try {
      resultId = await saveAssistantResultAdmin({
        tenantId,
        userId,
        assistant: 'legal_analysis' as any,
        title: generateTitle(input, 'legal_analysis'),
        summary: generateSummary(response.sections),
        sections: response.sections,
        sources: response.sources,
        metadata: {
          model: response.metadata?.model || 'unknown',
          tokensUsed: tokensIn + tokensOut,
          latencyMs,
          cost: response.metadata?.cost || 0,
        },
      });
    } catch (error: any) {
      console.error('[Legal] Failed to save result:', error);
    }

    // Return response
    return NextResponse.json(
      {
        ok: true,
        sections: response.sections,
        sources: response.sources,
        meta: {
          model: response.metadata?.model,
          tokensIn,
          tokensOut,
          costCents,
          latencyMs,
          timestamp: new Date().toISOString(),
          toolInvocations: response.metadata?.toolInvocations || {},
          resultId,
          filesProcessed: files.length,
        },
      },
      {
        status: 200,
        headers: { 'X-Request-ID': requestContext.requestId },
      }
    );
  } catch (error: any) {
    console.error('[Legal] Route error:', error);

    if (requestContext) {
      logRequestError(
        requestContext.requestId,
        'legal_analysis',
        error,
        error.name || 'UNKNOWN_ERROR',
        {
          tenantId: requestContext.tenantId,
          userId: requestContext.userId,
          latencyMs: calculateLatency(requestContext),
        }
      );
    }

    if (error.name === 'QuotaError') {
      return NextResponse.json(
        { error: 'quota_exceeded', message: error.message, resetsAt: error.resetsAtISO },
        {
          status: 429,
          headers: requestContext ? { 'X-Request-ID': requestContext.requestId } : {},
        }
      );
    }

    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to generate legal analysis' },
      {
        status: 500,
        headers: requestContext ? { 'X-Request-ID': requestContext.requestId } : {},
      }
    );
  }
}
