import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const runtime = 'nodejs';
export const maxDuration = 30;

function ensurePdfParseGlobals() {
  if (typeof (globalThis as typeof globalThis & { DOMMatrix?: unknown }).DOMMatrix !== 'undefined') {
    return;
  }

  // pdf-parse v2 expects a few browser-style geometry globals even in Node.
  // We only need text extraction here, so lightweight shims are sufficient.
  const { DOMMatrix, DOMPoint, DOMRect } = require('@napi-rs/canvas/geometry');

  (globalThis as typeof globalThis & { DOMMatrix?: typeof DOMMatrix }).DOMMatrix = DOMMatrix;
  (globalThis as typeof globalThis & { DOMPoint?: typeof DOMPoint }).DOMPoint = DOMPoint;
  (globalThis as typeof globalThis & { DOMRect?: typeof DOMRect }).DOMRect = DOMRect;

  if (typeof (globalThis as typeof globalThis & { ImageData?: unknown }).ImageData === 'undefined') {
    (globalThis as typeof globalThis & { ImageData?: typeof ImageData }).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;

      constructor(data = new Uint8ClampedArray(), width = 0, height = 0) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    } as typeof ImageData;
  }

  if (typeof (globalThis as typeof globalThis & { Path2D?: unknown }).Path2D === 'undefined') {
    (globalThis as typeof globalThis & { Path2D?: typeof Path2D }).Path2D = class Path2D {} as typeof Path2D;
  }
}

function ensurePdfParseWorker() {
  const workerUrl = pathToFileURL(
    path.join(process.cwd(), 'public', 'pdf.worker.min.mjs')
  ).href;

  const currentWorker = (globalThis as typeof globalThis & { __kimuntuPdfWorkerSrc?: string }).__kimuntuPdfWorkerSrc;
  if (currentWorker === workerUrl) {
    return;
  }

  const { PDFParse } = require('pdf-parse');
  PDFParse.setWorker(workerUrl);
  (globalThis as typeof globalThis & { __kimuntuPdfWorkerSrc?: string }).__kimuntuPdfWorkerSrc = workerUrl;
}

/**
 * POST /api/legal/document-analyzer/extract
 * Accepts a file upload and returns extracted plain text.
 * Handles PDF (via pdf-parse) and TXT/MD (direct read).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 10 MB limit.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    let text = '';

    if (ext === 'pdf') {
      const buffer = Buffer.from(await file.arrayBuffer());
      ensurePdfParseGlobals();
      ensurePdfParseWorker();

      // pdf-parse v2 exports a PDFParse class instead of the old callable default export.
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });

      try {
        const result = await parser.getText();
        text = result.text ?? '';
      } finally {
        await parser.destroy().catch(() => {});
      }
    } else if (['txt', 'md'].includes(ext)) {
      text = await file.text();
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, TXT, or Markdown file.' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file. The PDF may be image-based or encrypted.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ ok: true, text, chars: text.length });
  } catch (err: any) {
    console.error('[DocumentAnalyzer/extract]', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to extract text from file.' },
      { status: 500 }
    );
  }
}
