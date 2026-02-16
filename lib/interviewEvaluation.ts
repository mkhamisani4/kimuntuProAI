/**
 * Interview evaluation using Hugging Face models.
 * Used by POST /api/interview/evaluate to compute tone, answered, relevance, formality, STAR.
 * Requires HUGGINGFACE_API_KEY.
 */

const HF_BASE = 'https://router.huggingface.co/hf-inference/models';
const MAX_CHARS = 1500;

/** Below this length, answers are treated as non-answers for answered/relevance/formality to avoid over-scoring gibberish. */
const MIN_ANSWER_CHARS = 50;

function truncate(s: string, max = MAX_CHARS): string {
  return s.length <= max ? s : s.slice(0, max);
}

function isSubstantiveAnswer(answer: string): boolean {
  return answer.trim().length >= MIN_ANSWER_CHARS;
}

async function hfPost<T>(
  apiKey: string,
  model: string,
  payload: Record<string, unknown>,
  options?: { timeout?: number }
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeout ?? 25000);
  const res = await fetch(`${HF_BASE}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, options: { wait_for_model: true } }),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!res.ok) {
    const errText = await res.text();
    let msg = `HF ${res.status}`;
    try {
      const j = JSON.parse(errText);
      if (j.error) msg = j.error;
    } catch {
      if (errText) msg = errText.slice(0, 200);
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Normalize HF text-classification response to { label, score }[]. */
function normalizeScores(data: unknown): Array<{ label: string; score: number }> {
  if (Array.isArray(data) && data.length > 0) {
    return data.map((x: { label?: string; score?: number }) => ({
      label: String(x?.label ?? '').trim(),
      score: Number(x?.score ?? 0),
    })).filter((x) => x.label);
  }
  const o = data as Record<string, unknown>;
  if (o && Array.isArray(o.labels) && Array.isArray(o.scores)) {
    return (o.labels as string[]).map((label, i) => ({
      label: String(label).trim(),
      score: Number((o.scores as number[])?.[i] ?? 0),
    })).filter((x) => x.label);
  }
  if (o && typeof o.label === 'string' && typeof o.score === 'number') {
    return [{ label: (o.label as string).trim(), score: o.score as number }];
  }
  return [];
}

// --- Emotion: j-hartmann/emotion-english-distilroberta-base ---
const EMOTION_MODEL = 'j-hartmann/emotion-english-distilroberta-base';

// --- BART (used for certainty, answered, relevance, STAR) ---
const BART_MODEL = 'facebook/bart-large-mnli';

export type EmotionResult = { emotions: Array<{ label: string; score: number }>; model: string };

export async function getEmotion(apiKey: string, text: string): Promise<EmotionResult> {
  const input = truncate(text);
  if (!input) return { emotions: [], model: 'fallback' };
  try {
    const data = await hfPost<unknown>(apiKey, EMOTION_MODEL, {
      inputs: input,
      parameters: { top_k: 5 },
    });
    const emotions = normalizeScores(Array.isArray(data) ? data[0] : data);
    return { emotions, model: EMOTION_MODEL };
  } catch {
    return { emotions: [], model: 'fallback' };
  }
}

// --- Certainty: facebook/bart-large-mnli (confident / uncertain / hedging) ---
const CERTAINTY_LABELS = ['confident', 'uncertain', 'hedging'];

export type CertaintyResult = { label: string; score: number; scores: Array<{ label: string; score: number }>; model: string };

export async function getCertainty(apiKey: string, text: string): Promise<CertaintyResult> {
  const input = truncate(text);
  if (!input) return { label: 'neutral', score: 0.5, scores: [], model: 'fallback' };
  try {
    const data = await hfPost<{ labels?: string[]; scores?: number[] } | Array<{ label: string; score: number }>>(
      apiKey,
      BART_MODEL,
      {
        inputs: input,
        parameters: { candidate_labels: CERTAINTY_LABELS, multi_label: false },
      }
    );
    const scores = Array.isArray(data)
      ? (data as Array<{ label: string; score: number }>).map((x) => ({ label: String(x?.label ?? ''), score: Number(x?.score ?? 0) }))
      : data?.labels?.map((l, i) => ({ label: l, score: data.scores?.[i] ?? 0 })) ?? [];
    const top = scores[0];
    const label = top?.label ?? 'neutral';
    return { label, score: top?.score ?? 0.5, scores, model: BART_MODEL };
  } catch {
    return { label: 'neutral', score: 0.5, scores: [], model: 'fallback' };
  }
}

// --- Tone: SamLowe/roberta-base-go_emotions (raw labels, no mapping) ---
const TONE_MODEL = 'SamLowe/roberta-base-go_emotions';

export type ToneResult = {
  tone: string;
  scores: Array<{ label: string; score: number }>;
  model: string;
};

export async function getTone(apiKey: string, text: string): Promise<ToneResult> {
  const input = truncate(text);
  if (!input) return { tone: 'neutral', scores: [], model: 'fallback' };
  try {
    const data = await hfPost<unknown>(apiKey, TONE_MODEL, {
      inputs: input,
      parameters: { top_k: 8 },
    });
    const scores = normalizeScores(Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data);
    const top = scores[0];
    if (!top) return { tone: 'neutral', scores: [], model: TONE_MODEL };
    const raw = (top.label || '').trim().toLowerCase();
    const tone = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'neutral';
    return { tone, scores, model: TONE_MODEL };
  } catch {
    return { tone: 'neutral', scores: [], model: 'fallback' };
  }
}

// --- Answered & Relevance: BART zero-shot ---
export type AnsweredResult = {
  label: 'fully_answered' | 'partially_answered' | 'not_answered';
  score: number;
  scores: Array<{ label: string; score: number }>;
  model: string;
};

const ANSWERED_LABELS = [
  'The candidate fully and directly answered the question.',
  'The candidate partially addressed the question.',
  'The candidate did not answer the question.',
];

export async function getAnswered(apiKey: string, question: string, answer: string): Promise<AnsweredResult> {
  const a = answer.trim();
  if (!a) {
    return {
      label: 'not_answered',
      score: 0,
      scores: ANSWERED_LABELS.map((l, i) => ({ label: l, score: i === 2 ? 1 : 0 })),
      model: 'fallback',
    };
  }
  if (!isSubstantiveAnswer(a)) {
    return {
      label: 'not_answered',
      score: 0.1,
      scores: ANSWERED_LABELS.map((l, i) => ({ label: l, score: i === 2 ? 0.9 : 0.05 })),
      model: 'fallback',
    };
  }
  const premise = truncate(`Question: ${question}\nAnswer: ${answer}`, 800);
  try {
    const data = await hfPost<{ labels?: string[]; scores?: number[] } | Array<{ label: string; score: number }>>(
      apiKey,
      BART_MODEL,
      {
        inputs: premise,
        parameters: { candidate_labels: ANSWERED_LABELS, multi_label: false },
      }
    );
    let scores: Array<{ label: string; score: number }>;
    if (Array.isArray(data) && data.length > 0) {
      scores = data.map((x: { label?: string; score?: number }) => ({
        label: String(x?.label ?? ''),
        score: Number(x?.score ?? 0),
      }));
    } else if (data?.labels && data?.scores) {
      scores = data.labels.map((l, i) => ({ label: l, score: data.scores![i] ?? 0 }));
    } else {
      return { label: 'partially_answered', score: 0.5, scores: [], model: BART_MODEL };
    }
    const top = scores[0];
    if (!top) return { label: 'partially_answered', score: 0.5, scores, model: BART_MODEL };
    const label =
      top.label.includes('fully') ? 'fully_answered'
      : top.label.includes('did not') ? 'not_answered'
      : 'partially_answered';
    return { label, score: top.score, scores, model: BART_MODEL };
  } catch {
    return { label: 'partially_answered', score: 0.5, scores: [], model: 'fallback' };
  }
}

export type RelevanceResult = {
  score: number; // 0-1
  label: 'high' | 'medium' | 'low';
  model: string;
};

const RELEVANCE_LABELS = [
  'The answer is highly relevant to the question.',
  'The answer is somewhat relevant to the question.',
  'The answer is not relevant to the question.',
];

export async function getRelevance(apiKey: string, question: string, answer: string): Promise<RelevanceResult> {
  const a = answer.trim();
  if (!a) return { score: 0, label: 'low', model: 'fallback' };
  if (!isSubstantiveAnswer(a)) return { score: 0.15, label: 'low', model: 'fallback' };
  const premise = truncate(`Question: ${question}\nAnswer: ${answer}`, 800);
  try {
    const data = await hfPost<{ labels?: string[]; scores?: number[] } | Array<{ label: string; score: number }>>(
      apiKey,
      BART_MODEL,
      {
        inputs: premise,
        parameters: { candidate_labels: RELEVANCE_LABELS, multi_label: false },
      }
    );
    let scores: Array<{ label: string; score: number }>;
    if (Array.isArray(data) && data.length > 0) {
      scores = data.map((x: { label?: string; score?: number }) => ({
        label: String(x?.label ?? ''),
        score: Number(x?.score ?? 0),
      }));
    } else if (data?.labels && data?.scores) {
      scores = data.labels.map((l, i) => ({ label: l, score: data.scores![i] ?? 0 }));
    } else {
      return { score: 0.5, label: 'medium', model: BART_MODEL };
    }
    const high = scores.find((s) => s.label.includes('highly'));
    const medium = scores.find((s) => s.label.includes('somewhat'));
    const low = scores.find((s) => s.label.includes('not relevant'));
    const highScore = high?.score ?? 0;
    const mediumScore = medium?.score ?? 0;
    const lowScore = low?.score ?? 0;
    const score = highScore * 1 + mediumScore * 0.5 + lowScore * 0;
    const label = highScore >= 0.55 ? 'high' : highScore >= 0.35 || mediumScore >= 0.45 ? 'medium' : 'low';
    return { score: Math.min(1, Math.max(0, score)), label, model: BART_MODEL };
  } catch {
    return { score: 0.5, label: 'medium', model: 'fallback' };
  }
}

// --- Formality: s-nlp/roberta-base-formality-ranker ---
const FORMALITY_MODEL = 's-nlp/roberta-base-formality-ranker';

export type FormalityResult = {
  label: 'formal' | 'informal';
  score: number;
  model: string;
};

export async function getFormality(apiKey: string, text: string): Promise<FormalityResult> {
  const input = truncate(text);
  if (!input) return { label: 'formal', score: 0.5, model: 'fallback' };
  if (!isSubstantiveAnswer(input)) return { label: 'informal', score: 0.3, model: 'fallback' };
  try {
    const data = await hfPost<unknown>(apiKey, FORMALITY_MODEL, {
      inputs: input,
      parameters: {},
    });
    const scores = normalizeScores(Array.isArray(data) ? data[0] : data);
    const formal = scores.find((s) => /formal/i.test(s.label));
    const informal = scores.find((s) => /informal/i.test(s.label));
    const formalScore = formal?.score ?? 0.5;
    const informalScore = informal?.score ?? 0.5;
    const isFormal = formalScore >= informalScore;
    return {
      label: isFormal ? 'formal' : 'informal',
      score: isFormal ? formalScore : informalScore,
      model: FORMALITY_MODEL,
    };
  } catch {
    return { label: 'formal', score: 0.5, model: 'fallback' };
  }
}

// --- Combined scoring ---
export type EvaluationItem = {
  question: string;
  answer: string;
  emotion?: { emotions: Array<{ label: string; score: number }>; confidence?: { label: string; score: number } };
  certainty?: { label: string; score: number };
  tone?: ToneResult;
  answered?: AnsweredResult;
  relevance?: RelevanceResult;
  formality?: FormalityResult;
};

export type ScoreBand = 'excellent' | 'strong' | 'needs_improvement' | 'poor';

export function computeWeightedScore(item: EvaluationItem): { score: number; band: ScoreBand } {
  const relevance = item.relevance?.score ?? 0.5;
  const rawTone = (item.tone?.tone ?? '').toLowerCase();
  const highTone = ['admiration', 'approval', 'joy', 'optimism', 'pride', 'excitement', 'gratitude', 'relief', 'curiosity', 'caring', 'love', 'realization', 'neutral'].includes(rawTone);
  const lowTone = ['nervousness', 'fear', 'confusion', 'embarrassment', 'disappointment', 'sadness', 'remorse', 'grief', 'annoyance', 'anger', 'disapproval'].includes(rawTone);
  const toneConfidence = highTone ? 0.8 : lowTone ? 0.4 : 0.6;
  const emotionalStability = 1 - (item.emotion?.emotions?.some((e) => ['fear', 'anger', 'confusion', 'nervousness'].includes((e.label || '').toLowerCase())) ? 0.3 : 0);
  const professionalism = item.formality?.label === 'formal' ? 0.9 : item.formality?.label === 'informal' ? 0.5 : 0.7;
  const answeredScore = item.answered?.label === 'fully_answered' ? 1 : item.answered?.label === 'partially_answered' ? 0.6 : 0.2;

  const raw =
    0.30 * (relevance * 0.7 + answeredScore * 0.3) +
    0.20 * toneConfidence +
    0.20 * emotionalStability +
    0.30 * professionalism;
  const score = Math.min(1, Math.max(0, raw));

  let band: ScoreBand;
  if (score >= 0.8) band = 'excellent';
  else if (score >= 0.6) band = 'strong';
  else if (score >= 0.4) band = 'needs_improvement';
  else band = 'poor';

  return { score, band };
}
