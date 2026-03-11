import type { JobPosting } from '../types';

type ArbeitnowResponse = {
  data?: Array<{
    slug?: string;
    title?: string;
    company_name?: string;
    location?: string;
    remote?: boolean;
    description?: string;
    tags?: string[];
    url?: string;
  }>;
};

export async function fetchArbeitnowJobs(params: {
  query?: string;
  limit?: number;
}): Promise<JobPosting[]> {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Arbeitnow fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as ArbeitnowResponse;
  const jobs = Array.isArray(data?.data) ? data.data : [];
  const q = (params.query || '').trim().toLowerCase();
  const limit = Math.max(1, Math.min(100, params.limit || 50));

  const filtered = q
    ? jobs.filter((j) => {
        const hay = `${j.title || ''} ${j.company_name || ''} ${j.location || ''} ${(j.tags || []).join(' ')}`.toLowerCase();
        return hay.includes(q);
      })
    : jobs;

  const baseUrl = 'https://www.arbeitnow.com';
  return filtered
    .slice(0, limit)
    .map((j) => {
      const rawUrl = (j.url || '').trim();
      // API often omits url; build apply URL from slug (job page: /view/job/{slug})
      const applyUrl =
        rawUrl ||
        (j.slug ? `${baseUrl}/view/job/${encodeURIComponent(j.slug)}` : '');
      const title = (j.title || '').trim();
      const company = (j.company_name || '').trim() || 'Unknown';
      const location = (j.location || (j.remote ? 'Remote' : 'Unknown')).trim();
      const description = (j.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const tags = (Array.isArray(j.tags) ? j.tags : [])
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 20);

      return {
        id: `arbeitnow_${(j.slug || rawUrl || title || company).replace(/\s+/g, '_')}`,
        title: title || 'Untitled role',
        company,
        location,
        workType: j.remote ? 'Remote' : 'On-site',
        description,
        tags,
        applyUrl,
        source: 'arbeitnow',
      } satisfies JobPosting;
    })
    .filter((x) => x.applyUrl);
}

