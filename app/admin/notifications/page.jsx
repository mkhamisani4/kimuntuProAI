'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, Bell, Check } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { NOTIFICATIONS } from '@/lib/adminNotifications';

const TYPE_META = {
  warning: { label: 'Warning',  bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20',   icon: AlertTriangle },
  error:   { label: 'Error',    bg: 'bg-red-500/10',     text: 'text-red-500',     border: 'border-red-500/20',     icon: XCircle },
  success: { label: 'Success',  bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: CheckCircle2 },
  info:    { label: 'Info',     bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/20',    icon: Info },
};

function NotifIcon({ type, size = 'md' }) {
  const m = TYPE_META[type] || TYPE_META.info;
  const Icon = m.icon;
  const sz = size === 'lg' ? 'p-3' : 'p-2';
  const iconSz = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className={`${sz} rounded-xl ${m.bg} flex-shrink-0`}>
      <Icon className={`${iconSz} ${m.text}`} />
    </div>
  );
}

export default function NotificationsPage() {
  const { isDark } = useTheme();
  const [read, setRead]         = useState(new Set());
  const [resolved, setResolved] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const markRead    = (id) => setRead(r => new Set([...r, id]));
  const markAllRead = () => setRead(new Set(NOTIFICATIONS.map(n => n.id)));

  const resolve = (id) => {
    setResolved(r => new Set([...r, id]));
    setRead(r => new Set([...r, id]));
    setSelected(s => (s?.id === id ? null : s));
  };

  const active = NOTIFICATIONS.filter(n => !resolved.has(n.id));
  const unread = active.filter(n => !read.has(n.id));
  const visible = filter === 'unread'
    ? active.filter(n => !read.has(n.id))
    : filter === 'read'
      ? active.filter(n => read.has(n.id))
      : active;

  const card    = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const text    = isDark ? 'text-white' : 'text-black';
  const muted   = isDark ? 'text-white/50' : 'text-black/50';
  const divider = isDark ? 'border-white/10' : 'border-black/5';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${divider}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Bell className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>Notifications</h1>
            <p className={`text-sm ${muted}`}>
              {unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAllRead}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/60 hover:bg-black/[0.04]'
            }`}
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {[
          { key: 'all',    label: `All (${active.length})` },
          { key: 'unread', label: `Unread (${unread.length})` },
          { key: 'read',   label: `Read (${active.filter(n => read.has(n.id)).length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                : isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-black/40 hover:text-black/70 hover:bg-black/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inbox layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* List */}
        <div className={`lg:col-span-5 rounded-2xl border overflow-hidden ${card}`}>
          {visible.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 ${muted}`}>
              <Bell className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {visible.map((n) => {
                const isRead     = read.has(n.id);
                const isSelected = selected?.id === n.id;
                const m = TYPE_META[n.type] || TYPE_META.info;
                return (
                  <button
                    key={n.id}
                    onClick={() => { setSelected(n); markRead(n.id); }}
                    className={`w-full text-left flex items-start gap-3 px-5 py-4 transition-colors ${
                      isSelected
                        ? isDark ? 'bg-white/[0.07]' : 'bg-black/[0.06]'
                        : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    <NotifIcon type={n.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-snug ${isRead ? muted : text}`}>{n.msg}</p>
                        {!isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
                          {m.label}
                        </span>
                        <span className={`text-xs ${muted}`}>{n.time}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div className={`lg:col-span-7 rounded-2xl border ${card}`}>
          {selected ? (
            <div className="p-6 space-y-5">
              {/* Type badge + time */}
              <div className="flex items-center gap-3">
                <NotifIcon type={selected.type} size="lg" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    {(() => {
                      const m = TYPE_META[selected.type] || TYPE_META.info;
                      return (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
                          {m.label}
                        </span>
                      );
                    })()}
                    <span className={`text-xs ${muted}`}>{selected.time}</span>
                  </div>
                  <h2 className={`text-lg font-bold leading-snug ${text}`}>{selected.msg}</h2>
                </div>
              </div>

              {/* Divider */}
              <div className={`h-px ${isDark ? 'bg-white/10' : 'bg-black/8'}`} />

              {/* Detail body */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${muted}`}>Details</p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-black/70'}`}>{selected.detail}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => resolve(selected.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                  Resolve
                </button>
                <button
                  onClick={() => resolve(selected.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/50 hover:bg-black/[0.04]'
                }`}>
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-64 ${muted}`}>
              <Bell className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm">Select a notification to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
