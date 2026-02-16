/**
 * POST /api/emotion
 * Emotion/sentiment analysis using Hugging Face j-hartmann/emotion-english-distilroberta-base.
 * Returns Ekman-style emotions: anger, disgust, fear, joy, neutral, sadness, surprise.
 *
 * Body: { text: string, topK?: number }
 * Env: HUGGINGFACE_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';

const HF_MODEL = 'j-hartmann/emotion-english-distilroberta-base';
const DEFAULT_TOP_K = 5;
/** Model max length is 514 tokens; ~1.5k chars keeps us under that. */
const MAX_INPUT_CHARS = 1500;

export type EmotionResult = { label: string; score: number };

const POSITIVE_WORDS = /\b(achieved|success|confident|proud|excited|grateful|happy|love|great|excellent|strong|clear|sure|definitely|accomplished|led|delivered|improved)\b/i;
const NEGATIVE_WORDS = /\b(failed|struggled|difficult|stress|worried|confused|disappointed|frustrated|anxious|nervous|sorry|regret)\b/i;

function toEmotionItem(item: unknown): EmotionResult | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const label = (typeof o.label === 'string' ? o.label : typeof o.Label === 'string' ? o.Label : '').trim();
  const rawScore = o.score ?? o.Score;
  const score = typeof rawScore === 'number' ? rawScore : Number(rawScore);
  if (!label) return null;
  return { label, score: Number.isFinite(score) ? score : 0 };
}

function normalizeEmotionResponse(data: unknown): EmotionResult[] {
  if (!data) return [];

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (o.data && Array.isArray(o.data)) return normalizeEmotionResponse(o.data);
    if (o.result && Array.isArray(o.result)) return normalizeEmotionResponse(o.result);
    if (o.predictions && Array.isArray(o.predictions)) return normalizeEmotionResponse(o.predictions);
  }

  if (Array.isArray(data)) {
    const first = data[0];
    if (Array.isArray(first)) {
      return first.map(toEmotionItem).filter((e): e is EmotionResult => e !== null);
    }
    return data.map(toEmotionItem).filter((e): e is EmotionResult => e !== null);
  }

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (typeof o.label === 'string' && (typeof o.score === 'number' || typeof o.score === 'string')) {
      const score = Number(o.score);
      if ((o.label as string).trim()) return [{ label: (o.label as string).trim(), score: Number.isFinite(score) ? score : 0 }];
    }
    if (Array.isArray(o.labels) && Array.isArray(o.scores)) {
      const labels = o.labels as string[];
      const scores = o.scores as number[];
      return labels
        .map((label, i) => toEmotionItem({ label, score: scores[i] }))
        .filter((e): e is EmotionResult => e !== null);
    }
  }

  return [];
}

function lexicalEmotionFallback(text: string): EmotionResult | null {
  const t = text.slice(0, 2000);
  const pos = (t.match(POSITIVE_WORDS) || []).length;
  const neg = (t.match(NEGATIVE_WORDS) || []).length;
  if (pos > neg && pos >= 2) return { label: 'joy', score: Math.min(0.5 + pos * 0.15, 0.92) };
  if (neg > pos && neg >= 2) return { label: 'sadness', score: Math.min(0.5 + neg * 0.12, 0.88) };
  return { label: 'neutral', score: 0.5 };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'HUGGINGFACE_API_KEY is not configured. Set it in .env.local.' },
      { status: 503 }
    );
  }

  let body: { text?: string; topK?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body. Expected { text: string, topK?: number }.' },
      { status: 400 }
    );
  }

  const rawText = typeof body.text === 'string' ? body.text.trim() : '';
  if (!rawText) {
    return NextResponse.json(
      { error: 'Missing or empty "text" in body.' },
      { status: 400 }
    );
  }
  const text = rawText.length > MAX_INPUT_CHARS ? rawText.slice(0, MAX_INPUT_CHARS) : rawText;

  const topK = typeof body.topK === 'number' && body.topK > 0
    ? Math.min(body.topK, 7)
    : DEFAULT_TOP_K;

  const hfPayload = {
    inputs: text,
    parameters: { top_k: topK },
    options: { wait_for_model: true },
  };

  async function callHf(): Promise<Response> {
    return fetch(`https://router.huggingface.co/hf-inference/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hfPayload),
    });
  }

  try {
    let res = await callHf();

    if (res.status === 503) {
      const errBody = await res.text();
      const estimated = (() => {
        try {
          const j = JSON.parse(errBody);
          return typeof (j as { estimated_time?: number }).estimated_time === 'number'
            ? (j as { estimated_time: number }).estimated_time
            : 20;
        } catch {
          return 20;
        }
      })();
      await new Promise((r) => setTimeout(r, Math.min(estimated * 1000, 45000)));
      res = await callHf();
    }

    if (!res.ok) {
      const errText = await res.text();
      let message = `Hugging Face API error: ${res.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error) message = errJson.error;
      } catch {
        if (errText) message = errText.slice(0, 300);
      }
      console.error('[emotion] HF error', res.status, message, errText.slice(0, 200));
      const status = res.status === 503 ? 503 : res.status === 401 ? 401 : res.status === 403 ? 403 : 502;
      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    const data = await res.json();

    if (data && typeof (data as { error?: string }).error === 'string') {
      return NextResponse.json(
        { error: (data as { error: string }).error },
        { status: 502 }
      );
    }

    const emotions = normalizeEmotionResponse(data);
    if (emotions.length > 0) {
      return NextResponse.json({
        emotions,
        model: HF_MODEL,
      });
    }

    console.warn('[emotion] No emotions parsed from HF. Raw response:', JSON.stringify(data).slice(0, 600));
    const fallback = lexicalEmotionFallback(text);
    const fallbackList = fallback ? [fallback] : [];
    return NextResponse.json({
      emotions: fallbackList,
      model: fallbackList.length > 0 ? 'fallback' : HF_MODEL,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Emotion analysis failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
