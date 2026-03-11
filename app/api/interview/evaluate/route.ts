/**
 * POST /api/interview/evaluate
 * Full interview evaluation: emotion, certainty, tone, answered, relevance, formality, weighted score and band.
 * Body: { items: Array<{ question: string, answer: string }>, interviewType?: string }
 * Env: HUGGINGFACE_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEmotion,
  getCertainty,
  getTone,
  getAnswered,
  getRelevance,
  getFormality,
  computeWeightedScore,
  type EvaluationItem,
  type ScoreBand,
} from '@/lib/interviewEvaluation';

export type EvaluateItemResult = EvaluationItem & {
  score: number;
  band: ScoreBand;
};

export type EvaluateResponse = {
  items: EvaluateItemResult[];
  overallBand: ScoreBand;
  overallScore: number;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'HUGGINGFACE_API_KEY is not configured. Set it in .env.local.' },
      { status: 503 }
    );
  }

  let body: { items?: Array<{ question?: string; answer?: string }>; interviewType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON. Expected { items: [{ question, answer }], interviewType }.' },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const interviewType = typeof body.interviewType === 'string' ? body.interviewType : '';

  if (items.length === 0) {
    return NextResponse.json<EvaluateResponse>({
      items: [],
      overallBand: 'needs_improvement',
      overallScore: 0,
    });
  }

  const results: EvaluateItemResult[] = [];

  for (let i = 0; i < items.length; i++) {
    const { question = '', answer = '' } = items[i];
    const q = String(question).trim();
    const a = String(answer).trim();

    const item: EvaluationItem = { question: q, answer: a };

    const [emotion, certainty, tone, answered, relevance, formality] = await Promise.all([
      getEmotion(apiKey, a).catch(() => ({ emotions: [], model: 'fallback' })),
      getCertainty(apiKey, a).catch(() => ({ label: 'neutral', score: 0.5, scores: [], model: 'fallback' })),
      getTone(apiKey, a).catch(() => ({ tone: 'neutral', scores: [], model: 'fallback' })),
      getAnswered(apiKey, q, a).catch(() => ({ label: 'partially_answered' as const, score: 0.5, scores: [], model: 'fallback' })),
      getRelevance(apiKey, q, a).catch(() => ({ score: 0.5, label: 'medium' as const, model: 'fallback' })),
      getFormality(apiKey, a).catch(() => ({ label: 'formal' as const, score: 0.5, model: 'fallback' })),
    ]);

    item.emotion = { emotions: emotion.emotions };
    item.certainty = { label: certainty.label, score: certainty.score };
    item.tone = tone;
    item.answered = answered;
    item.relevance = relevance;
    item.formality = formality;

    const { score, band } = computeWeightedScore(item);
    results.push({ ...item, score, band });
  }

  const overallScore = results.length ? results.reduce((s, r) => s + r.score, 0) / results.length : 0;
  let overallBand: ScoreBand = 'needs_improvement';
  if (overallScore >= 0.8) overallBand = 'excellent';
  else if (overallScore >= 0.6) overallBand = 'strong';
  else if (overallScore >= 0.4) overallBand = 'needs_improvement';
  else overallBand = 'poor';

  return NextResponse.json<EvaluateResponse>({
    items: results,
    overallBand,
    overallScore,
  });
}
