/**
 * Client for /api/emotion (GoEmotions BERT-based emotion analysis).
 * Use for interview response analysis: confidence, confusion, nervousness, etc.
 *
 * @param {string} text - Text to analyze (e.g. user's interview answer)
 * @param {{ topK?: number }} [options] - Optional. topK: max emotions to return (default 10)
 * @returns {Promise<{ emotions: Array<{ label: string, score: number }>, model: string }>}
 */
export async function analyzeEmotion(text, options = {}) {
  const topK = options.topK ?? 10;
  const res = await fetch('/api/emotion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: String(text).trim(), topK }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Emotion analysis failed');
  return data;
}
