/**
 * POST /api/interview/follow-up
 * Returns one short follow-up question based on the main question and user's answer (or null).
 * Body: { question, userAnswer, role?, companyName? }
 */

import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gpt-5.4-mini';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  let body: { question?: string; userAnswer?: string; role?: string; companyName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON. Expected { question, userAnswer, role?, companyName? }.' },
      { status: 400 }
    );
  }

  const question = String(body?.question ?? '').trim();
  const userAnswer = String(body?.userAnswer ?? '').trim();
  const role = String(body?.role ?? '').trim();
  const companyName = String(body?.companyName ?? '').trim();

  if (!question || !userAnswer) {
    return NextResponse.json(
      { error: 'question and userAnswer are required.' },
      { status: 400 }
    );
  }

  const prompt = `You are an expert interviewer. Given the interview question and the candidate's answer below, decide if the answer is substantive enough to ask ONE short follow-up (a "mini question" that digs deeper). 

Rules:
- Only return a follow-up if the answer mentions something specific: a project, technology, challenge, or experience you can probe (e.g. "You mentioned building a React app. What challenges did you face scaling the frontend?").
- Keep the follow-up to 1-2 sentences. It should feel like a natural interviewer follow-up, not a new main question.
- If the answer is empty, very short, vague, or generic, return null.
- Output ONLY valid JSON: either {"followUpQuestion": "Your follow-up question here?"} or {"followUpQuestion": null}. No other text.

Interview question: ${question}

Candidate's answer: ${userAnswer}
${role ? `Role: ${role}` : ''}
${companyName ? `Company: ${companyName}` : ''}

JSON output:`;

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
        max_completion_tokens: 120,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('[interview/follow-up] OpenAI error:', res.status, err.slice(0, 200));
      return NextResponse.json({ followUpQuestion: null }, { status: 200 });
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = (data?.choices?.[0]?.message?.content ?? '').trim();
    let followUpQuestion: string | null = null;
    try {
      const parsed = JSON.parse(raw.replace(/^```\w*\n?|\n?```$/g, '').trim());
      if (typeof parsed?.followUpQuestion === 'string' && parsed.followUpQuestion.trim()) {
        followUpQuestion = parsed.followUpQuestion.trim();
      }
    } catch {
      // ignore parse errors, return null
    }
    return NextResponse.json({ followUpQuestion });
  } catch (e) {
    console.warn('[interview/follow-up] Request failed:', e);
    return NextResponse.json({ followUpQuestion: null }, { status: 200 });
  }
}
