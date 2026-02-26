/**
 * POST /api/interview/generate-questions
 * Generates interview questions via OpenAI. Logs request/response to terminal.
 * Body: { jobDescription, role, companyWebsite?, interviewType, resumeText?, skills? }
 */

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildInterviewQuestionsPrompt } from '@/lib/interviewQuestionsPrompt';

export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Set OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY in .env.local.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON. Expected { jobDescription, role, interviewType, ... }.' },
      { status: 400 }
    );
  }

  const {
    jobDescription = '',
    role = '',
    companyWebsite = '',
    interviewType = '',
    resumeText = '',
    skills = '',
  } = body;

  if (!jobDescription || !role || !interviewType) {
    return NextResponse.json(
      { error: 'Missing required fields: jobDescription, role, interviewType.' },
      { status: 400 }
    );
  }

  const { systemContent, userContent } = buildInterviewQuestionsPrompt({
    jobDescription,
    role,
    companyWebsite,
    interviewType,
    resumeText,
    skills,
  });

  console.log('\n[Interview Questions] ========== REQUEST ==========');
  console.log('[Interview Questions] model: gpt-4o-mini, temperature: 0.7, max_tokens: 800');
  console.log('[Interview Questions] systemContent length:', systemContent.length);
  console.log('[Interview Questions] userContent length:', userContent.length);
  console.log('[Interview Questions] --- systemContent ---\n', systemContent);
  console.log('[Interview Questions] --- userContent ---\n', userContent);
  console.log('[Interview Questions] ================================\n');

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const questionsText = completion.choices[0]?.message?.content?.trim() ?? '';
    // Parse numbered list so multi-line questions (e.g. with code blocks) stay together
    const lines = questionsText.split('\n');
    const questions = [];
    let current = '';
    const numberedStart = /^\d+\.\s*/;
    for (const line of lines) {
      if (numberedStart.test(line)) {
        if (current.trim()) questions.push(current.trim());
        current = line.replace(numberedStart, '');
      } else {
        if (current) current += '\n';
        current += line;
      }
    }
    if (current.trim()) questions.push(current.trim());
    const parsed = questions.slice(0, 6);

    console.log('\n[Interview Questions] ========== RESPONSE ==========');
    console.log('[Interview Questions] --- rawText ---\n', questionsText);
    console.log('[Interview Questions] parsedCount:', parsed.length);
    console.log('[Interview Questions] parsedQuestions:', parsed);
    console.log('[Interview Questions] usage:', completion.usage);
    console.log('[Interview Questions] ================================\n');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[Interview Questions] OpenAI API Error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate interview questions.' },
      { status: 500 }
    );
  }
}
