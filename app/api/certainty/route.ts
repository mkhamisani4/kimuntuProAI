/**
 * POST /api/certainty
 * Certainty/hedging detection using Hugging Face zero-shot classification.
 * Proxy for HEDGEhog-style signal (certain vs uncertain language) since
 * jeniakim/hedgehog is not available on HF Inference API.
 *
 * Body: { text: string }
 * Env: HUGGINGFACE_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';

const HF_MODEL = 'facebook/bart-large-mnli';
const CANDIDATE_LABELS = ['confident', 'uncertain', 'hedging'];

export type CertaintyResult = {
  label: string;
  score: number;
  scores: Array<{ label: string; score: number }>;
  model: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'HUGGINGFACE_API_KEY is not configured. Set it in .env.local.' },
      { status: 503 }
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body. Expected { text: string }.' },
      { status: 400 }
    );
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return NextResponse.json(
      { error: 'Missing or empty "text" in body.' },
      { status: 400 }
    );
  }

  const hfPayload = {
    inputs: text,
    parameters: {
      candidate_labels: CANDIDATE_LABELS,
      multi_label: false,
    },
    options: { wait_for_model: true },
  };

  const neutralFallback = (): CertaintyResult => ({
    label: 'neutral',
    score: 0.5,
    scores: CANDIDATE_LABELS.map((l) => ({ label: l, score: 1 / CANDIDATE_LABELS.length })),
    model: 'fallback',
  });

  async function callHf(): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch(
        `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hfPayload),
          signal: controller.signal,
        }
      );
      return res;
    } finally {
      clearTimeout(timeout);
    }
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
      console.warn('[certainty] HF error, returning neutral fallback:', res.status, message);
      return NextResponse.json(neutralFallback(), { status: 200 });
    }

    const data = await res.json();

    if (data && typeof (data as { error?: string }).error === 'string') {
      console.warn('[certainty] HF body error, returning neutral fallback:', (data as { error: string }).error);
      return NextResponse.json(neutralFallback(), { status: 200 });
    }

    let scores: Array<{ label: string; score: number }>;
    if (Array.isArray(data) && data.length > 0) {
      scores = data.map((item: { label?: string; score?: number }) => ({
        label: String(item?.label ?? ''),
        score: Number(item?.score ?? 0),
      })).filter((s) => s.label);
    } else if (
      data &&
      Array.isArray((data as { labels?: string[] }).labels) &&
      Array.isArray((data as { scores?: number[] }).scores)
    ) {
      const typed = data as { labels: string[]; scores: number[] };
      scores = typed.labels.map((label, i) => ({
        label,
        score: typed.scores[i] ?? 0,
      }));
    } else {
      console.warn('[certainty] Unexpected HF response shape, returning neutral fallback. Got:', typeof data, Array.isArray(data) ? 'array' : Object.keys(data ?? {}));
      return NextResponse.json(neutralFallback(), { status: 200 });
    }

    const top = scores[0];
    const label = top?.label ?? 'neutral';
    const score = top?.score ?? 0.5;

    return NextResponse.json({
      label,
      score,
      scores,
      model: HF_MODEL,
    } satisfies CertaintyResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Certainty analysis failed.';
    console.warn('[certainty] Exception, returning neutral fallback:', message);
    return NextResponse.json(neutralFallback(), { status: 200 });
  }
}
