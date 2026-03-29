import type { JobPosting } from '../types';

type RemotiveResponse = {
  jobs?: Array<{
    id: number;
    title?: string;
    company_name?: string;
    candidate_required_location?: string;
    job_type?: string;
    category?: string;
    description?: string;
    tags?: string[];
    url?: string;
  }>;
};

function workTypeFromRemotive(jobType?: string): JobPosting['workType'] {
  const t = (jobType || '').toLowerCase();
  if (t.includes('hybrid')) return 'Hybrid';
  if (t.includes('on-site') || t.includes('onsite') || t.includes('in-person')) return 'On-site';
  return 'Remote';
}

export async function fetchRemotiveJobs(params: {
  query?: string;
}): Promise<JobPosting[]> {
  const search = (params.query || '').trim();
  const url = new URL('https://remotive.com/api/remote-jobs');
  if (search) url.searchParams.set('search', search);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    // keep results fresh but allow caching in production
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Remotive fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as RemotiveResponse;
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];

  return jobs
    .map((j) => {
      const applyUrl = j.url || '';
      if (!applyUrl) return null;
      const title = (j.title || '').trim();
      const company = (j.company_name || '').trim() || 'Unknown';
      const location = (j.candidate_required_location || 'Remote').trim();
      const description = (j.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const tags = (Array.isArray(j.tags) ? j.tags : [])
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 20);

      return {
        id: `remotive_${j.id}`,
        title: title || 'Untitled role',
        company,
        location,
        workType: workTypeFromRemotive(j.job_type),
        description,
        tags: [...new Set([...(j.category ? [j.category] : []), ...tags])],
        applyUrl,
        source: 'remotive',
      } satisfies JobPosting;
    })
    .filter((x): x is JobPosting => Boolean(x));
}

