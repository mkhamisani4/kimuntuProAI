/**
 * POST /api/interview/tailor-question
 * Tailors the next interview question: blend of (1) follow-up on a good Q1 answer and (2) staying true to job/role/company (plus optional resume context).
 * Body: { previousQuestion, previousAnswer, suggestedNextQuestion, jobDescription?, role?, companyName?, resumeText? }
 * Returns: { tailoredQuestion: string }
 */

import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gpt-5.4-mini';

function buildTailorPrompt(
  previousQuestion: string,
  previousAnswer: string,
  suggestedNextQuestion: string,
  jobContext: { jobDescription: string; role: string; companyName: string; resumeText: string }
): string {
  const { jobDescription, role, companyName, resumeText } = jobContext;
  return `You are an expert interviewer. Your task is to choose the next question with two priorities in balance:

1) **Only use the candidate's answer if it's a good answer.** Consider it "good" if it's substantive (specific experiences, projects, or motivations), relevant to the role, and on-topic. If the answer is empty, very vague, off-topic, or generic, do NOT follow up on it—use the suggested next question (optionally rephrased to tie to the role/company).

2) **Stay true to the job description, role, and company.** Whatever question you output must feel specific to this opportunity. The question should help assess fit for this role at this company. When you do follow up on something they said, tie it back to the role or company (e.g. "You mentioned X—how does that experience prepare you for [aspect of this role]?" or "Given what you said about Y, how would you approach [something from the job]?").

<JOB_CONTEXT>
Role: ${role || '(not provided)'}
Company: ${companyName || '(not provided)'}

Job description (excerpt):
${jobDescription ? jobDescription.slice(0, 1500) : '(not provided)'}

Candidate resume (optional excerpt, may be empty):
${resumeText ? resumeText.slice(0, 1200) : '(not provided)'}
</JOB_CONTEXT>

<PREVIOUS_QUESTION>
${previousQuestion || '(none)'}
</PREVIOUS_QUESTION>

<CANDIDATE_ANSWER>
${previousAnswer || '(no answer)'}
</CANDIDATE_ANSWER>

<SUGGESTED_NEXT_QUESTION>
${suggestedNextQuestion || '(none)'}
</SUGGESTED_NEXT_QUESTION>

Instructions:
- If the candidate's answer is substantive and relevant, you MAY tailor the next question to reference it while tying back to the role/company. Find the blend: a follow-up that feels natural and still assesses fit for this job.
- If the answer is not good enough to follow up on, use the suggested next question (you may lightly rephrase it to reference the role or company if that improves relevance).
- Keep the same category and style as the suggested question (e.g. behavioral stays behavioral, technical stays technical).
- Output exactly ONE question. No preamble, no numbering, no explanation.
- Use the same language as the previous question (e.g. English or French).
- Plain text only: no markdown, no ** or ##.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured.' },
      { status: 503 }
    );
  }

  let body: {
    previousQuestion?: string;
    previousAnswer?: string;
    suggestedNextQuestion?: string;
    jobDescription?: string;
    role?: string;
    companyName?: string;
    resumeText?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON. Expected { previousQuestion, previousAnswer, suggestedNextQuestion, jobDescription?, role?, companyName? }.' },
      { status: 400 }
    );
  }

  const previousQuestion = String(body?.previousQuestion ?? '').trim();
  const previousAnswer = String(body?.previousAnswer ?? '').trim();
  const suggestedNextQuestion = String(body?.suggestedNextQuestion ?? '').trim();
  const jobContext = {
    jobDescription: String(body?.jobDescription ?? '').trim(),
    role: String(body?.role ?? '').trim(),
    companyName: String(body?.companyName ?? '').trim(),
    resumeText: String(body?.resumeText ?? '').trim(),
  };

  if (!suggestedNextQuestion) {
    return NextResponse.json(
      { error: 'suggestedNextQuestion is required.' },
      { status: 400 }
    );
  }

  const prompt = buildTailorPrompt(previousQuestion, previousAnswer, suggestedNextQuestion, jobContext);

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
        max_completion_tokens: 200,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('[interview/tailor-question] OpenAI error:', res.status, err.slice(0, 200));
      return NextResponse.json(
        { error: 'Failed to tailor question.' },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const tailoredQuestion = (data?.choices?.[0]?.message?.content ?? suggestedNextQuestion).trim();
    return NextResponse.json({ tailoredQuestion: tailoredQuestion || suggestedNextQuestion });
  } catch (e) {
    console.warn('[interview/tailor-question] Request failed:', e);
    return NextResponse.json(
      { error: 'Failed to tailor question.' },
      { status: 500 }
    );
  }
}
