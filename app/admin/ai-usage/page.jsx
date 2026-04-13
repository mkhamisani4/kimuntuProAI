'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Cpu, TrendingUp, DollarSign, Hash, Zap, RefreshCw,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const ASSISTANT_COLORS = {
  'AI Chatbot':         '#10b981',
  'CV Builder':         '#3b82f6',
  'Business Plans':     '#8b5cf6',
  'Legal Assistant':    '#f59e0b',
  'Avatar Simulations': '#ef4444',
  'Other Tools':        '#6b7280',
};
const getColor = (name) => ASSISTANT_COLORS[name] ?? '#10b981';

/* ── Custom tooltip ─────────────────────────────────────────── */
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
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
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
      {sub && <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-black/30'}`}>{sub}</p>}
    </div>
  );
}

/* ── Empty / loading states ─────────────────────────────────── */
function Placeholder({ loading, text, height = 220, muted }) {
  return (
    <div className={`flex items-center justify-center text-sm ${muted}`} style={{ height }}>
      {loading ? 'Loading…' : text}
    </div>
  );
}

export default function AIUsagePage() {
  const { isDark } = useTheme();
  const [range,      setRange]      = useState('30d');
  const [loading,    setLoading]    = useState(true);
  const [totals,     setTotals]     = useState({ requests: 0, costCents: 0, tokensIn: 0, tokensOut: 0 });
  const [assistants, setAssistants] = useState([]);
  const [models,     setModels]     = useState([]);
  const [trend,      setTrend]      = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date();
      if (range === '7d')  since.setDate(since.getDate() - 7);
      else if (range === '30d') since.setDate(since.getDate() - 30);
      else since.setDate(since.getDate() - 90);

      const q = query(
        collection(db, 'usage_logs'),
        where('createdAt', '>=', Timestamp.fromDate(since)),
        orderBy('createdAt', 'asc'),
      );
      const snap = await getDocs(q);

      let totalReqs = 0, totalCost = 0, totalTokIn = 0, totalTokOut = 0;
      const byAssistant = {};
      const byModel     = {};
      const byDay       = {};

      snap.docs.forEach((doc) => {
        const d = doc.data();
        totalReqs++;
        totalCost    += d.costCents  || 0;
        totalTokIn   += d.tokensIn   || 0;
        totalTokOut  += d.tokensOut  || 0;

        // By assistant
        const asst = d.assistant || 'Other Tools';
        if (!byAssistant[asst]) byAssistant[asst] = { requests: 0, costCents: 0, tokens: 0 };
        byAssistant[asst].requests++;
        byAssistant[asst].costCents += d.costCents || 0;
        byAssistant[asst].tokens    += (d.tokensIn || 0) + (d.tokensOut || 0);

        // By model
        const model = d.model || 'unknown';
        if (!byModel[model]) byModel[model] = { tokens: 0 };
        byModel[model].tokens += (d.tokensIn || 0) + (d.tokensOut || 0);

        // By day for trend
        const date = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!byDay[dayKey]) byDay[dayKey] = { day: dayKey, requests: 0, costCents: 0 };
        byDay[dayKey].requests++;
        byDay[dayKey].costCents += d.costCents || 0;
      });

      setTotals({ requests: totalReqs, costCents: totalCost, tokensIn: totalTokIn, tokensOut: totalTokOut });

      const totalTok = totalTokIn + totalTokOut || 1;
      setAssistants(
        Object.entries(byAssistant)
          .map(([assistant, s]) => ({ assistant, ...s }))
          .sort((a, b) => b.requests - a.requests),
      );
      setModels(
        Object.entries(byModel)
          .map(([model, s]) => ({ model, tokens: s.tokens, pct: Math.round((s.tokens / totalTok) * 100) }))
          .sort((a, b) => b.tokens - a.tokens),
      );
      setTrend(Object.values(byDay));
    } catch (err) {
      console.error('[AI Usage] Firestore error:', err);
    }
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const card     = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const text     = isDark ? 'text-white' : 'text-black';
  const muted    = isDark ? 'text-white/50' : 'text-black/50';
  const divider  = isDark ? 'divide-white/5' : 'divide-black/5';
  const rowHover = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]';
  const thead    = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';
  const maxReq   = assistants.length ? Math.max(...assistants.map((a) => a.requests)) : 1;

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>AI Usage</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>Live data from Firestore — request volume, token consumption, and cost breakdown.</p>
          </div>
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d'].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  range === r
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'
                }`}>{r}</button>
            ))}
            <button onClick={fetchData}
              className={`p-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'}`}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={loading ? '—' : totals.requests.toLocaleString()}     sub={`last ${range}`}        icon={Hash}       iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatCard label="Total Cost"     value={loading ? '—' : `$${(totals.costCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub={`last ${range}`} icon={DollarSign} iconBg="bg-amber-500/10"   iconColor="text-amber-500" />
        <StatCard label="Tokens In"      value={loading ? '—' : `${(totals.tokensIn  / 1000).toFixed(1)}K`} sub="prompt tokens"       icon={Zap}        iconBg="bg-blue-500/10"    iconColor="text-blue-500" />
        <StatCard label="Tokens Out"     value={loading ? '—' : `${(totals.tokensOut / 1000).toFixed(1)}K`} sub="completion tokens"   icon={Cpu}        iconBg="bg-purple-500/10"  iconColor="text-purple-500" />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Trend area chart */}
        <div className={`lg:col-span-8 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${text}`}>Request Volume Over Time</h2>
              <div className="flex items-center gap-4 mt-1">
                {[['Requests', '#10b981'], ['Cost (¢)', '#f59e0b']].map(([l, c]) => (
                  <span key={l} className={`flex items-center gap-1 text-xs ${muted}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {(loading || trend.length === 0)
            ? <Placeholder loading={loading} text="No usage data for this period." height={220} muted={muted} />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    {[['ag', '#10b981'], ['ay', '#f59e0b']].map(([id, c]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis dataKey="day"     tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis                   tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Area type="monotone" dataKey="requests"  stroke="#10b981" strokeWidth={2} fill="url(#ag)" dot={false} />
                  <Area type="monotone" dataKey="costCents" stroke="#f59e0b" strokeWidth={2} fill="url(#ay)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Model distribution */}
        <div className={`lg:col-span-4 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Model Distribution</h2>
          {(loading || models.length === 0)
            ? <Placeholder loading={loading} text="No model data." height={160} muted={muted} />
            : (
              <div className="space-y-4">
                {models.map((m) => (
                  <div key={m.model}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-medium font-mono truncate max-w-[120px] ${text}`}>{m.model}</span>
                      <span className={`text-xs ${muted}`}>{(m.tokens / 1000).toFixed(0)}K · {m.pct}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                      <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          <div className={`mt-6 pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <p className={`text-xs ${muted}`}>Total tokens processed</p>
            <p className={`text-xl font-bold mt-1 ${text}`}>
              {((totals.tokensIn + totals.tokensOut) / 1_000_000).toFixed(3)}M
            </p>
          </div>
        </div>
      </div>

      {/* ── By-assistant ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Bar chart */}
        <div className={`lg:col-span-5 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Requests by Assistant</h2>
          {(loading || assistants.length === 0)
            ? <Placeholder loading={loading} text="No data." height={220} muted={muted} />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={assistants} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis type="number"   tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="assistant" tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Bar dataKey="requests" radius={4}>
                    {assistants.map((a, i) => <Cell key={i} fill={getColor(a.assistant)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Breakdown table */}
        <div className={`lg:col-span-7 rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <h2 className={`font-semibold ${text}`}>Detailed Breakdown</h2>
            <span className={`text-xs ${muted}`}>Last {range}</span>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm divide-y ${divider}`}>
              <thead className={thead}>
                <tr>
                  {['Assistant', 'Requests', 'Tokens', 'Cost', 'Avg/Req'].map((h) => (
                    <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {loading ? (
                  <tr><td colSpan={5} className={`py-10 text-center text-sm ${muted}`}>Loading…</td></tr>
                ) : assistants.length === 0 ? (
                  <tr><td colSpan={5} className={`py-10 text-center text-sm ${muted}`}>No usage data for this period.</td></tr>
                ) : assistants.map((a, i) => {
                  const avgCost = a.requests ? (a.costCents / a.requests / 100) : 0;
                  const pct     = Math.round((a.requests / maxReq) * 100);
                  return (
                    <tr key={i} className={`transition-colors ${rowHover}`}>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getColor(a.assistant) }} />
                          <span className={`text-xs font-medium ${text}`}>{a.assistant}</span>
                        </div>
                        <div className={`mt-1.5 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                          <div className="h-1 rounded-full bg-emerald-500/60" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className={`py-3 px-5 text-xs font-medium ${text}`}>{a.requests.toLocaleString()}</td>
                      <td className={`py-3 px-5 text-xs ${muted}`}>{((a.tokens ?? 0) / 1000).toFixed(0)}K</td>
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
