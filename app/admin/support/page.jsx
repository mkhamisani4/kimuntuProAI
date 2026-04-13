'use client';

import { useState, useEffect } from 'react';
import {
  HeadphonesIcon, MessageSquare, Clock, CheckCircle2,
  XCircle, AlertCircle, Search, Send, X, Loader2,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, updateDoc, doc,
  query, orderBy,
} from 'firebase/firestore';

const STATUS_CFG = {
  open:        { label: 'Open',        color: 'text-blue-500',    bg: 'bg-blue-500/10',    icon: AlertCircle  },
  in_progress: { label: 'In Progress', color: 'text-amber-500',   bg: 'bg-amber-500/10',   icon: Clock        },
  resolved:    { label: 'Resolved',    color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  closed:      { label: 'Closed',      color: 'text-gray-400',    bg: 'bg-gray-400/10',    icon: XCircle      },
};

const PRIORITY_CFG = {
  urgent: { label: 'Urgent', color: 'text-red-500',     bg: 'bg-red-500/10'     },
  high:   { label: 'High',   color: 'text-orange-500',  bg: 'bg-orange-500/10'  },
  medium: { label: 'Medium', color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  low:    { label: 'Low',    color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

/* ── Reply / status modal ───────────────────────────────────── */
function ReplyModal({ ticket, onClose, onStatusChange, isDark }) {
  const [reply,   setReply]   = useState('');
  const [status,  setStatus]  = useState(ticket.status);
  const [saving,  setSaving]  = useState(false);
  const [done,    setDone]    = useState(false);

  const text  = isDark ? 'text-white' : 'text-black';
  const muted = isDark ? 'text-white/50' : 'text-black/50';

  const handleSend = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Persist status change to Firestore
      if (status !== ticket.status) {
        await updateDoc(doc(db, 'support_tickets', ticket.id), { status });
        onStatusChange(ticket.id, status);
      }
      // In a full implementation, replies would be stored in a subcollection.
      // For now we just update the status and show confirmation.
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error('[Support] Reply error:', err);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/5'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
          <div>
            <p className={`font-semibold text-sm ${text}`}>{ticket.id} — {ticket.subject}</p>
            <p className={`text-xs mt-0.5 ${muted}`}>{ticket.user} · {ticket.email}</p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            <X className={`w-4 h-4 ${muted}`} />
          </button>
        </div>

        <div className="px-6 pt-4 flex items-center gap-2 flex-wrap">
          <span className={`text-xs ${muted}`}>Status:</span>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <button key={k} onClick={() => setStatus(k)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                status === k
                  ? `${v.bg} ${v.color} border-transparent`
                  : isDark ? 'border-white/10 text-white/40 hover:bg-white/5' : 'border-black/10 text-black/40 hover:bg-black/5'
              }`}>{v.label}</button>
          ))}
        </div>

        <div className="px-6 py-4">
          <label className={`block text-xs font-medium mb-2 ${muted}`}>Reply to {ticket.user}</label>
          <textarea
            rows={5}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your response… (note: replies are not yet persisted — only status is saved)"
            className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none ${
              isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-black/10 text-black placeholder:text-black/20'
            }`}
          />
        </div>

        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
          <button onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/60 hover:bg-black/5'}`}>
            Cancel
          </button>
          <button onClick={handleSend} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-all">
            {done    ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
             : saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
             : <><Send className="w-4 h-4" /> Update Status</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function SupportPage() {
  const { isDark } = useTheme();
  const [tickets,      setTickets]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected,     setSelected]     = useState(null);

  const text     = isDark ? 'text-white' : 'text-black';
  const muted    = isDark ? 'text-white/50' : 'text-black/50';
  const card     = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const divider  = isDark ? 'divide-white/5' : 'divide-black/5';
  const rowHover = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]';
  const thead    = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';

  /* ── Load tickets from Firestore ────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc')),
        );
        setTickets(snap.docs.map((d) => {
          const data = d.data();
          return {
            id:       d.id,
            user:     data.user     || data.userName || 'Unknown',
            email:    data.email    || '',
            subject:  data.subject  || '(no subject)',
            status:   data.status   || 'open',
            priority: data.priority || 'medium',
            category: data.category || 'General',
            created:  data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? new Date().toISOString(),
            messages: data.messages || 0,
          };
        }));
      } catch (err) {
        console.error('[Support] Firestore load error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = search === ''
      || t.user.toLowerCase().includes(search.toLowerCase())
      || t.subject.toLowerCase().includes(search.toLowerCase())
      || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:         tickets.length,
    open:        tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved:    tickets.filter((t) => t.status === 'resolved').length,
  };

  const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>Support</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>
              Live tickets from Firestore <code className="text-xs opacity-60">support_tickets</code> collection.
            </p>
          </div>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
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

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: counts.all,         icon: HeadphonesIcon, iconBg: 'bg-blue-500/10',    iconColor: 'text-blue-500'    },
          { label: 'Open',          value: counts.open,        icon: AlertCircle,    iconBg: 'bg-red-500/10',     iconColor: 'text-red-500'     },
          { label: 'In Progress',   value: counts.in_progress, icon: Clock,          iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500'   },
          { label: 'Resolved',      value: counts.resolved,    icon: CheckCircle2,   iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className={`rounded-2xl p-5 border ${card}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`p-2 rounded-xl ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <span className={`text-sm font-medium ${muted}`}>{label}</span>
            </div>
            <p className={`text-2xl font-bold ${text}`}>{loading ? '—' : value}</p>
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
            }`}>{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ── Tickets table ───────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm divide-y ${divider}`}>
            <thead className={thead}>
              <tr>
                {['Ticket', 'User', 'Category', 'Priority', 'Status', 'Created', 'Msgs', ''].map((h) => (
                  <th key={h} className={`py-3 px-5 text-left text-xs font-semibold ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center text-sm ${muted}`}>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading tickets…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center text-sm ${muted}`}>
                    {tickets.length === 0
                      ? 'No tickets yet. Tickets submitted via the support form will appear here.'
                      : 'No tickets match your filter.'}
                  </td>
                </tr>
              ) : filtered.map((t) => {
                const sc = STATUS_CFG[t.status]    || STATUS_CFG.open;
                const pc = PRIORITY_CFG[t.priority] || PRIORITY_CFG.low;
                const SI = sc.icon;
                return (
                  <tr key={t.id} className={`transition-colors ${rowHover}`}>
                    <td className="py-3 px-5 min-w-[200px]">
                      <p className={`text-xs font-mono font-semibold ${muted}`}>{t.id.slice(0, 8)}…</p>
                      <p className={`text-xs font-medium mt-0.5 ${text} max-w-[180px] truncate`}>{t.subject}</p>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                          {t.user.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${text}`}>{t.user}</p>
                          {t.email && <p className={`text-[10px] ${muted}`}>{t.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-white/60' : 'border-black/10 bg-black/5 text-black/60'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`flex items-center gap-1 text-xs font-medium w-max ${sc.color}`}>
                        <SI className="w-3.5 h-3.5" /> {sc.label}
                      </span>
                    </td>
                    <td className={`py-3 px-5 text-xs ${muted}`}>{relativeTime(t.created)}</td>
                    <td className="py-3 px-5">
                      <span className={`flex items-center gap-1 text-xs ${muted}`}>
                        <MessageSquare className="w-3.5 h-3.5" /> {t.messages}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <button onClick={() => setSelected(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/60 hover:bg-black/5'
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
        <div className={`px-5 py-3 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/5'}`}>
          <span className={`text-xs ${muted}`}>Showing {filtered.length} of {tickets.length} tickets</span>
        </div>
      </div>

      {selected && (
        <ReplyModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          isDark={isDark}
        />
      )}
    </div>
  );
}
