/**
 * POST /api/ai/business-assistant
 * Server-side AI endpoint for business track assistant features
 * Replaces client-side OpenAI calls from lib/services/openaiService.js
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ACTIONS = [
  'generateProjectIdeas',
  'generateTitleSuggestions',
  'enhanceDescription',
  'generateMarketAnalysis',
  'recommendResources',
  'identifyChallenges',
  'generateGoals',
  'getBrainstormingHelp',
] as const;

type Action = typeof ACTIONS[number];

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { action, params } = body as { action: Action; params: Record<string, any> };

    if (!action || !ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action', validActions: ACTIONS },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured' },
        { status: 503 }
      );
    }

    const client = new Anthropic({ apiKey });

    const { systemPrompt, userPrompt, maxTokens } = buildPrompt(action, params);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Business assistant error:', error);
    return NextResponse.json(
      { error: error.message || 'AI request failed' },
      { status: 500 }
    );
  }
}

function buildPrompt(action: Action, params: Record<string, any>): {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
} {
  switch (action) {
    case 'generateProjectIdeas':
      return {
        systemPrompt: 'You are an innovation expert helping professionals develop creative project ideas.',
        userPrompt: `Generate 3 innovative project ideas for the ${params.category} category.
${params.userPreferences ? `User preferences: ${params.userPreferences}` : ''}

For each idea, provide:
1. A catchy title (max 10 words)
2. A brief description (2-3 sentences)

Format as a JSON array with objects containing 'title' and 'description' fields.`,
        maxTokens: 800,
      };

    case 'generateTitleSuggestions':
      return {
        systemPrompt: 'You are a creative naming expert.',
        userPrompt: `Based on this project description: "${params.description}"
Category: ${params.category}

Generate 5 catchy, professional project titles (max 10 words each).
Return as a JSON array of strings.`,
        maxTokens: 300,
      };

    case 'enhanceDescription':
      return {
        systemPrompt: 'You are an expert at crafting compelling project descriptions.',
        userPrompt: `Improve and expand this project description while keeping it concise (3-4 sentences):
"${params.currentDescription}"

Category: ${params.category}

Make it more professional, clear, and compelling. Return only the enhanced description, no additional text.`,
        maxTokens: 300,
      };

    case 'generateMarketAnalysis':
      return {
        systemPrompt: 'You are a market research analyst.',
        userPrompt: `Provide a brief market analysis for a project in the ${params.category} category.
Project: ${params.projectTitle}

Include:
1. Current market trends (2-3 points)
2. Target audience
3. Potential opportunities
4. Key competitors or challenges

Keep it concise and actionable (max 200 words).`,
        maxTokens: 500,
      };

    case 'recommendResources':
      return {
        systemPrompt: 'You are a project planning expert.',
        userPrompt: `Based on this project: "${params.projectDescription}"
Category: ${params.category}

Recommend 5-7 essential resources needed, including:
- Technical tools/platforms
- Team roles
- Budget considerations
- Time investment

Return as a JSON array of strings.`,
        maxTokens: 400,
      };

    case 'identifyChallenges':
      return {
        systemPrompt: 'You are a risk management consultant.',
        userPrompt: `For this project: "${params.projectDescription}"
Category: ${params.category}

Identify 4-5 potential challenges or risks and provide brief mitigation strategies.
Return as a JSON array of objects with 'challenge' and 'mitigation' fields.`,
        maxTokens: 500,
      };

    case 'generateGoals':
      return {
        systemPrompt: 'You are a strategic planning expert.',
        userPrompt: `Based on this project: "${params.projectDescription}"
Category: ${params.category}

Generate 3-5 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).
Return as a JSON array of strings.`,
        maxTokens: 400,
      };

    case 'getBrainstormingHelp':
      return {
        systemPrompt: 'You are a creative brainstorming partner.',
        userPrompt: `Help me brainstorm about: ${params.topic}
${params.context ? `Context: ${params.context}` : ''}

Provide creative insights, questions to consider, and potential directions to explore.`,
        maxTokens: 600,
      };

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
