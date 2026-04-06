/**
 * POST /api/ai/career-assistant
 * Server-side AI endpoint for career track assistant features
 * Replaces client-side OpenAI calls from services/openaiService.js
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ACTIONS = [
  'tailorResume',
  'generateCoverLetter',
  'chatJobAssistant',
  'generateInterviewQuestions',
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
      messages: [
        ...(params.conversationHistory || [])
          .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
          .map((msg: any) => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Career assistant error:', error);
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
    case 'tailorResume':
      return {
        systemPrompt: 'You are an expert resume writer specializing in creating highly tailored resumes that match specific job descriptions.',
        userPrompt: buildResumePrompt(params),
        maxTokens: 4000,
      };

    case 'generateCoverLetter':
      return {
        systemPrompt: 'You are an expert cover letter writer who creates professional, compelling, and authentic cover letters.',
        userPrompt: buildCoverLetterPrompt(params),
        maxTokens: 2000,
      };

    case 'chatJobAssistant':
      return {
        systemPrompt: buildChatAssistantSystemPrompt(params),
        userPrompt: params.message,
        maxTokens: 1000,
      };

    case 'generateInterviewQuestions':
      return {
        systemPrompt: 'You are an expert career coach and interview preparation specialist.',
        userPrompt: buildInterviewPrompt(params),
        maxTokens: 3000,
      };

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

function buildResumePrompt(params: Record<string, any>): string {
  const parts = [
    'Create a highly tailored resume for the following job posting. The resume MUST fit on ONE PAGE ONLY.',
    '',
    `Job Description/Link: ${params.jobLink || params.jobDescription || 'N/A'}`,
  ];

  if (params.resumeText) parts.push(`\nExisting Resume:\n${params.resumeText}`);
  if (params.name) parts.push(`\nName: ${params.name}`);
  if (params.phone) parts.push(`Phone: ${params.phone}`);
  if (params.email) parts.push(`Email: ${params.email}`);
  if (params.linkedin) parts.push(`LinkedIn: ${params.linkedin}`);
  if (params.skills) parts.push(`\nSkills: ${params.skills}`);
  if (params.professionalExperience) parts.push(`\nProfessional Experience: ${params.professionalExperience}`);
  if (params.personalProjects) parts.push(`\nPersonal Projects: ${params.personalProjects}`);
  if (params.education) parts.push(`\nEducation: ${params.education}`);
  if (params.miscInfo) parts.push(`\nAdditional Info: ${params.miscInfo}`);

  parts.push('\nGenerate a tailored, one-page resume in clean, professional format. Include ALL skills from all sources (user input, resume, and job description). Tailor bullet points with keywords from the job description.');

  return parts.join('\n');
}

function buildCoverLetterPrompt(params: Record<string, any>): string {
  const parts = [
    'Generate a professional, compelling cover letter tailored to this job:',
    '',
    `Job Description: ${params.jobDescription || 'N/A'}`,
  ];

  if (params.resumeText) parts.push(`\nResume/Background:\n${params.resumeText}`);
  if (params.name) parts.push(`\nName: ${params.name}`);
  if (params.skills) parts.push(`Skills: ${params.skills}`);
  if (params.experience) parts.push(`Experience: ${params.experience}`);
  if (params.education) parts.push(`Education: ${params.education}`);
  if (params.additionalInfo) parts.push(`Additional Info: ${params.additionalInfo}`);

  parts.push('\nThe cover letter should be approximately one page, professional, authentic, and specifically tailored to the role.');

  return parts.join('\n');
}

function buildChatAssistantSystemPrompt(params: Record<string, any>): string {
  let prompt = `You are an expert career advisor and job search assistant. You help users with:
- Resume improvements and feedback
- Cover letter improvements and feedback
- Job description analysis and questions
- Interview preparation advice
- Career guidance
- Application tips and best practices

You provide helpful, constructive, and actionable advice. Be friendly, professional, and encouraging.`;

  if (params.resumeText) prompt += `\n\nThe user has provided their resume for context:\n${params.resumeText}`;
  if (params.coverLetterText) prompt += `\n\nThe user has provided their cover letter for context:\n${params.coverLetterText}`;
  if (params.jobDescription) prompt += `\n\nThe user has provided a job description for context:\n${params.jobDescription}`;

  return prompt;
}

function buildInterviewPrompt(params: Record<string, any>): string {
  const parts = [
    `Generate interview preparation questions for the following:`,
    '',
    `Role: ${params.role || 'N/A'}`,
    `Interview Type: ${params.interviewType || 'General'}`,
  ];

  if (params.jobDescription) parts.push(`\nJob Description: ${params.jobDescription}`);
  if (params.companyWebsite) parts.push(`Company Website: ${params.companyWebsite}`);
  if (params.resumeText) parts.push(`\nCandidate Resume:\n${params.resumeText}`);
  if (params.skills) parts.push(`\nCandidate Skills: ${params.skills}`);

  parts.push('\nGenerate 10-15 relevant interview questions with suggested answers. For technical interviews, include actual coding/system design questions. Return as a JSON array of objects with "question" and "suggestedAnswer" fields.');

  return parts.join('\n');
}
