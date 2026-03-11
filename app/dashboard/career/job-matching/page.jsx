'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Briefcase, ExternalLink, Loader2, MapPin, RotateCcw, ThumbsDown, ThumbsUp, Upload, X } from 'lucide-react';
import { extractResumeText } from '@/services/openaiService';
import { useTheme } from '@/components/providers/ThemeProvider';

const SWIPE_X_THRESHOLD = 120;

function SwipeCard({ job, onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-10, 0, 10]);
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_X_THRESHOLD) onSwipeRight(job);
        else if (info.offset.x < -SWIPE_X_THRESHOLD) onSwipeLeft(job);
      }}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="relative h-full w-full rounded-3xl border border-gray-800 bg-gray-900/80 shadow-2xl overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{job.title}</h2>
              <p className="text-gray-300 mt-1">{job.company}</p>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              Score {job.score}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(job.tags || []).slice(0, 8).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-white/5 border border-gray-800 text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-gray-300 mt-4 leading-relaxed line-clamp-4">{job.description}</p>

          <div className="mt-4 space-y-2">
            {(job.reasons || []).slice(0, 2).map((r, idx) => (
              <div key={idx} className="text-sm text-gray-400">
                • {r}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 flex items-center justify-between">
            <div className="text-xs text-gray-500">Swipe left to skip • swipe right to apply</div>
            <div className="text-xs text-gray-500">{job.workType}</div>
          </div>
        </div>

        <motion.div
          className="absolute top-6 left-6 rotate-[-18deg] px-4 py-2 rounded-xl border-2 border-red-400 text-red-300 font-extrabold text-xl"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>
        <motion.div
          className="absolute top-6 right-6 rotate-[18deg] px-4 py-2 rounded-xl border-2 border-emerald-400 text-emerald-300 font-extrabold text-xl"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function JobMatchingPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [skillsText, setSkillsText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [workType, setWorkType] = useState('Any');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [swipePopupOpen, setSwipePopupOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const visible = useMemo(() => matches.slice(index, index + 3), [matches, index]);
  const topJob = matches[index];

  const busyRef = useRef(false);

  const onFindJobs = async (e) => {
    e.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError(null);
    setMatches([]);
    setIndex(0);

    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillsText, resumeText, workType, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch matches.');
      setMatches(Array.isArray(data?.matches) ? data.matches : []);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  };

  const onResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setError(null);
    try {
      const text = await extractResumeText(file);
      setResumeText(text || '');
    } catch (err) {
      setError(err?.message || 'Failed to read resume file.');
      setResumeText('');
    }
  };

  const swipeLeft = () => setIndex((i) => Math.min(matches.length, i + 1));
  const swipeRight = (job) => {
    if (job?.applyUrl) {
      window.location.href = job.applyUrl;
      return;
    }
    swipeLeft();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Job Matching
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Add your skills + resume, find jobs, then click Apply to jobs to swipe through matches in a popup.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/career')}
          className={`px-4 py-2 rounded-xl border transition-all ${isDark
            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}
        >
          Back
        </button>
      </div>

      <div className={`rounded-3xl border p-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
        <form onSubmit={onFindJobs} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Skills
            </label>
            <textarea
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. React, TypeScript, Next.js, Firebase, SQL, Excel..."
              className={`w-full rounded-2xl px-4 py-3 min-h-[120px] outline-none border ${isDark
                ? 'bg-black/40 border-gray-800 text-white placeholder-gray-500 focus:border-emerald-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                }`}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Resume (optional)
              </label>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? 'border-gray-800 bg-black/40' : 'border-gray-200 bg-white'}`}>
                <Upload className={`${isDark ? 'text-gray-300' : 'text-gray-700'} w-5 h-5`} />
                <input type="file" accept=".txt,.pdf" onChange={onResumeChange} className="w-full text-sm" />
              </div>
              {resumeFile && (
                <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loaded: {resumeFile.name} ({resumeText ? `${resumeText.length.toLocaleString()} chars` : '0 chars'})
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Work Type
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className={`w-full rounded-2xl px-4 py-3 outline-none border ${isDark
                    ? 'bg-black/40 border-gray-800 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                    }`}
                >
                  <option value="Any">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location (optional)
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Toronto, Remote, Montreal"
                  className={`w-full rounded-2xl px-4 py-3 outline-none border ${isDark
                    ? 'bg-black/40 border-gray-800 text-white placeholder-gray-500 focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                    }`}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3 font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finding matches...
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  Find Jobs
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Job results list */}
      <div className={`rounded-3xl border p-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Matches</h2>
          {matches.length > 0 && (
            <button
              type="button"
              onClick={() => { setSwipePopupOpen(true); setIndex(0); }}
              className="rounded-2xl py-2.5 px-5 font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              Apply to jobs
            </button>
          )}
        </div>

        {matches.length === 0 ? (
          <div className={`mt-6 rounded-2xl border flex items-center justify-center text-center p-12 ${isDark ? 'border-gray-800 bg-black/20 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
            Run a search above to see job matches. Then click &quot;Apply to jobs&quot; to swipe through them in a popup.
          </div>
        ) : (
          <ul className="mt-6 space-y-4 max-h-[480px] overflow-y-auto">
            {matches.map((job) => (
              <li
                key={job.id}
                className={`rounded-2xl border p-4 ${isDark ? 'bg-black/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{job.company}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{job.location}</span>
                      <span>·</span>
                      <span>{job.workType}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(job.tags || []).slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-shrink-0 rounded-xl py-2 px-3 text-sm font-medium border flex items-center gap-1.5 ${isDark ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Apply
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Swipe popup - shown only when user clicks Apply to jobs */}
      {swipePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSwipePopupOpen(false)}>
          <div className="bg-gray-900 rounded-3xl border border-gray-800 w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Swipe to apply</h3>
              <button
                type="button"
                onClick={() => setSwipePopupOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative w-full h-[420px]">
                {visible.length === 0 ? (
                  <div className="h-full rounded-2xl border border-gray-800 bg-black/30 flex items-center justify-center text-center p-6 text-gray-400">
                    {matches.length === 0 ? 'No jobs to swipe.' : 'No more jobs. Close or restart the stack.'}
                  </div>
                ) : (
                  visible
                    .map((job) => (
                      <SwipeCard
                        key={job.id}
                        job={job}
                        onSwipeLeft={() => swipeLeft()}
                        onSwipeRight={(j) => swipeRight(j)}
                      />
                    ))
                    .reverse()
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => swipeLeft()}
                  disabled={!topJob}
                  className="flex-1 rounded-2xl py-3 font-bold border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-5 h-5" />
                  Pass
                </button>
                <button
                  type="button"
                  onClick={() => swipeRight(topJob)}
                  disabled={!topJob}
                  className="flex-1 rounded-2xl py-3 font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Apply
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIndex(0)}
                  disabled={matches.length === 0}
                  className="flex-1 rounded-2xl py-2.5 font-semibold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart stack
                </button>
                <button
                  type="button"
                  onClick={() => setSwipePopupOpen(false)}
                  className="rounded-2xl py-2.5 px-4 font-semibold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

