'use client';

import { useEffect, useState } from 'react';
import { Settings2, Zap, Cpu, Layers, ShieldAlert, Globe, Calendar, FileText, BarChart2, Bot, Languages } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const ICON_MAP = {
  'legal-ai':             Cpu,
  'immigration-assistant': Globe,
  'document-upload':      FileText,
  'judicial-prediction':  BarChart2,
  'collaboration':        Zap,
  'analytics':            Layers,
  'export-formats':       ShieldAlert,
  'ai-avatar':            Bot,
  'calendar-deadlines':   Calendar,
  'multi-language':       Languages,
};
const getIcon = (id) => ICON_MAP[id] || Settings2;

export default function AdminFeaturesPage() {
  const { isDark } = useTheme();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch('/api/admin/features')
      .then((r) => r.ok ? r.json() : Promise.reject('Failed to load feature flags'))
      .then((d) => setFeatures(d.features || []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const toggleFeature = (id) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setDirty(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Feature Flags</h1>
          <p className={`mt-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Manage global feature rollouts and tier-based access.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            dirty
              ? isDark
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : isDark
                ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                : 'bg-black/5 text-black/30 border-black/10 cursor-not-allowed'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          {saving ? 'Saving…' : 'Apply Changes'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
        </div>
      )}

      {error && (
        <div className={`rounded-xl p-4 text-sm mb-6 border ${
          isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}

      {!loading && !error && features.length === 0 && (
        <p className={`text-sm ${isDark ? 'text-white/30' : 'text-black/30'}`}>No feature flags configured yet.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = getIcon(feature.id);
          return (
            <div
              key={feature.id}
              className={`rounded-2xl p-6 border transition-colors ${
                isDark
                  ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                  : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    feature.enabled
                      ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      : isDark ? 'bg-white/5 text-white/30' : 'bg-black/5 text-black/30'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                      {feature.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${
                      isDark ? 'bg-white/5 text-white/40 border-white/10' : 'bg-black/5 text-black/40 border-black/10'
                    }`}>
                      Tier: {feature.tier || 'All'}
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={feature.enabled}
                  onClick={() => toggleFeature(feature.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    feature.enabled
                      ? 'bg-emerald-500'
                      : isDark ? 'bg-white/20' : 'bg-black/20'
                  } ${isDark ? 'focus:ring-offset-black' : 'focus:ring-offset-white'}`}
                >
                  <span className="sr-only">Toggle {feature.name}</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      feature.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
