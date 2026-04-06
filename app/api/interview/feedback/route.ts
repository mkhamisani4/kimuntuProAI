/**
 * POST /api/interview/feedback
 * Uses OpenAI to generate adaptive, constructive feedback from the question, transcript, text-based sentiment/model findings, and video findings.
 * Body: { items: Array<{ question, answer, evaluationSummary, videoSummary? }> }
 * Env: OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gpt-5.4-mini';

function buildFeedbackPrompt(
  question: string,
  answer: string,
  evaluationSummary: string,
  videoSummary: string
): string {
  return `You are an expert interview coach. Your task is to give brief, actionable feedback based only on the content inside the tagged blocks below.

Instructions:
- Provide 2–4 short bullet points of constructive feedback. Be specific.
- Reference the transcript (e.g. suggest clearer wording or structure).
- Reference the text evaluation (e.g. if "Partially answered", suggest what to add; if "Hedging" or "Uncertain", suggest more direct language; if "Low relevance", tie the answer back to the question; mention band/score if relevant).
- When video findings are provided, reference them (e.g. eye contact, facial expressions, action units / micro-expressions such as brow raise, brow lower, lip press, mouth stretch, and speaking vs pauses) where relevant to delivery and presence.
- Keep tone supportive and professional. Write in the same language as the question (e.g. English or French).
- Use plain text only: no markdown (no ** for bold, no ##). Start each bullet with a short label and a colon (e.g. "Be More Direct:" or "Eye Contact:") as plain text, then the explanation.

<QUESTION>
${question || '(No question)'}
</QUESTION>

<TRANSCRIPT>
${answer || '(No answer provided)'}
</TRANSCRIPT>

<TEXT_EVALUATION>
${evaluationSummary || 'None.'}
</TEXT_EVALUATION>

<VIDEO_FINDINGS>
${videoSummary || 'None.'}
</VIDEO_FINDINGS>

Using only the content above between the tags, output your feedback bullets now.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Set OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY in .env.local.' },
      { status: 503 }
    );
  }

  let body: {
    items?: Array<{
      question?: string;
      answer?: string;
      evaluationSummary?: string;
      videoSummary?: string;
    }>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON. Expected { items: [{ question, answer, evaluationSummary, videoSummary? }] }.' },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ feedbacks: [] });
  }

  const feedbacks: string[] = [];

  for (const it of items) {
    const question = String(it?.question ?? '').trim();
    const answer = String(it?.answer ?? '').trim();
    const evaluationSummary = String(it?.evaluationSummary ?? '').trim();
    const videoSummary = String(it?.videoSummary ?? '').trim();

    if (!question && !answer) {
      feedbacks.push('');
      continue;
    }

    const prompt = buildFeedbackPrompt(question, answer, evaluationSummary || 'No evaluation data.', videoSummary);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_completion_tokens: 400,
          temperature: 0.5,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn('[interview/feedback] OpenAI error:', res.status, err.slice(0, 200));
        feedbacks.push('');
        continue;
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
      feedbacks.push(text);
    } catch (e) {
      console.warn('[interview/feedback] Request failed:', e);
      feedbacks.push('');
    }
  }

  return NextResponse.json({ feedbacks });
}
