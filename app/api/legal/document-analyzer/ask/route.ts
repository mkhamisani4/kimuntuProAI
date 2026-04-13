import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { question, documentText, analysisContext, history = [] } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    if (!documentText?.trim()) {
      return NextResponse.json({ error: 'No document loaded.' }, { status: 400 });
    }

    const truncated = documentText.slice(0, 50000);

    // Build analysis context summary for the system prompt
    const ctxSummary = analysisContext
      ? `
Document Type: ${analysisContext.documentType || 'Unknown'}
Legal Areas: ${(analysisContext.legalAreas || []).join(', ')}
Document Summary: ${analysisContext.summary || 'No summary available'}
Key Findings: ${(analysisContext.keyFindings || []).slice(0, 5).join(' | ')}
`
      : '';

    const systemPrompt = `You are an expert AI legal counsel analyzing a client's document.
You have already reviewed the document and produced a structured analysis.
Answer the client's questions precisely, citing specific parts of the document when relevant.
Be conversational but professional — your answers will be spoken aloud by an AI avatar.
Keep answers focused and under 150 words unless the question genuinely requires more detail.
Always add: "This is general legal information, not legal advice. For your specific situation, consult a licensed attorney."
Do not use markdown formatting — write in plain, spoken prose.
${ctxSummary}

Document content (for reference):
---
${truncated}
---`;

    // Build message history (cap at last 8 exchanges to avoid token bloat)
    const recentHistory: Message[] = (history as Message[]).slice(-16);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: question },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.4,
      max_tokens: 400,
    });

    const answer = completion.choices[0]?.message?.content?.trim() ?? 'I was unable to generate a response. Please try again.';

    return NextResponse.json({ ok: true, answer });
  } catch (err: any) {
    console.error('[DocumentAnalyzer/ask]', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to answer question.' },
      { status: 500 }
    );
  }
}
