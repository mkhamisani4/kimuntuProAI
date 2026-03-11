export type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'On-site';
  description: string;
  tags: string[];
  applyUrl: string;
  source: string;
};

