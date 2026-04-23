import type { JobPosting } from './types';

export const MOCK_JOBS: JobPosting[] = [
  {
    id: 'job_001',
    title: 'Frontend Engineer (React)',
    company: 'Northstar Labs',
    location: 'Toronto, ON (Remote)',
    workType: 'Remote',
    description:
      'Build and ship React features, collaborate with design, optimize performance, and maintain a modern component system.',
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Testing'],
    applyUrl: 'https://example.com/apply/frontend-engineer-react',
    source: 'mock',
  },
  {
    id: 'job_002',
    title: 'Full-Stack Developer (Next.js)',
    company: 'Kimuntu AI Partners',
    location: 'Montreal, QC (Hybrid)',
    workType: 'Hybrid',
    description:
      'Own features end-to-end with Next.js, API routes, Firebase, and UI. Improve reliability, monitoring, and developer experience.',
    tags: ['Next.js', 'React', 'Firebase', 'Node.js', 'APIs'],
    applyUrl: 'https://example.com/apply/fullstack-nextjs',
    source: 'mock',
  },
  {
    id: 'job_003',
    title: 'Data Analyst (SQL, Dashboards)',
    company: 'BluePeak Analytics',
    location: 'Remote (Canada)',
    workType: 'Remote',
    description:
      'Turn product data into insights. Build dashboards, write SQL, define KPIs, and communicate findings to stakeholders.',
    tags: ['SQL', 'Excel', 'Dashboards', 'KPI', 'Communication'],
    applyUrl: 'https://example.com/apply/data-analyst-sql',
    source: 'mock',
  },
  {
    id: 'job_004',
    title: 'Product Manager (AI Tools)',
    company: 'Orbit AI',
    location: 'Vancouver, BC (Hybrid)',
    workType: 'Hybrid',
    description:
      'Drive discovery and delivery of AI-powered tools. Partner with engineering, design, and research to ship measurable outcomes.',
    tags: ['Product', 'Roadmap', 'AI', 'Stakeholders', 'Agile'],
    applyUrl: 'https://example.com/apply/product-manager-ai',
    source: 'mock',
  },
  {
    id: 'job_005',
    title: 'Backend Engineer (Node.js)',
    company: 'Harbor Systems',
    location: 'Ottawa, ON (On-site)',
    workType: 'On-site',
    description:
      'Design APIs, implement services, and improve performance. Work with databases and cloud tooling in a secure environment.',
    tags: ['Node.js', 'REST', 'Databases', 'AWS', 'Security'],
    applyUrl: 'https://example.com/apply/backend-node',
    source: 'mock',
  },
];

