'use client';

import { useState } from 'react';
import {
  HeadphonesIcon, MessageSquare, Clock, CheckCircle2,
  XCircle, AlertCircle, Search, Filter, ChevronDown,
  Send, X, User,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

/* ── Mock tickets ───────────────────────────────────────────── */
const MOCK_TICKETS = [
  { id: 'TKT-001', user: 'Sarah M.',  email: 'sarah@example.com',  subject: 'CV Builder not saving my template',           status: 'open',        priority: 'high',   category: 'Bug',     created: '2026-04-09T08:12:00Z', messages: 2  },
  { id: 'TKT-002', user: 'David K.',  email: 'david@example.com',  subject: 'Upgrade to Pro plan — payment failed',         status: 'in_progress', priority: 'urgent', category: 'Billing', created: '2026-04-09T07:45:00Z', messages: 5  },
  { id: 'TKT-003', user: 'Aisha R.',  email: 'aisha@example.com',  subject: 'Business plan AI output is incorrect',         status: 'open',        priority: 'medium', category: 'AI',      created: '2026-04-08T16:30:00Z', messages: 1  },
  { id: 'TKT-004', user: 'James L.',  email: 'james@example.com',  subject: 'Cannot access Legal Assistant feature',        status: 'resolved',    priority: 'low',    category: 'Access',  created: '2026-04-08T12:00:00Z', messages: 4  },
  { id: 'TKT-005', user: 'Maria G.',  email: 'maria@example.com',  subject: 'Avatar simulation keeps timing out',           status: 'in_progress', priority: 'high',   category: 'Bug',     created: '2026-04-08T09:15:00Z', messages: 3  },
  { id: 'TKT-006', user: 'Kwame B.',  email: 'kwame@example.com',  subject: 'How do I export my CV as PDF?',                status: 'resolved',    priority: 'low',    category: 'General', created: '2026-04-07T14:22:00Z', messages: 2  },
  { id: 'TKT-007', user: 'Fatima N.', email: 'fatima@example.com', subject: 'Two-factor auth code not arriving',            status: 'open',        priority: 'medium', category: 'Account', created: '2026-04-07T11:05:00Z', messages: 1  },
  { id: 'TKT-008', user: 'Olu A.',    email: 'olu@example.com',    subject: 'Request for enterprise pricing quote',         status: 'resolved',    priority: 'low',    category: 'Billing', created: '2026-04-06T09:40:00Z', messages: 6  },
];

const STATUS_CFG = {
  open:        { label: 'Open',        color: 'text-blue-500',    bg: 'bg-blue-500/10',    icon: AlertCircle   },
  in_progress: { label: 'In Progress', color: 'text-amber-500',   bg: 'bg-amber-500/10',   icon: Clock         },
  resolved:    { label: 'Resolved',    color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2  },
  closed:      { label: 'Closed',      color: 'text-gray-400',    bg: 'bg-gray-400/10',    icon: XCircle       },
};

const PRIORITY_CFG = {
  urgent: { label: 'Urgent', color: 'text-red-500',    bg: 'bg-red-500/10'    },
  high:   { label: 'High',   color: 'text-orange-500', bg: 'bg-orange-500/10' },
  medium: { label: 'Medium', color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
  low:    { label: 'Low',    color: 'text-emerald-500',bg: 'bg-emerald-500/10'},
};

/* ── Reply modal ────────────────────────────────────────────── */
function ReplyModal({ ticket, onClose, isDark }) {
  const [reply, setReply]   = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [sent,   setSent]   = useState(false);

  const text  = isDark ? 'text-white' : 'text-black';
  const muted = isDark ? 'text-white/50' : 'text-black/50';

  const handleSend = () => {
    if (!reply.trim()) return;
    setSent(true);
    setTimeout(() => { onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.6)'}}>
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl ${isDark?'bg-[#111] border-white/10':'bg-white border-black/5'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark?'border-white/10':'border-black/5'}`}>
          <div>
            <p className={`font-semibold text-sm ${text}`}>{ticket.id} — {ticket.subject}</p>
            <p className={`text-xs mt-0.5 ${muted}`}>{ticket.user} · {ticket.email}</p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark?'hover:bg-white/10':'hover:bg-black/5'}`}>
            <X className={`w-4 h-4 ${muted}`}/>
          </button>
        </div>

        {/* Status changer */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <span className={`text-xs ${muted}`}>Status:</span>
          {Object.entries(STATUS_CFG).map(([k,v]) => (
            <button key={k} onClick={() => setStatus(k)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                status === k
                  ? `${v.bg} ${v.color} border-transparent`
                  : isDark ? 'border-white/10 text-white/40 hover:bg-white/5' : 'border-black/10 text-black/40 hover:bg-black/5'
              }`}>{v.label}</button>
          ))}
        </div>

        {/* Reply textarea */}
        <div className="px-6 py-4">
          <label className={`block text-xs font-medium mb-2 ${muted}`}>Reply to {ticket.user}</label>
          <textarea
            rows={5}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your response…"
            className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                : 'bg-white border-black/10 text-black placeholder:text-black/20'
            }`}
          />
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark?'border-white/10':'border-black/5'}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium border ${isDark?'border-white/10 text-white/60 hover:bg-white/5':'border-black/10 text-black/60 hover:bg-black/5'}`}>
            Cancel
          </button>
          <button onClick={handleSend} disabled={!reply.trim() || sent}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-all">
            {sent ? <><CheckCircle2 className="w-4 h-4"/> Sent!</> : <><Send className="w-4 h-4"/> Send Reply</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function SupportPage() {
  const { isDark } = useTheme();
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected,     setSelected]     = useState(null);

  const text    = isDark ? 'text-white' : 'text-black';
  const muted   = isDark ? 'text-white/50' : 'text-black/50';
  const card    = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const divider = isDark ? 'divide-white/5' : 'divide-black/5';
  const rowHover = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]';
  const thead   = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';

  const filtered = MOCK_TICKETS.filter((t) => {
    const matchSearch = search === ''
      || t.user.toLowerCase().includes(search.toLowerCase())
      || t.subject.toLowerCase().includes(search.toLowerCase())
      || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:         MOCK_TICKETS.length,
    open:        MOCK_TICKETS.filter(t => t.status === 'open').length,
    in_progress: MOCK_TICKETS.filter(t => t.status === 'in_progress').length,
    resolved:    MOCK_TICKETS.filter(t => t.status === 'resolved').length,
  };

  const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${isDark?'border-white/10':'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>Support</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>Manage user tickets and respond to support requests.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`}/>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className={`pl-9 pr-4 py-2 rounded-xl text-sm border w-52 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets',   value: counts.all,         icon: HeadphonesIcon, iconBg: 'bg-blue-500/10',    iconColor: 'text-blue-500'    },
          { label: 'Open',            value: counts.open,        icon: AlertCircle,    iconBg: 'bg-red-500/10',     iconColor: 'text-red-500'     },
          { label: 'In Progress',     value: counts.in_progress, icon: Clock,          iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500'   },
          { label: 'Resolved',        value: counts.resolved,    icon: CheckCircle2,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className={`rounded-2xl p-5 border ${card}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`p-2 rounded-xl ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`}/>
              </div>
              <span className={`text-sm font-medium ${muted}`}>{label}</span>
            </div>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all',         label: 'All Tickets'  },
          { key: 'open',        label: 'Open'         },
          { key: 'in_progress', label: 'In Progress'  },
          { key: 'resolved',    label: 'Resolved'     },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filterStatus === key
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-black/10 text-black/60 hover:bg-black/5'
            }`}>
            {label}
            <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              filterStatus === key ? 'bg-white/20 text-white' : isDark ? 'bg-white/10 text-white/40' : 'bg-black/5 text-black/40'
            }`}>{counts[key] ?? MOCK_TICKETS.length}</span>
          </button>
        ))}
      </div>

      {/* ── Tickets table ───────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['Ticket','User','Category','Priority','Status','Created','Messages',''].map(h => (
                  <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center text-sm ${muted}`}>No tickets found.</td>
                </tr>
              ) : filtered.map((t) => {
                const sc = STATUS_CFG[t.status]   || STATUS_CFG.open;
                const pc = PRIORITY_CFG[t.priority] || PRIORITY_CFG.low;
                const SI = sc.icon;
                return (
                  <tr key={t.id} className={`transition-colors ${rowHover}`}>
                    {/* ID + subject */}
                    <td className="py-3 px-5 min-w-[220px]">
                      <p className={`text-xs font-mono font-semibold ${muted}`}>{t.id}</p>
                      <p className={`text-xs font-medium mt-0.5 ${text} max-w-[200px] truncate`}>{t.subject}</p>
                    </td>
                    {/* User */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                          {t.user.slice(0,1)}
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${text}`}>{t.user}</p>
                          <p className={`text-[10px] ${muted}`}>{t.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${isDark?'border-white/10 bg-white/5 text-white/60':'border-black/10 bg-black/5 text-black/60'}`}>
                        {t.category}
                      </span>
                    </td>
                    {/* Priority */}
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-5">
                      <span className={`flex items-center gap-1 text-xs font-medium w-max ${sc.color}`}>
                        <SI className="w-3.5 h-3.5"/> {sc.label}
                      </span>
                    </td>
                    {/* Created */}
                    <td className={`py-3 px-5 text-xs ${muted}`}>{relativeTime(t.created)}</td>
                    {/* Messages */}
                    <td className="py-3 px-5">
                      <span className={`flex items-center gap-1 text-xs ${muted}`}>
                        <MessageSquare className="w-3.5 h-3.5"/> {t.messages}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="py-3 px-5">
                      <button onClick={() => setSelected(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isDark?'border-white/10 text-white/60 hover:bg-white/5':'border-black/10 text-black/60 hover:bg-black/5'
                        }`}>
                        Reply
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={`px-5 py-3 border-t flex items-center justify-between ${isDark?'border-white/10':'border-black/5'}`}>
          <span className={`text-xs ${muted}`}>Showing {filtered.length} of {MOCK_TICKETS.length} tickets</span>
        </div>
      </div>

      {/* ── Reply modal ─────────────────────────────────────── */}
      {selected && <ReplyModal ticket={selected} onClose={() => setSelected(null)} isDark={isDark}/>}
    </div>
  );
}
