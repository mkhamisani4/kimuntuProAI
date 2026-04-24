'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { db } from '@/lib/firebase';
import {
  DEFAULT_RESEARCH_PROJECTS,
  RESEARCH_PROJECTS_COLLECTION,
  normalizeResearchProject,
  slugifyResearchProject,
} from '@/lib/researchProjects';

const emptyProject = {
  researcherName: '',
  institution: '',
  projectTitle: '',
  platform: '',
  summary: '',
  keyResults: '',
  impact: '',
  published: true,
  featured: false,
};

function Field({ label, value, onChange, multiline = false, isDark }) {
  const className = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20 ${
    isDark
      ? 'border-white/10 bg-white/[0.03] text-white placeholder:text-white/20'
      : 'border-black/10 bg-white text-black placeholder:text-black/25'
  }`;

  return (
    <div className="space-y-1.5">
      <label className={`block text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-white/40' : 'text-black/40'}`}>
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={5}
          className={`${className} resize-y`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={className}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export default function AdminResearchPage() {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(
          query(collection(db, RESEARCH_PROJECTS_COLLECTION), orderBy('createdAt', 'desc'))
        );

        setProjects(snapshot.docs.map((projectDoc) => normalizeResearchProject(projectDoc.data(), projectDoc.id)));
      } catch (error) {
        console.error('[AdminResearchPage] Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const textClass = isDark ? 'text-white' : 'text-black';
  const mutedClass = isDark ? 'text-white/55' : 'text-black/55';
  const cardClass = isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/5 bg-white shadow-sm';

  const starterProject = useMemo(
    () => normalizeResearchProject(DEFAULT_RESEARCH_PROJECTS[0]),
    []
  );

  const saveProject = async () => {
    if (!editingProject || saving) return;

    setSaving(true);
    const normalized = normalizeResearchProject(editingProject, editingProject.id);
    const isNewProject = editingProject.id === 'new';
    const payload = {
      ...normalized,
      slug: slugifyResearchProject(`${normalized.researcherName}-${normalized.institution}-${normalized.projectTitle}`),
      updatedAt: serverTimestamp(),
    };

    try {
      let savedId = editingProject.id;

      if (isNewProject) {
        const { id, source, ...createPayload } = payload;
        const ref = await addDoc(collection(db, RESEARCH_PROJECTS_COLLECTION), {
          ...createPayload,
          createdAt: serverTimestamp(),
        });
        savedId = ref.id;
      } else {
        const { id, source, ...updatePayload } = payload;
        await updateDoc(doc(db, RESEARCH_PROJECTS_COLLECTION, editingProject.id), updatePayload);
      }

      if (normalized.featured) {
        const featuredBatch = writeBatch(db);
        projects
          .filter((project) => project.id !== savedId && project.featured)
          .forEach((project) => {
            featuredBatch.update(doc(db, RESEARCH_PROJECTS_COLLECTION, project.id), { featured: false });
          });
        await featuredBatch.commit();
      }

      const savedProject = { ...normalized, id: savedId, source: 'firestore' };
      setProjects((current) => {
        const nextProjects = isNewProject
          ? [savedProject, ...current]
          : current.map((project) => (project.id === savedId ? savedProject : project));

        return nextProjects.map((project) => ({
          ...project,
          featured: normalized.featured ? project.id === savedId : project.featured,
        }));
      });

      setEditingProject(null);
    } catch (error) {
      console.error('[AdminResearchPage] Failed to save project:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, RESEARCH_PROJECTS_COLLECTION, projectId));
      setProjects((current) => current.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error('[AdminResearchPage] Failed to delete project:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`border-b pb-4 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <h1 className={`text-2xl font-bold ${textClass}`}>Research</h1>
        <p className={`mt-1 text-sm ${mutedClass}`}>
          Manage research showcase projects that appear on the public and dashboard research pages.
        </p>
      </div>

      <div className={`rounded-3xl border p-5 ${cardClass}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
              <Sparkles className="h-3.5 w-3.5" />
              Starter project included
            </div>
            <p className={`text-sm ${mutedClass}`}>
              The supplied Mohammed Khamisani research project is built into the app as a fallback and can be saved here for full admin control.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditingProject({ ...starterProject, id: 'new' })}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Use Starter Project
            </button>
            <button
              type="button"
              onClick={() => setEditingProject({ id: 'new', ...emptyProject })}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/[0.05] text-black hover:bg-black/[0.08]'}`}
            >
              <Plus className="h-4 w-4" />
              New Empty Project
            </button>
          </div>
        </div>
      </div>

      {editingProject ? (
        <div className={`rounded-3xl border p-6 ${cardClass}`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className={`text-lg font-semibold ${textClass}`}>
                {editingProject.id === 'new' ? 'Create Research Project' : 'Edit Research Project'}
              </h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>
                Published projects appear on `/research` and `/dashboard/research`.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Researcher Name" value={editingProject.researcherName} onChange={(value) => setEditingProject((current) => ({ ...current, researcherName: value }))} isDark={isDark} />
            <Field label="Institution" value={editingProject.institution} onChange={(value) => setEditingProject((current) => ({ ...current, institution: value }))} isDark={isDark} />
            <Field label="Project Title" value={editingProject.projectTitle} onChange={(value) => setEditingProject((current) => ({ ...current, projectTitle: value }))} isDark={isDark} />
            <Field label="Platform" value={editingProject.platform} onChange={(value) => setEditingProject((current) => ({ ...current, platform: value }))} isDark={isDark} />
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="Summary" value={editingProject.summary} onChange={(value) => setEditingProject((current) => ({ ...current, summary: value }))} multiline isDark={isDark} />
            <Field label="Key Results" value={editingProject.keyResults} onChange={(value) => setEditingProject((current) => ({ ...current, keyResults: value }))} multiline isDark={isDark} />
            <Field label="Impact" value={editingProject.impact} onChange={(value) => setEditingProject((current) => ({ ...current, impact: value }))} multiline isDark={isDark} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <label className={`inline-flex items-center gap-2 text-sm ${mutedClass}`}>
              <input
                type="checkbox"
                checked={editingProject.published}
                onChange={(event) => setEditingProject((current) => ({ ...current, published: event.target.checked }))}
                className="accent-emerald-500"
              />
              Published
            </label>
            <label className={`inline-flex items-center gap-2 text-sm ${mutedClass}`}>
              <input
                type="checkbox"
                checked={editingProject.featured}
                onChange={(event) => setEditingProject((current) => ({ ...current, featured: event.target.checked }))}
                className="accent-emerald-500"
              />
              Featured
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveProject}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Project
            </button>
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/[0.05] text-black hover:bg-black/[0.08]'}`}
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className={`flex items-center gap-3 rounded-3xl border p-6 ${cardClass}`}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className={`text-sm ${mutedClass}`}>Loading research projects...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.length ? (
            projects.map((project) => (
              <article key={project.id} className={`rounded-3xl border p-6 ${cardClass}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${project.published ? 'bg-emerald-500/10 text-emerald-500' : isDark ? 'bg-white/10 text-white/50' : 'bg-black/10 text-black/50'}`}>
                        {project.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                      {project.featured ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                          <Star className="h-3.5 w-3.5" />
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {project.researcherName} ({project.institution})
                    </p>
                    <h2 className={`mt-2 text-xl font-semibold ${textClass}`}>{project.projectTitle}</h2>
                    <p className={`mt-2 text-sm ${mutedClass}`}>Platform: {project.platform}</p>
                    <p className={`mt-4 text-sm leading-7 ${mutedClass}`}>{project.summary}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProject(project)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/[0.05] text-black hover:bg-black/[0.08]'}`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProject(project.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className={`rounded-3xl border p-8 text-center ${cardClass}`}>
              <BookOpen className={`mx-auto h-8 w-8 ${mutedClass}`} />
              <h2 className={`mt-4 text-lg font-semibold ${textClass}`}>No saved research projects yet</h2>
              <p className={`mt-2 text-sm ${mutedClass}`}>
                Use the starter project or create a new one to populate the showcase.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
