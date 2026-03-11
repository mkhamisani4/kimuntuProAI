import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { JobPosting } from '@/lib/jobs/types';
import { matchJobs } from '@/lib/jobs/match';
import { fetchRemotiveJobs } from '@/lib/jobs/providers/remotive';
import { fetchArbeitnowJobs } from '@/lib/jobs/providers/arbeitnow';

const BodySchema = z.object({
  skillsText: z.string().optional(),
  resumeText: z.string().optional(),
  workType: z.string().optional(),
  location: z.string().optional(),
  sources: z.array(z.enum(['remotive', 'arbeitnow'])).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { skillsText, resumeText, workType, location, sources } = parsed.data;
  const query = [skillsText, location].filter(Boolean).join(' ').trim();
  const useSources = sources && sources.length ? sources : (['remotive', 'arbeitnow'] as const);

  let jobs: JobPosting[] = [];
  try {
    const results = await Promise.allSettled([
      useSources.includes('remotive') ? fetchRemotiveJobs({ query }) : Promise.resolve([]),
      useSources.includes('arbeitnow') ? fetchArbeitnowJobs({ query, limit: 60 }) : Promise.resolve([]),
    ]);
    jobs = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  } catch {
    jobs = [];
  }

  // Only return jobs from real APIs; no mock/example.com fallback

  // Deduplicate by applyUrl
  const seen = new Set();
  const deduped = [];
  for (const j of jobs) {
    const key = (j.applyUrl || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(j);
  }

  const matches = matchJobs(deduped, { skillsText, resumeText, workType, location });

  return NextResponse.json({ success: true, matches }, { status: 200 });
}

