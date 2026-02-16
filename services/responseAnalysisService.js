/**
 * Analyzes interview responses using GoEmotions (emotion) and zero-shot (certainty).
 * Used by the interview simulator to show confidence/certainty per response.
 */

import { analyzeEmotion } from './emotionService';

/**
 * Call /api/certainty for certainty/hedging (confident vs uncertain language).
 * @param {string} text
 * @returns {Promise<{ label: string, score: number, scores: Array<{ label: string, score: number }> }>}
 */
export async function analyzeCertainty(text) {
  const res = await fetch('/api/certainty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: String(text).trim() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Certainty analysis failed');
  return data;
}

/**
 * Derive a simple "confidence" label from GoEmotions results.
 * Uses all 27 GoEmotions labels: confident-leaning vs uncertain/anxious-leaning.
 * @param {Array<{ label: string, score: number }>} emotions
 * @returns {{ label: string, score: number }}
 */
function lexicalEmotionFallback(text) {
  const pos = (text.match(/\b(achieved|success|confident|proud|excited|grateful|happy|great|excellent|strong|clear|sure|definitely|accomplished|led|delivered|improved)\b/gi) || []).length;
  const neg = (text.match(/\b(failed|struggled|difficult|stress|worried|confused|disappointed|frustrated|anxious|nervous|sorry|regret)\b/gi) || []).length;
  if (pos > neg && pos >= 1) return [{ label: 'Joy', score: Math.min(0.5 + pos * 0.15, 0.9) }];
  if (neg > pos && neg >= 1) return [{ label: 'Sadness', score: Math.min(0.5 + neg * 0.12, 0.88) }];
  return [{ label: 'Neutral', score: 0.5 }];
}

function confidenceFromEmotions(emotions) {
  if (!emotions || emotions.length === 0) {
    return { label: 'neutral', score: 0.5 };
  }
  const confident = [
    'admiration', 'approval', 'excitement', 'pride', 'gratitude', 'joy', 'love',
    'optimism', 'curiosity', 'caring', 'relief', 'amusement', 'realization', 'surprise'
  ];
  const uncertain = [
    'confusion', 'nervousness', 'fear', 'embarrassment', 'disappointment', 'sadness',
    'remorse', 'grief', 'disapproval', 'anger', 'annoyance', 'disgust'
  ];
  let score = 0.5;
  for (const { label, score: s } of emotions) {
    const L = (label || '').toLowerCase().trim();
    if (confident.includes(L)) score += s * 0.2;
    if (uncertain.includes(L)) score -= s * 0.25;
  }
  score = Math.max(0, Math.min(1, score));
  const label = score >= 0.55 ? 'confident' : score <= 0.45 ? 'uncertain' : 'neutral';
  return { label, score };
}

/**
 * Run both GoEmotions and certainty analysis on one response.
 * @param {string} text - User's response text
 * @param {{ topK?: number }} [options]
 * @returns {Promise<{ emotion: { emotions: Array<{ label: string, score: number }>, confidence: { label: string, score: number } }, certainty: { label: string, score: number, scores: Array } }>}
 */
export async function analyzeResponse(text, options = {}) {
  const t = String(text || '').trim();
  if (!t) {
    return {
      emotion: { emotions: [], confidence: { label: 'neutral', score: 0.5 } },
      certainty: { label: 'neutral', score: 0.5, scores: [] },
    };
  }

  const [emotionResult, certaintyResult] = await Promise.all([
    analyzeEmotion(t, { topK: options.topK ?? 7 }).catch((err) => {
      console.warn('[emotion] API failed, using fallback:', err?.message || err);
      return { emotions: [], model: '' };
    }),
    analyzeCertainty(t).catch(() => ({
      label: 'neutral',
      score: 0.5,
      scores: [],
    })),
  ]);

  let emotions = emotionResult.emotions || [];
  if (emotions.length === 0) {
    emotions = lexicalEmotionFallback(t);
  }
  const confidence = confidenceFromEmotions(emotions);

  return {
    emotion: {
      emotions,
      confidence,
    },
    certainty: {
      label: certaintyResult.label || 'neutral',
      score: certaintyResult.score ?? 0.5,
      scores: certaintyResult.scores || [],
    },
  };
}

/**
 * Analyze all responses in parallel (e.g. when showing summary).
 * @param {string[]} responses - Array of response texts
 * @returns {Promise<Array<{ emotion: object, certainty: object }>>}
 */
export async function analyzeAllResponses(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return [];
  }
  return Promise.all(responses.map((text) => analyzeResponse(text)));
}

/**
 * Full interview evaluation: emotion, certainty, tone, answered, relevance, formality, STAR (if behavioral), weighted score and band.
 * Prefer this when you have question–answer pairs (e.g. interview summary).
 * @param {string[]} questions - Array of question strings
 * @param {string[]} responses - Array of answer strings (same length as questions)
 * @param {string} [interviewType] - e.g. "Behavioral", "Mixed" (enables STAR scoring)
 * @returns {Promise<{ items: Array<{ emotion, certainty, tone, answered, relevance, formality, star?, score, band }>, overallBand: string, overallScore: number }>}
 */
export async function evaluateInterviewResponses(questions, responses, interviewType = '') {
  if (!Array.isArray(questions) || !Array.isArray(responses) || questions.length !== responses.length) {
    return { items: [], overallBand: 'needs_improvement', overallScore: 0 };
  }
  const items = questions.map((q, i) => ({ question: String(q || '').trim(), answer: String(responses[i] ?? '').trim() }));
  const res = await fetch('/api/interview/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, interviewType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Interview evaluation failed');
  return data;
}

/**
 * Build a short evaluation summary string for one item (for LLM feedback).
 * @param {object} analysis - One item from evaluateInterviewResponses().items
 * @returns {string}
 */
function buildEvaluationSummary(analysis) {
  if (!analysis) return '';
  const parts = [];
  const emotions = analysis.emotion?.emotions ?? [];
  if (emotions.length > 0) {
    parts.push('Emotion: ' + emotions.slice(0, 4).map((e) => `${e.label || ''} (${Math.round((e.score ?? 0) * 100)}%)`).filter(Boolean).join(', '));
  }
  if (analysis.certainty?.label) parts.push(`Certainty: ${analysis.certainty.label}`);
  if (analysis.tone?.tone) parts.push(`Tone: ${analysis.tone.tone}`);
  if (analysis.answered?.label) {
    const a = analysis.answered.label;
    parts.push('Answered: ' + (a === 'fully_answered' ? 'Fully answered' : a === 'partially_answered' ? 'Partially answered' : 'Did not answer'));
  }
  if (analysis.relevance?.label) parts.push(`Relevance: ${analysis.relevance.label}`);
  if (analysis.formality?.label) parts.push(`Formality: ${analysis.formality.label}`);
  return parts.join('. ');
}

/**
 * Get adaptive AI feedback for each question/answer using evaluation results.
 * @param {string[]} questions
 * @param {string[]} responses
 * @param {object[]} responseAnalyses - items from evaluateInterviewResponses().items
 * @returns {Promise<string[]>} feedbacks - one string per item (may be empty if API fails)
 */
export async function getInterviewFeedback(questions, responses, responseAnalyses) {
  if (!Array.isArray(questions) || !Array.isArray(responses) || !Array.isArray(responseAnalyses) || questions.length !== responses.length) {
    return [];
  }
  const items = questions.map((q, i) => ({
    question: String(q ?? '').trim(),
    answer: String(responses[i] ?? '').trim(),
    evaluationSummary: buildEvaluationSummary(responseAnalyses[i]),
  }));
  const res = await fetch('/api/interview/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Feedback request failed');
  return Array.isArray(data.feedbacks) ? data.feedbacks : [];
}
