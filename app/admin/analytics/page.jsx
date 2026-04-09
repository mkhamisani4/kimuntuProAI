'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, TrendingUp, MousePointerClick, Clock,
  Globe, Repeat2, ChevronDown, Download,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

/* ── Data ───────────────────────────────────────────────────── */
const growthData = [
  { month: 'Oct',  newUsers: 1840, returning: 4200, churned: 320 },
  { month: 'Nov',  newUsers: 2100, returning: 4800, churned: 280 },
  { month: 'Dec',  newUsers: 1960, returning: 5100, churned: 310 },
  { month: 'Jan',  newUsers: 2480, returning: 5600, churned: 260 },
  { month: 'Feb',  newUsers: 2890, returning: 6200, churned: 230 },
  { month: 'Mar',  newUsers: 3140, returning: 6900, churned: 200 },
  { month: 'Apr',  newUsers: 3490, returning: 7400, churned: 175 },
];

const conversionData = [
  { stage: 'Visited', users: 48200 },
  { stage: 'Signed Up', users: 12800 },
  { stage: 'Onboarded', users: 8400 },
  { stage: 'First AI Use', users: 6100 },
  { stage: 'Paid', users: 2340 },
];

const topPages = [
  { page: '/dashboard',          views: 128400, bounce: '22%', avg: '4m 12s' },
  { page: '/chat',               views: 94200,  bounce: '15%', avg: '6m 48s' },
  { page: '/cv-builder',         views: 61800,  bounce: '28%', avg: '8m 02s' },
  { page: '/business-plan',      views: 43200,  bounce: '31%', avg: '7m 15s' },
  { page: '/legal-assistant',    views: 38600,  bounce: '19%', avg: '5m 33s' },
  { page: '/avatar-simulations', views: 29400,  bounce: '35%', avg: '3m 45s' },
];

const geoData = [
  { country: 'United States', users: 9840, pct: 40 },
  { country: 'United Kingdom', users: 3690, pct: 15 },
  { country: 'Canada',         users: 2460, pct: 10 },
  { country: 'Australia',      users: 1970, pct: 8  },
  { country: 'Germany',        users: 1480, pct: 6  },
  { country: 'Other',          users: 5341, pct: 21 },
];

const deviceData = [
  { name: 'Desktop', value: 58, color: '#10b981' },
  { name: 'Mobile',  value: 33, color: '#3b82f6' },
  { name: 'Tablet',  value: 9,  color: '#8b5cf6' },
];

const retentionRows = [
  { cohort: 'Jan 2026', size: 2480, w1: '81%', w2: '68%', w4: '54%', w8: '41%' },
  { cohort: 'Feb 2026', size: 2890, w1: '83%', w2: '71%', w4: '57%', w8: '44%' },
  { cohort: 'Mar 2026', size: 3140, w1: '85%', w2: '73%', w4: '60%', w8: '—'   },
  { cohort: 'Apr 2026', size: 3490, w1: '87%', w2: '75%', w4: '—',   w8: '—'   },
];

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
          <span className="font-medium">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, change, sub, icon: Icon, iconBg, iconColor }) {
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
          <TrendingUp className="w-3 h-3" />{change}
        </span>
        <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>{sub}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [range, setRange] = useState('90d');

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
            <p className={`text-sm mt-0.5 ${muted}`}>User growth, engagement, and conversion funnel insights.</p>
          </div>
          <div className="flex items-center gap-2">
            {['30d','90d','1y'].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  range === r
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'
                }`}>{r}</button>
            ))}
            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'
            }`}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"      value="24,785"  change="12.5%" sub="vs last period"  icon={Users}            iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatCard label="Avg Session"      value="5m 34s"  change="8.2%"  sub="vs last period"  icon={Clock}            iconBg="bg-blue-500/10"    iconColor="text-blue-500" />
        <StatCard label="Conversion Rate"  value="4.86%"   change="1.3%"  sub="visitor → paid"  icon={MousePointerClick} iconBg="bg-amber-500/10"  iconColor="text-amber-500" />
        <StatCard label="30-day Retention" value="54.2%"   change="3.8%"  sub="vs last cohort"  icon={Repeat2}          iconBg="bg-purple-500/10"  iconColor="text-purple-500" />
      </div>

      {/* ── Charts row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* User growth */}
        <div className={`lg:col-span-8 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${text}`}>User Growth</h2>
              <div className="flex items-center gap-4 mt-1">
                {[['New Users','#10b981'],['Returning','#3b82f6'],['Churned','#ef4444']].map(([l,c]) => (
                  <span key={l} className={`flex items-center gap-1 text-xs ${muted}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <button className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${isDark?'border-white/10 text-white/50':'border-black/10 text-black/50'}`}>
              Monthly <ChevronDown className="w-3 h-3"/>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthData} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                {[['ag','#10b981'],['ab','#3b82f6'],['ar','#ef4444']].map(([id,c])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<ChartTooltip isDark={isDark}/>}/>
              <Area type="monotone" dataKey="newUsers"   stroke="#10b981" strokeWidth={2} fill="url(#ag)" dot={false}/>
              <Area type="monotone" dataKey="returning"  stroke="#3b82f6" strokeWidth={2} fill="url(#ab)" dot={false}/>
              <Area type="monotone" dataKey="churned"    stroke="#ef4444" strokeWidth={2} fill="url(#ar)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device breakdown */}
        <div className={`lg:col-span-4 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Device Breakdown</h2>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} strokeWidth={0} dataKey="value" isAnimationActive={false}>
                  {deviceData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-3 mt-2">
              {deviceData.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`flex items-center gap-1.5 text-xs ${muted}`}>
                      <span className="w-2 h-2 rounded-full" style={{background:d.color}}/>
                      {d.name}
                    </span>
                    <span className={`text-xs font-medium ${text}`}>{d.value}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${isDark?'bg-white/10':'bg-black/5'}`}>
                    <div className="h-1.5 rounded-full" style={{width:`${d.value}%`,background:d.color}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Conversion funnel */}
        <div className={`lg:col-span-5 rounded-2xl p-5 border ${card}`}>
          <h2 className={`font-semibold mb-4 ${text}`}>Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionData} layout="vertical" barSize={18} margin={{top:0,right:8,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}/>
              <XAxis type="number" tick={{fontSize:10,fill:isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="stage" tick={{fontSize:10,fill:isDark?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}} axisLine={false} tickLine={false} width={80}/>
              <Tooltip content={<ChartTooltip isDark={isDark}/>}/>
              <Bar dataKey="users" radius={4} fill="#10b981"/>
            </BarChart>
          </ResponsiveContainer>
          <div className={`mt-3 pt-3 border-t flex items-center justify-between ${isDark?'border-white/10':'border-black/5'}`}>
            <span className={`text-xs ${muted}`}>Overall conversion</span>
            <span className={`text-sm font-bold text-emerald-500`}>4.86%</span>
          </div>
        </div>

        {/* Geo distribution */}
        <div className={`lg:col-span-3 rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className={`w-4 h-4 ${muted}`}/>
            <h2 className={`font-semibold ${text}`}>Geography</h2>
          </div>
          <div className="space-y-3">
            {geoData.map((g) => (
              <div key={g.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${text}`}>{g.country}</span>
                  <span className={`text-xs ${muted}`}>{g.users.toLocaleString()} · {g.pct}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark?'bg-white/10':'bg-black/5'}`}>
                  <div className="h-1.5 rounded-full bg-blue-500" style={{width:`${g.pct}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention table */}
        <div className={`lg:col-span-4 rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b ${isDark?'border-white/10':'border-black/5'}`}>
            <h2 className={`font-semibold ${text}`}>Cohort Retention</h2>
          </div>
          <table className={`w-full text-xs divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['Cohort','Size','Wk 1','Wk 2','Wk 4','Wk 8'].map(h => (
                  <th key={h} className={`py-3 px-4 text-left font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {retentionRows.map((r) => (
                <tr key={r.cohort} className={`transition-colors ${rowHover}`}>
                  <td className={`py-3 px-4 font-medium ${text}`}>{r.cohort}</td>
                  <td className={`py-3 px-4 ${muted}`}>{r.size.toLocaleString()}</td>
                  {[r.w1,r.w2,r.w4,r.w8].map((v,i) => (
                    <td key={i} className={`py-3 px-4 font-medium ${
                      v === '—' ? muted :
                      parseInt(v) >= 70 ? 'text-emerald-500' :
                      parseInt(v) >= 50 ? 'text-amber-500'   : 'text-red-400'
                    }`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top pages ───────────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark?'border-white/10':'border-black/5'}`}>
          <h2 className={`font-semibold ${text}`}>Top Pages</h2>
          <span className={`text-xs ${muted}`}>By unique views</span>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['Page','Views','Bounce Rate','Avg Time on Page'].map(h => (
                  <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {topPages.map((p,i) => (
                <tr key={i} className={`transition-colors ${rowHover}`}>
                  <td className={`py-3 px-5 text-xs font-mono font-medium ${text}`}>{p.page}</td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{p.views.toLocaleString()}</td>
                  <td className={`py-3 px-5 text-xs font-medium ${
                    parseInt(p.bounce) < 25 ? 'text-emerald-500' :
                    parseInt(p.bounce) < 32 ? 'text-amber-500'   : 'text-red-400'
                  }`}>{p.bounce}</td>
                  <td className={`py-3 px-5 text-xs ${muted}`}>{p.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
