'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Cpu, TrendingUp, DollarSign, Hash,
  Zap, RefreshCw,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

/* ── Chart data per range ───────────────────────────────────── */
const CHART_DATA = {
  '7d': [
    { label: 'Apr 23', requests:  9800, costCents:  5290, tokens:  392000 },
    { label: 'Apr 24', requests: 10600, costCents:  5720, tokens:  424000 },
    { label: 'Apr 25', requests: 11200, costCents:  6050, tokens:  448000 },
    { label: 'Apr 26', requests: 11800, costCents:  6370, tokens:  472000 },
    { label: 'Apr 27', requests: 12600, costCents:  6810, tokens:  504000 },
    { label: 'Apr 28', requests: 12900, costCents:  6970, tokens:  516000 },
    { label: 'Apr 29', requests: 13100, costCents:  7080, tokens:  524000 },
  ],
  '30d': [
    { label: 'Apr 1',  requests:  3200, costCents:  1840, tokens:  128000 },
    { label: 'Apr 3',  requests:  4100, costCents:  2210, tokens:  164000 },
    { label: 'Apr 5',  requests:  3800, costCents:  2050, tokens:  152000 },
    { label: 'Apr 7',  requests:  5200, costCents:  2800, tokens:  208000 },
    { label: 'Apr 9',  requests:  6100, costCents:  3290, tokens:  244000 },
    { label: 'Apr 11', requests:  5700, costCents:  3080, tokens:  228000 },
    { label: 'Apr 13', requests:  7300, costCents:  3940, tokens:  292000 },
    { label: 'Apr 15', requests:  8200, costCents:  4430, tokens:  328000 },
    { label: 'Apr 17', requests:  7600, costCents:  4110, tokens:  304000 },
    { label: 'Apr 19', requests:  9100, costCents:  4910, tokens:  364000 },
    { label: 'Apr 21', requests: 10400, costCents:  5620, tokens:  416000 },
    { label: 'Apr 23', requests:  9800, costCents:  5290, tokens:  392000 },
    { label: 'Apr 25', requests: 11200, costCents:  6050, tokens:  448000 },
    { label: 'Apr 27', requests: 12600, costCents:  6810, tokens:  504000 },
    { label: 'Apr 29', requests: 13100, costCents:  7080, tokens:  524000 },
  ],
  '90d': [
    { label: 'Jan 29', requests:  38000, costCents:  20520, tokens: 1520000 },
    { label: 'Feb 5',  requests:  44000, costCents:  23760, tokens: 1760000 },
    { label: 'Feb 12', requests:  52000, costCents:  28080, tokens: 2080000 },
    { label: 'Feb 19', requests:  58000, costCents:  31320, tokens: 2320000 },
    { label: 'Feb 26', requests:  67000, costCents:  36180, tokens: 2680000 },
    { label: 'Mar 5',  requests:  74000, costCents:  39960, tokens: 2960000 },
    { label: 'Mar 12', requests:  84000, costCents:  45360, tokens: 3360000 },
    { label: 'Mar 19', requests:  91000, costCents:  49140, tokens: 3640000 },
    { label: 'Mar 26', requests: 102000, costCents:  55080, tokens: 4080000 },
    { label: 'Apr 2',  requests: 118000, costCents:  63720, tokens: 4720000 },
    { label: 'Apr 9',  requests: 134000, costCents:  72360, tokens: 5360000 },
    { label: 'Apr 16', requests: 148000, costCents:  79920, tokens: 5920000 },
    { label: 'Apr 23', requests: 162000, costCents:  87480, tokens: 6480000 },
  ],
  '365d': [
    { label: 'May',  requests:  48000, costCents:  25920, tokens:  1920000 },
    { label: 'Jun',  requests:  54000, costCents:  29160, tokens:  2160000 },
    { label: 'Jul',  requests:  61000, costCents:  32940, tokens:  2440000 },
    { label: 'Aug',  requests:  69000, costCents:  37260, tokens:  2760000 },
    { label: 'Sep',  requests:  78000, costCents:  42120, tokens:  3120000 },
    { label: 'Oct',  requests:  89000, costCents:  48060, tokens:  3560000 },
    { label: 'Nov',  requests: 102000, costCents:  55080, tokens:  4080000 },
    { label: 'Dec',  requests: 115000, costCents:  62100, tokens:  4600000 },
    { label: 'Jan',  requests: 131000, costCents:  70740, tokens:  5240000 },
    { label: 'Feb',  requests: 148000, costCents:  79920, tokens:  5920000 },
    { label: 'Mar',  requests: 167000, costCents:  90180, tokens:  6680000 },
    { label: 'Apr',  requests: 188000, costCents: 101520, tokens:  7520000 },
  ],
};

/* ── Stats and trend copy per range ─────────────────────────── */
const RANGE_STATS = {
  '7d':   { requests:   82000, costCents:   44270, tokensIn:  1640000, tokensOut:   820000,
            trends: { req: '6.2%',  cost: '4.1%',  tokIn: '5.8%',  tokOut: '3.9%'  } },
  '30d':  { requests:  153800, costCents:   83052, tokensIn:  3240000, tokensOut:  1524000,
            trends: { req: '18.7%', cost: '9.3%',  tokIn: '14.2%', tokOut: '11.8%' } },
  '90d':  { requests: 1172000, costCents:  632520, tokensIn: 23440000, tokensOut: 11720000,
            trends: { req: '31.4%', cost: '28.7%', tokIn: '29.3%', tokOut: '27.1%' } },
  '365d': { requests: 1250000, costCents:  675060, tokensIn: 25000000, tokensOut: 12500000,
            trends: { req: '47.2%', cost: '42.8%', tokIn: '43.9%', tokOut: '41.3%' } },
};

/* ── Base assistant split (30d baseline) ────────────────────── */
const BASE_ASSISTANTS = [
  { assistant: 'AI Chatbot',         requests: 44200, costCents: 23870, tokens: 1768000 },
  { assistant: 'CV Builder',         requests: 30500, costCents: 16470, tokens: 1220000 },
  { assistant: 'Business Plans',     requests: 27400, costCents: 14800, tokens: 1096000 },
  { assistant: 'Legal Assistant',    requests: 24300, costCents: 13120, tokens:  972000 },
  { assistant: 'Avatar Simulations', requests: 19800, costCents: 10690, tokens:  792000 },
  { assistant: 'Other Tools',        requests:  7600, costCents:  4110, tokens:  304000 },
];
const BASE_TOTAL = BASE_ASSISTANTS.reduce((s, a) => s + a.requests, 0); // 153800

const assistantColors = {
  'AI Chatbot':         '#10b981',
  'CV Builder':         '#3b82f6',
  'Business Plans':     '#8b5cf6',
  'Legal Assistant':    '#f59e0b',
  'Avatar Simulations': '#ef4444',
  'Other Tools':        '#6b7280',
};

/* ── Custom tooltip ────────────────────────────────────────── */
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
          <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, trend }) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/50'}`}>{label}</span>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
          <TrendingUp className="w-3 h-3" />{trend}
        </span>
        <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>{sub}</span>
      </div>
    </div>
  );
}

export default function AIUsagePage() {
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState('30d');

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setMetrics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* Derive everything from the selected range */
  const trendData = CHART_DATA[range];
  const stats     = RANGE_STATS[range];

  const totalReq    = metrics?.totals?.requests  ?? stats.requests;
  const totalCost   = metrics?.totals?.costCents ?? stats.costCents;
  const totalTokIn  = metrics?.totals?.tokensIn  ?? stats.tokensIn;
  const totalTokOut = metrics?.totals?.tokensOut ?? stats.tokensOut;

  /* Scale assistant breakdown proportionally to current range totals */
  const scaleFactor = totalReq / BASE_TOTAL;
  const assistants = useMemo(() => {
    const factor = stats.requests / BASE_TOTAL;
    return BASE_ASSISTANTS.map((a) => ({
      ...a,
      requests:  Math.round(a.requests  * factor),
      costCents: Math.round(a.costCents * factor),
      tokens:    Math.round(a.tokens    * factor),
    }));
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Scale model token counts proportionally */
  const modelUsage = useMemo(() => {
    const totalTok = totalTokIn + totalTokOut;
    return [
      { model: 'gpt-4o',            pct: 52, tokens: Math.round(totalTok * 0.52) },
      { model: 'gpt-4o-mini',       pct: 26, tokens: Math.round(totalTok * 0.26) },
      { model: 'claude-3-5-sonnet', pct: 16, tokens: Math.round(totalTok * 0.16) },
      { model: 'gemini-1.5-pro',    pct:  6, tokens: Math.round(totalTok * 0.06) },
    ];
  }, [totalTokIn, totalTokOut]);

  const maxReq = Math.max(...assistants.map((a) => a.requests));

  const card     = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const text     = isDark ? 'text-white' : 'text-black';
  const muted    = isDark ? 'text-white/50' : 'text-black/50';
  const divider  = isDark ? 'divide-white/5' : 'divide-black/5';
  const rowHover = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]';
  const thead    = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';

  const refresh = () => {
    setLoading(true);
    fetch('/api/admin/metrics')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setMetrics(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>AI Usage</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>Monitor AI request volume, token consumption, and cost breakdown.</p>
          </div>
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d', '365d'].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  range === r
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'
                }`}>{r}</button>
            ))}
            <button onClick={refresh}
              className={`p-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'}`}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={totalReq.toLocaleString()}
          trend={stats.trends.req}  sub="vs last period" icon={Hash}       iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatCard label="Total Cost"     value={`$${(totalCost / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend={stats.trends.cost} sub="vs last period" icon={DollarSign} iconBg="bg-amber-500/10"   iconColor="text-amber-500" />
        <StatCard label="Tokens In"      value={totalTokIn >= 1e6 ? `${(totalTokIn / 1e6).toFixed(1)}M` : `${(totalTokIn / 1000).toFixed(0)}K`}
          trend={stats.trends.tokIn}  sub="prompt tokens"      icon={Zap} iconBg="bg-blue-500/10"   iconColor="text-blue-500" />
        <StatCard label="Tokens Out"     value={totalTokOut >= 1e6 ? `${(totalTokOut / 1e6).toFixed(1)}M` : `${(totalTokOut / 1000).toFixed(0)}K`}
          trend={stats.trends.tokOut} sub="completion tokens"  icon={Cpu} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Request trend area chart */}
        <div className={`lg:col-span-8 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${text}`}>Request Volume Over Time</h2>
              <div className="flex items-center gap-4 mt-1">
                {[['Requests', '#10b981'], ['Cost (¢)', '#f59e0b']].map(([l, c]) => (
                  <span key={l} className={`flex items-center gap-1 text-xs ${muted}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg border ${isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'}`}>
              Last {range}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {[['ag', '#10b981'], ['ay', '#f59e0b']].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<ChartTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="requests"  stroke="#10b981" strokeWidth={2} fill="url(#ag)" dot={false} />
              <Area type="monotone" dataKey="costCents" stroke="#f59e0b" strokeWidth={2} fill="url(#ay)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model usage */}
        <div className={`lg:col-span-4 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Model Distribution</h2>
          <div className="space-y-4">
            {modelUsage.map((m) => (
              <div key={m.model}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-medium font-mono ${text}`}>{m.model}</span>
                  <span className={`text-xs ${muted}`}>
                    {m.tokens >= 1e6 ? `${(m.tokens / 1e6).toFixed(1)}M` : `${(m.tokens / 1000).toFixed(0)}K`} tok · {m.pct}%
                  </span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-6 pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <p className={`text-xs ${muted}`}>Total tokens processed</p>
            <p className={`text-xl font-bold mt-1 ${text}`}>
              {((totalTokIn + totalTokOut) / 1e6).toFixed(1)}M
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">↑ {stats.trends.tokIn} vs last period</p>
          </div>
        </div>
      </div>

      {/* ── By-assistant bar chart + table ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Bar chart */}
        <div className={`lg:col-span-5 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Requests by Assistant</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assistants} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="assistant" tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTooltip isDark={isDark} />} />
              <Bar dataKey="requests" radius={4}>
                {assistants.map((a, i) => (
                  <Cell key={i} fill={assistantColors[a.assistant] ?? '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className={`lg:col-span-7 rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <h2 className={`font-semibold ${text}`}>Detailed Breakdown</h2>
            <span className={`text-xs ${muted}`}>Last {range}</span>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm divide-y ${divider}`}>
              <thead className={thead}>
                <tr>
                  {['Assistant', 'Requests', 'Tokens', 'Cost', 'Avg Cost/Req'].map((h) => (
                    <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {assistants.map((a, i) => {
                  const avgCost = a.requests ? (a.costCents / a.requests / 100) : 0;
                  const pct = Math.round((a.requests / maxReq) * 100);
                  return (
                    <tr key={i} className={`transition-colors ${rowHover}`}>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: assistantColors[a.assistant] ?? '#10b981' }} />
                          <span className={`text-xs font-medium ${text}`}>{a.assistant}</span>
                        </div>
                        <div className={`mt-1.5 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                          <div className="h-1 rounded-full bg-emerald-500/60" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className={`py-3 px-5 text-xs font-medium ${text}`}>{a.requests.toLocaleString()}</td>
                      <td className={`py-3 px-5 text-xs ${muted}`}>
                        {a.tokens >= 1e6 ? `${(a.tokens / 1e6).toFixed(1)}M` : `${((a.tokens ?? 0) / 1000).toFixed(0)}K`}
                      </td>
                      <td className={`py-3 px-5 text-xs font-medium ${text}`}>${(a.costCents / 100).toFixed(2)}</td>
                      <td className={`py-3 px-5 text-xs ${muted}`}>${avgCost.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
