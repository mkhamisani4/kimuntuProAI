export const RESEARCH_PROJECTS_COLLECTION = 'research_projects';

export const DEFAULT_RESEARCH_PROJECTS = [
  {
    slug: 'mohammed-khamisani-asu-interview-simulator',
    researcherName: 'Mohammed Khamisani',
    institution: 'ASU',
    projectTitle: 'Evaluating the Effects of Multi-Modal Sentiment and Facial Expression Analysis on Adaptive Feedback to Improve Interview Performance',
    platform: 'Interview Simulator within Career Track of Kimuntu AI',
    summary:
      'In today’s highly competitive job market, interviews are not only scarce, but also highly pressurized environments which leave candidates feeling stressed or anxious. With limited tools and resources to practice, candidates are unable to prepare and perform effectively. This project introduces an interview simulator that leverages sentiment and facial expression analysis to generate adaptive feedback that can be used to improve interview confidence, performance, and preparation.',
    keyResults:
      'The study demonstrated that the simulator was perceived as realistic and effective, with 90% of participants rating the experience as somewhat or very realistic. Additionally, 90% and 70% of participants found sentiment and facial expression analysis helpful, respectively, while many reported increased confidence and reduced or stable anxiety levels. High user adoption was also observed, with 100% of participants indicating they would reuse the system and 96.7% willing to recommend it.',
    impact:
      'These findings highlight the effectiveness of combining audio and video inputs to deliver multi-modal, feedback-driven interview preparation. The system not only improves technical performance but also addresses emotional factors such as confidence and anxiety, which are critical in real-world interviews. Overall, this work establishes a strong foundation for the development of adaptive, AI-driven tools that enhance interview readiness in an increasingly competitive job market.',
    published: true,
    featured: true,
    source: 'default',
  },
];

export function slugifyResearchProject(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeResearchProject(project = {}, id) {
  const researcherName = String(project.researcherName || '').trim();
  const institution = String(project.institution || '').trim();
  const projectTitle = String(project.projectTitle || '').trim();
  const slugBase = project.slug || `${researcherName}-${institution}-${projectTitle}`;

  return {
    id: id || project.id || slugifyResearchProject(slugBase) || 'research-project',
    slug: slugifyResearchProject(slugBase) || 'research-project',
    researcherName,
    institution,
    projectTitle,
    platform: String(project.platform || '').trim(),
    summary: String(project.summary || '').trim(),
    keyResults: String(project.keyResults || '').trim(),
    impact: String(project.impact || '').trim(),
    published: project.published !== false,
    featured: project.featured === true,
    source: project.source || 'firestore',
  };
}

export function getMergedResearchProjects(projects = []) {
  const merged = [...projects];
  const seen = new Set(projects.map((project) => project.slug || project.id));

  DEFAULT_RESEARCH_PROJECTS.forEach((project) => {
    const normalized = normalizeResearchProject(project);
    const key = normalized.slug || normalized.id;
    if (!seen.has(key)) {
      merged.push(normalized);
      seen.add(key);
    }
  });

  return merged;
}
