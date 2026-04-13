'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, TrendingUp, MousePointerClick, Clock,
  Globe, Repeat2, ChevronDown, Download, RefreshCw,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/* ── Static illustrative data (no event-tracking source) ───── */
const deviceData = [
  { name: 'Desktop', value: 58, color: '#10b981' },
  { name: 'Mobile',  value: 33, color: '#3b82f6' },
  { name: 'Tablet',  value: 9,  color: '#8b5cf6' },
];
const geoData = [
  { country: 'United States', pct: 40 },
  { country: 'United Kingdom', pct: 15 },
  { country: 'Canada',         pct: 10 },
  { country: 'Australia',      pct: 8  },
  { country: 'Germany',        pct: 6  },
  { country: 'Other',          pct: 21 },
];
const retentionRows = [
  { cohort: 'Jan 2026', size: '—', w1: '—', w2: '—', w4: '—', w8: '—' },
  { cohort: 'Feb 2026', size: '—', w1: '—', w2: '—', w4: '—', w8: '—' },
  { cohort: 'Mar 2026', size: '—', w1: '—', w2: '—', w4: '—', w8: '—' },
];
const topPages = [
  { page: '/dashboard',       views: '—', bounce: '—', avg: '—' },
  { page: '/dashboard/chat',  views: '—', bounce: '—', avg: '—' },
  { page: '/dashboard/career',views: '—', bounce: '—', avg: '—' },
];

/* ── Helpers ────────────────────────────────────────────────── */
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getMonthKey(isoString) {
  const d = new Date(isoString);
  return isNaN(d) ? null : `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildGrowthData(users) {
  const byMonth = {};
  users.forEach(({ createdAt }) => {
    const key = getMonthKey(createdAt);
    if (!key) return;
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  // Sort chronologically (last 7 months)
  const sorted = Object.entries(byMonth)
    .map(([month, newUsers]) => ({ month, newUsers }))
    .sort((a, b) => new Date(`1 ${a.month}`) - new Date(`1 ${b.month}`))
    .slice(-7);
  return sorted;
}

/* ── Chart tooltip ─────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl p-3 text-xs shadow-xl border ${
      isDark ? 'bg-black border-white/10 text-white' : 'bg-white border-black/5 text-black'
    }`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.fill }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium">{p.value?.toLocaleString?.() ?? p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, live }) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/50'}`}>{label}</span>
        {live && (
          <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">LIVE</span>
        )}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-black/30'}`}>{sub}</p>}
    </div>
  );
}

/* ── Illustrative badge ─────────────────────────────────────── */
function IllustrativeBadge({ muted }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${muted} border-current opacity-50`}>
      illustrative
    </span>
  );
}

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [loading,    setLoading]    = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [growthData, setGrowthData] = useState([]);
  const [newLast30,  setNewLast30]  = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTotalUsers(users.length);

      // New in last 30 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const recent = users.filter((u) => u.createdAt && new Date(u.createdAt) >= cutoff);
      setNewLast30(recent.length);

      setGrowthData(buildGrowthData(users));
    } catch (err) {
      console.error('[Analytics] Firestore error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const card     = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const text     = isDark ? 'text-white' : 'text-black';
  const muted    = isDark ? 'text-white/50' : 'text-black/50';
  const divider  = isDark ? 'divide-white/5' : 'divide-black/5';
  const rowHover = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]';
  const thead    = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>Analytics</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>
              User metrics from Firestore. Charts marked <span className="opacity-50 font-medium">illustrative</span> require an analytics integration (e.g. GA4).
            </p>
          </div>
          <button onClick={fetchUsers}
            className={`p-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"      value={loading ? '—' : totalUsers.toLocaleString()} sub="registered accounts"  icon={Users}             iconBg="bg-emerald-500/10" iconColor="text-emerald-500" live />
        <StatCard label="New (last 30d)"   value={loading ? '—' : newLast30.toLocaleString()}  sub="new sign-ups"         icon={TrendingUp}        iconBg="bg-blue-500/10"    iconColor="text-blue-500"    live />
        <StatCard label="Avg Session"      value="—"                                            sub="requires analytics"   icon={Clock}             iconBg="bg-amber-500/10"   iconColor="text-amber-500" />
        <StatCard label="30-day Retention" value="—"                                            sub="requires analytics"   icon={Repeat2}           iconBg="bg-purple-500/10"  iconColor="text-purple-500" />
      </div>

      {/* ── Charts row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* User signups per month — LIVE */}
        <div className={`lg:col-span-8 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-semibold ${text}`}>Monthly Sign-ups</h2>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">LIVE</span>
              </div>
              <p className={`text-xs mt-0.5 ${muted}`}>New user registrations by month</p>
            </div>
          </div>
          {loading ? (
            <div className={`h-[220px] flex items-center justify-center text-sm ${muted}`}>Loading…</div>
          ) : growthData.length === 0 ? (
            <div className={`h-[220px] flex items-center justify-center text-sm ${muted}`}>No user data found.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
                <YAxis                 tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Area type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} fill="url(#ag)" dot={false} name="Sign-ups" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Device breakdown — illustrative */}
        <div className={`lg:col-span-4 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className={`font-semibold ${text}`}>Device Breakdown</h2>
            <IllustrativeBadge muted={muted} />
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} strokeWidth={0} dataKey="value" isAnimationActive={false}>
                  {deviceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-3 mt-2">
              {deviceData.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`flex items-center gap-1.5 text-xs ${muted}`}>
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}
                    </span>
                    <span className={`text-xs font-medium ${text}`}>{d.value}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                    <div className="h-1.5 rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Geography — illustrative */}
        <div className={`lg:col-span-4 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className={`w-4 h-4 ${muted}`} />
            <h2 className={`font-semibold ${text}`}>Geography</h2>
            <IllustrativeBadge muted={muted} />
          </div>
          <div className="space-y-3">
            {geoData.map((g) => (
              <div key={g.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${text}`}>{g.country}</span>
                  <span className={`text-xs ${muted}`}>{g.pct}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className="h-1.5 rounded-full bg-blue-500 opacity-40" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention — illustrative */}
        <div className={`lg:col-span-8 rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <h2 className={`font-semibold ${text}`}>Cohort Retention</h2>
            <IllustrativeBadge muted={muted} />
          </div>
          <table className={`w-full text-xs divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['Cohort', 'Size', 'Wk 1', 'Wk 2', 'Wk 4', 'Wk 8'].map((h) => (
                  <th key={h} className={`py-3 px-4 text-left font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {retentionRows.map((r) => (
                <tr key={r.cohort} className={`transition-colors ${rowHover}`}>
                  <td className={`py-3 px-4 font-medium ${text}`}>{r.cohort}</td>
                  {[r.size, r.w1, r.w2, r.w4, r.w8].map((v, i) => (
                    <td key={i} className={`py-3 px-4 ${muted}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`px-5 py-3 ${isDark ? 'border-t border-white/10' : 'border-t border-black/5'}`}>
            <p className={`text-xs ${muted}`}>Requires event tracking integration to populate.</p>
          </div>
        </div>
      </div>

      {/* ── Top pages — illustrative ─────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
          <h2 className={`font-semibold ${text}`}>Top Pages</h2>
          <IllustrativeBadge muted={muted} />
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['Page', 'Views', 'Bounce Rate', 'Avg Time'].map((h) => (
                  <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {topPages.map((p, i) => (
                <tr key={i} className={`transition-colors ${rowHover}`}>
                  <td className={`py-3 px-5 text-xs font-mono font-medium ${text}`}>{p.page}</td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{p.views}</td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{p.bounce}</td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{p.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`px-5 py-3 ${isDark ? 'border-t border-white/10' : 'border-t border-black/5'}`}>
          <p className={`text-xs ${muted}`}>Connect Google Analytics or Mixpanel to populate page-level metrics.</p>
        </div>
      </div>
    </div>
  );
}
