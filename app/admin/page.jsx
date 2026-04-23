'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search, Bell, Sun, Moon, Calendar,
  TrendingUp, Users, DollarSign, Cpu, Wifi,
  UserPlus, Megaphone, Settings2, BarChart3, FileText,
  AlertTriangle, CheckCircle2, XCircle, Info, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { NOTIFICATIONS } from '@/lib/adminNotifications';

/* ─── Deterministic seeded random ───────────────────────────── */
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* ─── Build chart + metric data from a date range ───────────── */
function buildRangeData(startIso, endIso) {
  const start = new Date(startIso);
  const end   = new Date(endIso);
  const days  = Math.max(1, Math.round((end - start) / 86400000));

  // Seed from epoch days so the same range always gives the same numbers
  const rand = seededRand(Math.floor(start.getTime() / 86400000) + days * 7);

  // Scale baselines to the range length (reference = 30 days)
  const scale = days / 30;
  const BASE = {
    users:    Math.round(24000 * (0.7 + scale * 0.3)),
    requests: Math.round(140000 * (0.6 + scale * 0.4)),
    revenue:  Math.round(40000 * (0.65 + scale * 0.35)),
    cost:     Math.round(10000 * (0.6 + scale * 0.4)),
    active:   Math.round(900 + rand() * 300),
  };

  // Weekly chart points across the range
  const weekCount = Math.max(2, Math.ceil(days / 7));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const platformData = Array.from({ length: weekCount }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + Math.round((i / (weekCount - 1)) * days));
    const label = `${months[d.getMonth()]} ${d.getDate()}`;
    const frac = i / (weekCount - 1);
    const noise = () => 0.85 + rand() * 0.3;
    return {
      date:     label,
      requests: Math.round(BASE.requests * 0.4 * (1 + frac * 1.1) * noise()),
      users:    Math.round(BASE.users    * 0.3 * (1 + frac * 0.9) * noise()),
      revenue:  Math.round(BASE.revenue  * 0.25 * (1 + frac * 1.2) * noise()),
    };
  });

  // Stat card numbers
  const newUsers  = Math.round(BASE.users * 0.1 * (0.8 + rand() * 0.4));
  const newReq    = Math.round(BASE.requests * 0.15 * (0.8 + rand() * 0.4));
  const newRev    = Math.round(BASE.revenue * 0.2 * (0.8 + rand() * 0.4));
  const newCost   = Math.round(BASE.cost * 0.12 * (0.8 + rand() * 0.4));

  // Sparklines — 8 ascending-ish points seeded per range
  const spark = (base) => Array.from({ length: 8 }, (_, i) => {
    const frac = i / 7;
    return Math.round(base * (0.6 + frac * 0.8) * (0.85 + rand() * 0.3));
  });
  const bars = Array.from({ length: 12 }, () => Math.round(4 + rand() * 8));

  // Growth donut
  const returning = Math.round(BASE.users * (0.55 + rand() * 0.1));
  const inactive  = Math.round(BASE.users * (0.25 + rand() * 0.1));
  const growthSlices = [
    { name: 'New Users', value: newUsers,   color: '#3b82f6' },
    { name: 'Returning', value: returning,  color: '#8b5cf6' },
    { name: 'Inactive',  value: inactive,   color: '#d1d5db' },
  ];
  const activePct = Math.round((returning / (returning + inactive + newUsers)) * 100);

  return {
    platformData,
    stats: {
      users:    BASE.users.toLocaleString(),
      requests: BASE.requests.toLocaleString(),
      revenue:  `$${(BASE.revenue / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      cost:     `$${(BASE.cost / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      active:   BASE.active.toLocaleString(),
      newUsers: `+${newUsers.toLocaleString()}`,
      newReq:   `+${newReq.toLocaleString()}`,
      newRev:   `+$${Math.round(newRev / 100).toLocaleString()}`,
      newCost:  `+$${Math.round(newCost / 100).toLocaleString()}`,
    },
    sparks: {
      users:    spark(35),
      requests: spark(30),
      revenue:  spark(22),
      cost:     spark(18),
      active:   bars,
    },
    growthSlices,
    activePct,
  };
}

const aiFeatures = [
  { name: 'AI Chatbot',         pct: 29, color: 'bg-emerald-500' },
  { name: 'CV Builder',         pct: 20, color: 'bg-blue-500' },
  { name: 'Business Plans',     pct: 18, color: 'bg-purple-500' },
  { name: 'Legal Assistant',    pct: 16, color: 'bg-amber-500' },
  { name: 'Avatar Simulations', pct: 13, color: 'bg-red-400' },
  { name: 'Other Tools',        pct:  5, color: 'bg-gray-400' },
];

const recentUsers = [
  { name: 'Sarah M.',  email: 'sarah@example.com', plan: 'Pro Launch Plan',    joined: 'Nov 30, 2024', status: 'Active' },
  { name: 'David K.',  email: 'david@example.com', plan: 'Career Premium',     joined: 'Nov 29, 2024', status: 'Active' },
  { name: 'Aisha R.',  email: 'aisha@example.com', plan: 'Business Premium',   joined: 'Nov 28, 2024', status: 'Active' },
  { name: 'James L.',  email: 'james@example.com', plan: 'Legal Premium',      joined: 'Nov 27, 2024', status: 'Inactive' },
  { name: 'Maria G.',  email: 'maria@example.com', plan: 'Innovation Premium', joined: 'Nov 26, 2024', status: 'Active' },
];

const quickActions = [
  { label: 'Add New User',      icon: UserPlus,  href: '/admin/users',     bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
  { label: 'Send Announcement', icon: Megaphone, href: '/admin/content',   bg: 'bg-blue-500/10',    color: 'text-blue-500' },
  { label: 'Manage Features',   icon: Settings2, href: '/admin/features',  bg: 'bg-purple-500/10',  color: 'text-purple-500' },
  { label: 'View AI Usage',     icon: BarChart3, href: '/admin/ai-usage',  bg: 'bg-amber-500/10',   color: 'text-amber-500' },
  { label: 'Generate Report',   icon: FileText,  href: '/admin/analytics', bg: 'bg-red-500/10',     color: 'text-red-500' },
];

/* ─── Mini Sparkline ─────────────────────────────────────────── */
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MiniBar({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <BarChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} barSize={4}>
        <Bar dataKey="v" fill={color} radius={2} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, change, sub, icon: Icon, iconBg, iconColor, chart, chartColor, barChart }) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-2 ${
      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/50'}`}>{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />{change}
            </span>
            <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>{sub}</span>
          </div>
        </div>
        <div className="w-24 flex-shrink-0">
          {barChart
            ? <MiniBar data={chart} color={chartColor} />
            : <Sparkline data={chart} color={chartColor} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Alert icon helper ──────────────────────────────────────── */
function AlertIcon({ type }) {
  if (type === 'warning') return <div className="p-1.5 rounded-lg bg-amber-500/10"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>;
  if (type === 'error')   return <div className="p-1.5 rounded-lg bg-red-500/10"><XCircle className="w-4 h-4 text-red-500" /></div>;
  if (type === 'success') return <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>;
  return <div className="p-1.5 rounded-lg bg-blue-500/10"><Info className="w-4 h-4 text-blue-500" /></div>;
}

/* ─── Custom tooltip ─────────────────────────────────────────── */
function PlatformTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl p-3 text-xs shadow-xl border ${isDark ? 'bg-black border-white/10 text-white' : 'bg-white border-black/5 text-black'}`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [user, setUser]       = useState(null);

  // Date range
  const [dateRange, setDateRange]       = useState({ start: '2024-11-01', end: '2024-11-30' });
  const [tempRange, setTempRange]       = useState({ start: '2024-11-01', end: '2024-11-30' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Notifications dropdown
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = NOTIFICATIONS.length; // all unread on fresh load

  useEffect(() => {
    setUser(auth.currentUser);
    fetch('/api/admin/metrics')
      .then((r) => r.ok ? r.json() : null)
      .then(setMetrics)
      .catch(() => {});
  }, []);

  // Recompute all chart/stat data when date range changes
  const rangeData = useMemo(() => buildRangeData(dateRange.start, dateRange.end), [dateRange]);

  const fmtDate = (iso) => {
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[+m - 1]} ${+d}, ${y}`;
  };
  const dateLabel = `${fmtDate(dateRange.start)} – ${fmtDate(dateRange.end)}`;

  const { platformData, stats, sparks, growthSlices, activePct } = rangeData;

  const card     = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const text     = isDark ? 'text-white' : 'text-black';
  const muted    = isDark ? 'text-white/50' : 'text-black/50';
  const divider  = isDark ? 'divide-white/5' : 'divide-black/5';
  const rowHover = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]';
  const thead    = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className={`flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className={`text-2xl font-bold ${text}`}>Admin Dashboard</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>System Administrator</span>
          </div>
          <p className={`text-sm ${muted}`}>Manage users, monitor platform activity, and optimize AI services.</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
            <input
              placeholder="Search anything..."
              className={`pl-9 pr-4 py-2 rounded-xl text-sm border w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'
              }`}
            />
          </div>

          {/* ── Date range picker ── */}
          <div className="relative">
            <button
              onClick={() => { setTempRange(dateRange); setShowDatePicker(v => !v); setShowNotifs(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                showDatePicker
                  ? isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/10 border-black/20 text-black'
                  : isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white border-black/10 text-black/70'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{dateLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className={`absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border shadow-2xl p-4 space-y-4 ${
                  isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10'
                }`}>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                    Select Date Range
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs mb-1.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Start Date</label>
                      <input
                        type="date"
                        value={tempRange.start}
                        onChange={e => setTempRange(r => ({ ...r, start: e.target.value }))}
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>End Date</label>
                      <input
                        type="date"
                        value={tempRange.end}
                        onChange={e => setTempRange(r => ({ ...r, end: e.target.value }))}
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-black'
                        }`}
                      />
                    </div>
                  </div>
                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Last 7d',  start: (() => { const d = new Date(); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10); })(), end: new Date().toISOString().slice(0,10) },
                      { label: 'Last 30d', start: (() => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10); })(), end: new Date().toISOString().slice(0,10) },
                      { label: 'Last 90d', start: (() => { const d = new Date(); d.setDate(d.getDate()-90); return d.toISOString().slice(0,10); })(), end: new Date().toISOString().slice(0,10) },
                      { label: 'Nov 2024', start: '2024-11-01', end: '2024-11-30' },
                      { label: 'Q4 2024',  start: '2024-10-01', end: '2024-12-31' },
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={() => setTempRange({ start: p.start, end: p.end })}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          tempRange.start === p.start && tempRange.end === p.end
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isDark ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-black/10 text-black/50 hover:bg-black/[0.04]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                        isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/50 hover:bg-black/[0.04]'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setDateRange(tempRange); setShowDatePicker(false); }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Notifications bell → navigates to inbox ── */}
          <button
            onClick={() => router.push('/admin/notifications')}
            className={`relative p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-black/10 hover:bg-black/[0.04]'
            }`}
          >
            <Bell className={`w-4 h-4 ${muted}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
            {isDark ? <Sun className="w-4 h-4 text-white/70" /> : <Moon className="w-4 h-4 text-black/50" />}
          </button>

          {/* User chip */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">
              {(user?.displayName || user?.email || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <div className="text-xs leading-tight">
              <p className={`font-semibold ${text}`}>Admin</p>
              <p className={muted}>Super Admin</p>
            </div>
            <ChevronDown className={`w-3 h-3 ${muted}`} />
          </div>
        </div>
      </div>

      {/* ── Stat cards (reactive to date range) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users"   value={stats.users}    change="12.5%"  sub={`${stats.newUsers} this period`}  icon={Users}      iconBg="bg-emerald-500/10" iconColor="text-emerald-500" chart={sparks.users}    chartColor="#10b981" />
        <StatCard label="AI Requests"   value={stats.requests} change="18.7%"  sub={`${stats.newReq} this period`}   icon={TrendingUp} iconBg="bg-blue-500/10"    iconColor="text-blue-500"    chart={sparks.requests} chartColor="#3b82f6" />
        <StatCard label="Total Revenue" value={stats.revenue}  change="24.3%"  sub={`${stats.newRev} this period`}  icon={DollarSign} iconBg="bg-amber-500/10"   iconColor="text-amber-500"   chart={sparks.revenue}  chartColor="#f59e0b" />
        <StatCard label="AI Cost"       value={stats.cost}     change="9.3%"   sub={`${stats.newCost} this period`} icon={Cpu}        iconBg="bg-purple-500/10"  iconColor="text-purple-500"  chart={sparks.cost}     chartColor="#8b5cf6" />
        <StatCard label="Active Now"    value={stats.active}   change="5.2%"   sub="Users online"                   icon={Wifi}       iconBg="bg-red-500/10"     iconColor="text-red-400"     chart={sparks.active}   chartColor="#f87171" barChart />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Platform activity — data driven by date range */}
        <div className={`lg:col-span-7 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${text}`}>Platform Activity Overview</h2>
              <div className="flex items-center gap-4 mt-1">
                {[['AI Requests','#10b981'],['Users','#3b82f6'],['Revenue (USD)','#f59e0b']].map(([l, c]) => (
                  <span key={l} className={`flex items-center gap-1 text-xs ${muted}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg border ${isDark ? 'border-white/10 text-white/50' : 'border-black/10 text-black/50'}`}>
              {dateLabel}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={platformData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {[['rg','#10b981'],['rb','#3b82f6'],['ry','#f59e0b']].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<PlatformTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} fill="url(#rg)" dot={false} />
              <Area type="monotone" dataKey="users"    stroke="#3b82f6" strokeWidth={2} fill="url(#rb)" dot={false} />
              <Area type="monotone" dataKey="revenue"  stroke="#f59e0b" strokeWidth={2} fill="url(#ry)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User growth donut */}
        <div className={`lg:col-span-3 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`font-semibold ${text}`}>User Growth</h2>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={growthSlices} cx="50%" cy="50%" innerRadius={52} outerRadius={72} strokeWidth={0} dataKey="value" isAnimationActive={false}>
                    {growthSlices.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${text}`}>{activePct}%</span>
                <span className={`text-xs ${muted}`}>Active</span>
              </div>
            </div>
            <div className="text-center mb-3">
              <p className={`text-2xl font-bold ${text}`}>{growthSlices[0].value.toLocaleString()}</p>
              <p className={`text-xs ${muted}`}>New users</p>
            </div>
            <div className="w-full space-y-1.5">
              {growthSlices.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 ${muted}`}>
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className={`font-medium ${text}`}>{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={`lg:col-span-2 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={a.href}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-sm font-medium ${
                    isDark ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/60 hover:text-black'
                  }`}>
                  <div className={`p-1.5 rounded-lg ${a.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${a.color}`} />
                  </div>
                  {a.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">

        {/* Recent users */}
        <div className={`lg:col-span-6 rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <h2 className={`font-semibold ${text}`}>Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-emerald-500 font-medium hover:text-emerald-400">View All</Link>
          </div>
          <table className={`w-full text-sm divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['User','Plan','Joined','Status'].map(h => (
                  <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {recentUsers.map((u) => (
                <tr key={u.email} className={`transition-colors ${rowHover}`}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500">
                        {u.name.slice(0, 1)}
                      </div>
                      <div>
                        <p className={`font-medium text-xs ${text}`}>{u.name}</p>
                        <p className={`text-xs ${muted}`}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{u.plan}</td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{u.joined}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : isDark ? 'bg-white/10 text-white/40' : 'bg-black/10 text-black/40'
                    }`}>{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI usage by feature */}
        <div className={`lg:col-span-3 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${text}`}>AI Usage by Feature</h2>
            <Link href="/admin/ai-usage" className="text-xs text-emerald-500 font-medium hover:text-emerald-400">View All</Link>
          </div>
          <div className="space-y-3">
            {aiFeatures.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${text}`}>{f.name}</span>
                  <span className={`text-xs ${muted}`}>{f.pct}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className={`h-1.5 rounded-full ${f.color}`} style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts — links to notifications inbox */}
        <div className={`lg:col-span-3 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${text}`}>Recent Alerts</h2>
            <Link href="/admin/notifications" className="text-xs text-emerald-500 font-medium hover:text-emerald-400">View Inbox</Link>
          </div>
          <div className="space-y-3">
            {NOTIFICATIONS.map((a) => (
              <Link
                key={a.id}
                href="/admin/notifications"
                className={`flex items-start gap-2.5 rounded-xl p-1 -mx-1 transition-colors ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-black/[0.03]'
                }`}
              >
                <AlertIcon type={a.type} />
                <div>
                  <p className={`text-xs font-medium leading-tight ${text}`}>{a.msg}</p>
                  <p className={`text-xs mt-0.5 ${muted}`}>{a.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
