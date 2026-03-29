import type { JobPosting } from './types';

export type JobMatchInput = {
  skillsText?: string;
  resumeText?: string;
  workType?: string;
  location?: string;
};

export type JobMatchResult = JobPosting & {
  score: number;
  reasons: string[];
};

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-_/ ]/g, ' ')
    .trim();
}

function tokenize(text: string): Set<string> {
  const cleaned = normalizeToken(text);
  const raw = cleaned.split(/\s+/g).filter(Boolean);
  // keep unique, and prefer tokens that carry meaning
  const tokens = raw.filter((t) => t.length >= 2);
  return new Set(tokens);
}

function containsAny(haystack: Set<string>, needles: string[]): string[] {
  const hits: string[] = [];
  for (const n of needles) {
    const key = normalizeToken(n);
    if (!key) continue;
    // if tag has spaces (e.g. "next.js"), tokenize into pieces but also check original
    const parts = key.split(/\s+/g).filter(Boolean);
    const ok =
      (parts.length === 1 && haystack.has(parts[0])) ||
      (parts.length > 1 && parts.every((p) => haystack.has(p)));
    if (ok) hits.push(n);
  }
  return hits;
}

export function matchJobs(jobs: JobPosting[], input: JobMatchInput): JobMatchResult[] {
  const skills = (input.skillsText || '').trim();
  const resume = (input.resumeText || '').trim();
  const combined = `${skills}\n${resume}`.trim();

  const tokens = tokenize(combined || '');

  return jobs
    .map((job) => {
      const tagHits = containsAny(tokens, job.tags);
      const titleHits = containsAny(tokens, job.title.split(/\s+/g));

      let score = 0;
      score += tagHits.length * 8;
      score += titleHits.length * 2;

      // light preferences boosts (no hard filtering)
      if (input.workType && input.workType !== 'Any') {
        if (input.workType.toLowerCase() === job.workType.toLowerCase()) score += 3;
      }
      if (input.location && input.location.trim()) {
        const locTokens = tokenize(input.location);
        const jobLocTokens = tokenize(`${job.location} ${job.company}`);
        const overlap = [...locTokens].filter((t) => jobLocTokens.has(t)).length;
        score += Math.min(3, overlap);
      }

      const reasons: string[] = [];
      if (tagHits.length) reasons.push(`Matched skills: ${tagHits.slice(0, 5).join(', ')}`);
      if (!tagHits.length && combined) reasons.push('Relevant keywords found in your profile');
      if (!combined) reasons.push('Add skills or a resume for better matching');

      return { ...job, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);
}

