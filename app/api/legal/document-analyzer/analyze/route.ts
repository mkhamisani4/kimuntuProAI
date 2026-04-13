import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { documentText, fileName } = await req.json();

    if (!documentText || documentText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Document text is too short or empty.' },
        { status: 400 }
      );
    }

    // Truncate very large documents to avoid token limits (keep ~60k chars ≈ ~15k tokens)
    const truncated = documentText.slice(0, 60000);
    const wasTruncated = documentText.length > 60000;

    const systemPrompt = `You are an expert legal analyst and attorney with decades of experience across all areas of law.
Your job is to thoroughly analyze legal documents and provide structured, actionable reports.
Be precise, professional, and identify both obvious and subtle legal issues.
Always output valid JSON matching the schema exactly.`;

    const userPrompt = `Analyze this legal document and return a JSON report with the following exact structure:

{
  "documentType": "string — e.g. Employment Contract, NDA, Lease Agreement, Court Filing, Will, etc.",
  "legalAreas": ["array of applicable legal areas, e.g. Employment Law, Contract Law"],
  "parties": [
    { "name": "Party name or role if name unclear", "role": "Their role in the document e.g. Employer, Employee, Landlord" }
  ],
  "summary": "2-4 sentence plain-language summary of what this document is, its purpose, and its key effect",
  "keyFindings": [
    "Finding 1 — specific important clause or provision",
    "Finding 2",
    "Finding 3 (3–8 findings total)"
  ],
  "risks": [
    {
      "severity": "high | medium | low",
      "issue": "Short title of the risk",
      "detail": "Explanation of why this is a risk and what to watch out for"
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2 (3–6 recommendations total)"
  ],
  "greeting": "A 2-3 sentence spoken greeting from an AI lawyer introducing themselves and the document findings, as if speaking to the client. Start with something like: 'Hello, I've reviewed your [document type]...'. Keep it conversational and professional."
}

File name: ${fileName || 'Unknown document'}
${wasTruncated ? '(Note: document was truncated to the first 60,000 characters for analysis)' : ''}

Document content:
---
${truncated}
---

Return ONLY the JSON object, no markdown, no extra text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Failed to parse analysis response.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, analysis, wasTruncated });
  } catch (err: any) {
    console.error('[DocumentAnalyzer/analyze]', err);
    return NextResponse.json(
      { error: err?.message || 'Analysis failed.' },
      { status: 500 }
    );
  }
}
