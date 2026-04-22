/**
 * POST /api/ai/chat
 * Kimuntu Legal AI Chat — real AI responses via Anthropic SDK
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are the Kimuntu Legal AI assistant, specializing in comparative criminal and civil law between Canada and the United States. You help users understand legal concepts, procedures, rights, and case outcomes.

Guidelines:
- Provide accurate, detailed legal information comparing Canadian and US law where relevant
- Always clarify that your responses are for informational purposes only and not legal advice
- Reference specific statutes, cases, and code sections when applicable
- Be concise but thorough — prioritize clarity
- If a question is outside your legal knowledge domain, say so clearly and suggest consulting a licensed attorney`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service is not configured' }, { status: 503 });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ ok: true, content }, { status: 200 });
  } catch (error: any) {
    console.error('[Chat] API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', message: error.message },
      { status: 500 }
    );
  }
}
