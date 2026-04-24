'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Building2, ExternalLink, FileText, FlaskConical, Sparkles, Target, Trophy } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  DEFAULT_RESEARCH_PROJECTS,
  RESEARCH_PROJECTS_COLLECTION,
  getMergedResearchProjects,
  normalizeResearchProject,
} from '@/lib/researchProjects';

function StatCard({ label, value, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/5 bg-black/[0.02]'}`}>
      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
      <p className={`mt-1 text-sm ${isDark ? 'text-white/55' : 'text-black/55'}`}>{label}</p>
    </div>
  );
}

function DetailBlock({ icon: Icon, label, value, isDark }) {
  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/5 bg-black/[0.02]'}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{label}</h3>
      </div>
      <p className={`text-sm leading-7 ${isDark ? 'text-white/75' : 'text-black/70'}`}>{value}</p>
    </div>
  );
}

export default function ResearchProjectsView({ inDashboard = false }) {
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState(() =>
    DEFAULT_RESEARCH_PROJECTS.map((project) => normalizeResearchProject(project))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, RESEARCH_PROJECTS_COLLECTION), orderBy('createdAt', 'desc'))
        );

        if (!isMounted) return;

        const fetchedProjects = snapshot.docs.map((doc) =>
          normalizeResearchProject(doc.data(), doc.id)
        );

        setProjects(getMergedResearchProjects(fetchedProjects));
      } catch (error) {
        console.warn('[ResearchProjectsView] Falling back to default projects:', error?.message);
        if (isMounted) {
          setProjects(getMergedResearchProjects([]));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const publishedProjects = useMemo(() => {
    const visible = projects.filter((project) => project.published);
    return visible.length ? visible : DEFAULT_RESEARCH_PROJECTS.map((project) => normalizeResearchProject(project));
  }, [projects]);

  const featuredProject = publishedProjects.find((project) => project.featured) || publishedProjects[0];
  const additionalProjects = publishedProjects.filter((project) => project.id !== featuredProject?.id);

  return (
    <div className="space-y-8">
      <section className={`overflow-hidden rounded-[2rem] border p-8 md:p-10 ${isDark ? 'border-white/10 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10' : 'border-black/5 bg-gradient-to-br from-emerald-50 via-white to-cyan-50'}`}>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-emerald-600/15 bg-emerald-100 text-emerald-800'}`}>
              <FlaskConical className="h-3.5 w-3.5" />
              Research Showcase
            </div>
            <h1 className={`max-w-3xl text-3xl font-bold tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-black'}`}>
              Research projects that show how Kimuntu AI performs in real-world practice.
            </h1>
            <p className={`mt-4 max-w-3xl text-base leading-7 md:text-lg ${isDark ? 'text-white/72' : 'text-black/68'}`}>
              This page highlights studies, prototypes, and evaluation work built on Kimuntu AI. Projects are visible to all users, while admin accounts can manage what gets published.
            </p>
          </div>

        </div>
      </section>

      {featuredProject ? (
        <section className={`rounded-[2rem] border p-8 ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-white shadow-sm'}`}>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            
            {loading ? (
              <span className={`text-xs ${isDark ? 'text-white/40' : 'text-black/45'}`}>Loading saved projects...</span>
            ) : null}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {featuredProject.researcherName} ({featuredProject.institution})
              </p>
              <h2 className={`mt-2 text-2xl font-bold leading-tight md:text-3xl ${isDark ? 'text-white' : 'text-black'}`}>
                {featuredProject.projectTitle}
              </h2>
              <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${isDark ? 'bg-white/5 text-white/75' : 'bg-black/[0.04] text-black/70'}`}>
                <Building2 className="h-4 w-4" />
                Platform: {featuredProject.platform}
              </div>
            </div>

            <div className={`rounded-2xl border p-5 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/5 bg-black/[0.02]'}`}>
              <div className="space-y-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-black/40'}`}>Researcher</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-black'}`}>{featuredProject.researcherName}</p>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-black/40'}`}>Institution</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-white' : 'text-black'}`}>{featuredProject.institution}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <DetailBlock icon={FileText} label="Summary" value={featuredProject.summary} isDark={isDark} />
            <DetailBlock icon={Trophy} label="Key Results" value={featuredProject.keyResults} isDark={isDark} />
            <DetailBlock icon={Target} label="Impact" value={featuredProject.impact} isDark={isDark} />
          </div>
        </section>
      ) : null}

      {additionalProjects.length ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className={`h-5 w-5 ${isDark ? 'text-white/60' : 'text-black/60'}`} />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>More Research</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {additionalProjects.map((project) => (
              <article key={project.id} className={`rounded-3xl border p-6 ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-white shadow-sm'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {project.researcherName} ({project.institution})
                </p>
                <h3 className={`mt-2 text-xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{project.projectTitle}</h3>
                <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-white/70' : 'text-black/68'}`}>{project.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
