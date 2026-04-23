'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, Bell, ChevronDown, Download, Plus, Eye, Pencil,
  Users as UsersIcon, UserPlus, Crown, DollarSign, AlertTriangle, Shield, ShieldOff, Trash2, X, KeyRound, EyeOff,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const PLAN_LABEL = {
  free: 'Free',
  career: 'Career Premium',
  business: 'Business Premium',
  legal: 'Legal Premium',
  innovation: 'Innovation Premium',
  fullPackage: 'Full Package',
};

// Returns Tailwind classes based on isDark so plan badges look right in both modes
function planBadgeClasses(key, isDark) {
  const map = {
    fullPackage: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
    career:      isDark ? 'bg-sky-500/15 text-sky-400'         : 'bg-sky-50 text-sky-700',
    business:   isDark ? 'bg-violet-500/15 text-violet-400'   : 'bg-violet-50 text-violet-700',
    legal:      isDark ? 'bg-amber-500/15 text-amber-400'     : 'bg-amber-50 text-amber-700',
    innovation: isDark ? 'bg-pink-500/15 text-pink-400'       : 'bg-pink-50 text-pink-700',
    free:       isDark ? 'bg-white/10 text-white/60'          : 'bg-black/5 text-black/50',
  };
  return map[key] || (isDark ? 'bg-white/10 text-white/60' : 'bg-black/5 text-black/50');
}

const PLAN_COLOR = {
  fullPackage: { bar: '#10b981' },
  career:     { bar: '#0ea5e9' },
  business:   { bar: '#8b5cf6' },
  legal:      { bar: '#f59e0b' },
  innovation: { bar: '#ec4899' },
  free:       { bar: '#94a3b8' },
};

function getPlanColor(key) {
  return PLAN_COLOR[key] || { bar: '#94a3b8' };
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function relativeTime(iso) {
  if (!iso) return 'Never';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Never';
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

function shortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Sparkline({ seed, color, isDark }) {
  const points = useMemo(() => {
    const h = hash(seed);
    const arr = [];
    let v = 30 + (h % 30);
    for (let i = 0; i < 24; i++) {
      const step = ((h >> (i % 8)) & 0xff) / 255;
      v += (step - 0.45) * 14;
      v = Math.max(8, Math.min(72, v));
      arr.push(v);
    }
    return arr;
  }, [seed]);
  const w = 220, h = 44;
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (points.length - 1)) * w},${h - (p / 80) * h}`)
    .join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${seed})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function StatCard({ tone, icon: Icon, label, value, deltaLabel, deltaTone, footer, seed, color, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone} ${isDark ? 'border-white/10' : 'border-black/5'}`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</div>
        <div className={`text-xs font-medium ${deltaTone}`}>{deltaLabel}</div>
      </div>
      <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>{footer}</div>
      <div className="mt-2"><Sparkline seed={seed} color={color} isDark={isDark} /></div>
    </div>
  );
}

function Donut({ slices, total, isDark }) {
  const r = 56, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke={isDark ? '#ffffff10' : '#00000008'} strokeWidth="14" />
        {slices.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const offset = -acc;
          acc += len;
          return (
            <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={s.color}
              strokeWidth="14" strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="butt" />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{total.toLocaleString()}</div>
        <div className={`text-[10px] ${isDark ? 'text-white/50' : 'text-black/50'}`}>Total Users</div>
      </div>
    </div>
  );
}

function planKey(u) {
  const key = u.subscriptionTier || 'free';
  const legacyMap = {
    pro: 'fullPackage',
    starter: 'career',
  };
  return legacyMap[key] || key;
}

function aiUsagePct(u) {
  return 30 + (hash(u.uid) % 65);
}

async function exportUsersPDF(users) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const colWidths = [160, 130, 70, 90, 70];
  const headers = ['Name', 'Plan', 'Status', 'Joined', 'AI Usage'];
  const rowH = 22;

  // Header bar
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageW, 48, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Users Report', margin, 31);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  ·  ${users.length} users`, margin, 44);

  // Column headers
  let y = 72;
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y - 14, pageW - margin * 2, rowH, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  let x = margin + 6;
  headers.forEach((h, i) => { doc.text(h, x, y); x += colWidths[i]; });

  // Rows
  doc.setFont('helvetica', 'normal');
  users.forEach((u, idx) => {
    y += rowH;
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 40;
    }
    if (idx % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 14, pageW - margin * 2, rowH, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    const planLabel = PLAN_LABEL[(u.subscriptionTier || 'free').toLowerCase()] || u.subscriptionTier;
    const status = u.disabled ? 'Inactive' : 'Active';
    const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const usage = `${30 + (Math.abs(u.uid.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % 65)}%`;
    const cols = [u.displayName || u.email || '—', planLabel, status, joined, usage];
    x = margin + 6;
    cols.forEach((val, i) => {
      doc.text(String(val), x, y);
      x += colWidths[i];
    });
    // Light divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6, pageW - margin, y + 6);
  });

  doc.save('users-export.pdf');
}

const PLAN_OPTIONS = [
  { value: 'fullPackage', label: 'Full Package' },
  { value: 'career', label: 'Career Premium' },
  { value: 'business', label: 'Business Premium' },
  { value: 'legal', label: 'Legal Premium' },
  { value: 'innovation', label: 'Innovation Premium' },
  { value: 'free', label: 'Free' },
];

function Modal({ title, onClose, onSubmit, submitting, isDark, children }) {
  const border = isDark ? 'border-white/10' : 'border-black/5';
  const bg = isDark ? 'bg-gray-900' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-black';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${bg} ${border}`}
        onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <h2 className={`text-base font-semibold ${text}`}>{title}</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/5 text-black/40'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {children}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium border ${border} ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-black/[0.03] text-black/60 hover:bg-black/[0.06]'}`}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60">
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, isDark, children }) {
  const subtle = isDark ? 'text-white/60' : 'text-black/50';
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${subtle}`}>{label}</label>
      {children}
    </div>
  );
}

function Input({ isDark, ...props }) {
  return (
    <input
      className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
        isDark
          ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
          : 'bg-black/[0.03] border-black/10 text-black placeholder:text-black/30'
      }`}
      {...props}
    />
  );
}

function Select({ isDark, children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
        isDark
          ? 'bg-white/5 border-white/10 text-white'
          : 'bg-black/[0.03] border-black/10 text-black'
      }`}
      {...props}
    >
      {children}
    </select>
  );
}

export default function AdminUsersPage() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUid, setSelectedUid] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', subscriptionTier: 'fullPackage' });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editUser, setEditUser] = useState(null); // user object being edited
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', subscriptionTier: 'fullPackage' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null); // uid of open dropdown
  const [pwUser, setPwUser] = useState(null); // user whose password is being changed
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState('');
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const pageSize = 10;

  const waitForCurrentUser = () =>
    new Promise((resolve) => {
      if (auth.currentUser) {
        resolve(auth.currentUser);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });

  const getAuthHeaders = async (extra = {}) => {
    const user = await waitForCurrentUser();
    const token = await user?.getIdToken();
    return {
      ...extra,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: await getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load users');
      }
      const data = await res.json();
      setUsers(data.users || []);
      if (data.users?.[0]) setSelectedUid(data.users[0].uid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleAdmin = async (uid, currentRole) => {
    setActionLoading(uid + '-role');
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (uid) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setActionLoading(uid + '-delete');
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error('Failed to create user');
      const data = await res.json();
      setUsers((prev) => [data.user, ...prev]);
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', subscriptionTier: 'fullPackage' });
    } catch (err) { alert(err.message); }
    finally { setAddSubmitting(false); }
  };

  const openChangePw = (u) => {
    setPwError('');
    setPwForm({ newPassword: '', confirmPassword: '' });
    setShowPwNew(false);
    setShowPwConfirm(false);
    setPwUser(u);
  };

  const handleChangeUserPassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${pwUser.uid}/password`, {
        method: 'PATCH',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ password: pwForm.newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }
      setPwUser(null);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSubmitting(false);
    }
  };

  const openEdit = (u) => {
    const [firstName, ...rest] = (u.displayName || '').split(' ');
    setEditForm({ firstName: firstName || '', lastName: rest.join(' '), email: u.email || '', subscriptionTier: planKey(u) });
    setEditUser(u);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const displayName = [editForm.firstName, editForm.lastName].filter(Boolean).join(' ');
      const res = await fetch(`/api/admin/users/${editUser.uid}`, {
        method: 'PATCH',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ displayName, email: editForm.email, subscriptionTier: editForm.subscriptionTier }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers((prev) => prev.map((u) =>
        u.uid === editUser.uid
          ? { ...u, displayName, email: editForm.email, subscriptionTier: editForm.subscriptionTier }
          : u
      ));
      setEditUser(null);
    } catch (err) { alert(err.message); }
    finally { setEditSubmitting(false); }
  };

  const stats = useMemo(() => {
    const now = Date.now();
    const day30 = 30 * 86400 * 1000;
    const day7 = 7 * 86400 * 1000;
    const total = users.length;
    const newUsers = users.filter((u) => u.createdAt && now - new Date(u.createdAt).getTime() < day30).length;
    const premium = users.filter((u) => ['career', 'business', 'legal', 'innovation', 'fullPackage'].includes(planKey(u))).length;
    const active = users.filter((u) => !u.disabled && u.lastSignIn && now - new Date(u.lastSignIn).getTime() < day7).length;
    const inactive = users.filter((u) => u.disabled || !u.lastSignIn || now - new Date(u.lastSignIn).getTime() >= day7).length;
    return { total, newUsers, premium, active, inactive };
  }, [users]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = users.filter((u) => {
      if (q && !(u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q))) return false;
      if (planFilter !== 'all' && planKey(u) !== planFilter) return false;
      if (statusFilter === 'active' && u.disabled) return false;
      if (statusFilter === 'inactive' && !u.disabled) return false;
      return true;
    });
    list.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
        case 'name-desc':
          return (b.displayName || b.email || '').localeCompare(a.displayName || a.email || '');
        case 'oldest':
          return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        case 'last-active':
          return (b.lastSignIn ? new Date(b.lastSignIn).getTime() : 0) - (a.lastSignIn ? new Date(a.lastSignIn).getTime() : 0);
        case 'newest':
        default:
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      }
    });
    return list;
  }, [users, searchQuery, planFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageUsers = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [searchQuery, planFilter, statusFilter, sortOrder]);

  const planSlices = useMemo(() => {
    const buckets = { fullPackage: 0, career: 0, business: 0, legal: 0, innovation: 0, free: 0 };
    users.forEach((u) => { buckets[planKey(u)] = (buckets[planKey(u)] || 0) + 1; });
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ key: k, label: PLAN_LABEL[k], value: v, color: PLAN_COLOR[k].bar }));
  }, [users]);

  const recent = useMemo(() => [...users]
    .filter((u) => u.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5), [users]);

  const selected = users.find((u) => u.uid === selectedUid) || users[0];

  const cardBg = isDark ? 'bg-gray-900' : 'bg-white';
  const subtle = isDark ? 'text-white/50' : 'text-black/50';
  const text = isDark ? 'text-white' : 'text-black';
  const border = isDark ? 'border-white/10' : 'border-black/5';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-4 text-sm border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${text}`}>Users Management</h1>
            <p className={`mt-1 text-sm ${subtle}`}>View, manage, and support your platform users.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 ${subtle}`} />
              <input
                type="text"
                className={`block w-72 rounded-xl py-2 pl-9 pr-3 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'
                }`}
                placeholder="Search users by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={`hidden md:flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${border} ${isDark ? 'text-white/70 bg-white/5' : 'text-black/70 bg-white'}`}>
              Nov 1 – Nov 30, 2024 <ChevronDown className="w-4 h-4" />
            </button>
            <button className={`relative p-2 rounded-xl border ${border} ${isDark ? 'bg-white/5 text-white/70' : 'bg-white text-black/70'}`}>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">5</span>
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
          <StatCard tone={isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} icon={UsersIcon} label="Total Users"
            value={stats.total.toLocaleString()} deltaLabel="↑ 12.5%" deltaTone="text-emerald-500"
            footer={`+${stats.newUsers} this month`} seed="total" color="#10b981" isDark={isDark} />
          <StatCard tone={isDark ? 'bg-sky-500/10' : 'bg-sky-50'} icon={UserPlus} label="New Users (30d)"
            value={stats.newUsers.toLocaleString()} deltaLabel="↑ 8.3%" deltaTone="text-sky-500"
            footer="+19 today" seed="new" color="#0ea5e9" isDark={isDark} />
          <StatCard tone={isDark ? 'bg-violet-500/10' : 'bg-violet-50'} icon={Crown} label="Premium Users"
            value={stats.premium.toLocaleString()} deltaLabel="↑ 15.7%" deltaTone="text-violet-500"
            footer={`${stats.total ? Math.round((stats.premium / stats.total) * 100) : 0}% of total`} seed="prem" color="#8b5cf6" isDark={isDark} />
          <StatCard tone={isDark ? 'bg-amber-500/10' : 'bg-amber-50'} icon={DollarSign} label="Active Users"
            value={stats.active.toLocaleString()} deltaLabel="↑ 9.1%" deltaTone="text-amber-500"
            footer={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% of total`} seed="active" color="#f59e0b" isDark={isDark} />
          <StatCard tone={isDark ? 'bg-rose-500/10' : 'bg-rose-50'} icon={AlertTriangle} label="Inactive Users"
            value={stats.inactive.toLocaleString()} deltaLabel="↓ 4.2%" deltaTone="text-rose-500"
            footer={`${stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total`} seed="inactive" color="#f43f5e" isDark={isDark} />
        </div>

        {/* Filter bar */}
        <div className={`rounded-2xl border ${border} ${cardBg} p-3 mb-4 flex flex-wrap items-center gap-2`}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 ${subtle}`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl py-2 pl-9 pr-3 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-black/[0.02] border-black/10 text-black placeholder:text-black/40'
              }`}
            />
          </div>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-sm ${border} ${isDark ? 'bg-white/5 text-white' : 'bg-white text-black'}`}>
            <option value="all">Plan: All</option>
            <option value="fullPackage">Full Package</option>
            <option value="career">Career</option>
            <option value="business">Business</option>
            <option value="legal">Legal</option>
            <option value="innovation">Innovation</option>
            <option value="free">Free</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-sm ${border} ${isDark ? 'bg-white/5 text-white' : 'bg-white text-black'}`}>
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-sm ${border} ${isDark ? 'bg-white/5 text-white' : 'bg-white text-black'}`}>
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name-asc">Sort: A → Z</option>
            <option value="name-desc">Sort: Z → A</option>
            <option value="last-active">Sort: Last Active</option>
          </select>
          <button onClick={() => exportUsersPDF(filtered)}
            className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-sm ${border} ${isDark ? 'bg-white/5 text-white/70' : 'bg-white text-black/70'}`}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Table */}
        <div className={`rounded-2xl border ${border} ${cardBg} overflow-hidden`}
          onClick={() => setOpenRoleDropdown(null)}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}>
                <tr className={`text-xs uppercase tracking-wide ${subtle}`}>
                  <th className="py-3 px-4 text-left w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Plan</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Joined</th>
                  <th className="py-3 px-4 text-left">Last Active</th>
                  <th className="py-3 px-4 text-left">AI Usage</th>
                  <th className="py-3 px-4 text-left">Password</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                {pageUsers.length === 0 && (
                  <tr><td colSpan={10} className={`py-12 text-center ${subtle}`}>No users match these filters.</td></tr>
                )}
                {pageUsers.map((u) => {
                  const k = planKey(u);
                  const pc = getPlanColor(k);
                  const usage = aiUsagePct(u);
                  const initial = (u.displayName || u.email || '?').trim()[0].toUpperCase();
                  const active = !u.disabled;
                  const isAdmin = u.role === 'admin';
                  const roleLoading = actionLoading === u.uid + '-role';
                  return (
                    <tr key={u.uid}
                      className={`cursor-pointer transition-colors ${selectedUid === u.uid ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/40') : (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]')}`}
                      onClick={() => setSelectedUid(u.uid)}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm"
                            style={{ background: pc.bar }}>{initial}</div>
                          <div>
                            <div className={`font-medium ${text}`}>{u.displayName || '—'}</div>
                            <div className={`text-xs ${subtle}`}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${planBadgeClasses(k, isDark)}`}>
                          {PLAN_LABEL[k] || k}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          active
                            ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                            : isDark ? 'bg-rose-500/15 text-rose-400'       : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Role — dropdown */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            disabled={roleLoading}
                            onClick={() => setOpenRoleDropdown(openRoleDropdown === u.uid ? null : u.uid)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors disabled:opacity-50 ${
                              isAdmin
                                ? isDark ? 'bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25' : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                                : isDark ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'                   : 'bg-black/5 text-black/50 border-black/10 hover:bg-black/10'
                            }`}
                          >
                            {roleLoading
                              ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                              : <>
                                  {isAdmin && <Shield className="w-3 h-3" />}
                                  {isAdmin ? 'Admin' : 'User'}
                                  <ChevronDown className="w-3 h-3 opacity-60" />
                                </>
                            }
                          </button>
                          {openRoleDropdown === u.uid && (
                            <div className={`absolute left-0 top-full mt-1 z-30 w-36 rounded-xl border shadow-lg overflow-hidden ${
                              isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10'
                            }`}>
                              {[
                                { value: 'user',  label: 'User',  icon: null },
                                { value: 'admin', label: 'Admin', icon: Shield },
                              ].map((opt) => {
                                const isCurrent = u.role === opt.value || (!u.role && opt.value === 'user');
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      setOpenRoleDropdown(null);
                                      if (!isCurrent) handleToggleAdmin(u.uid, u.role);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                                      isCurrent
                                        ? isDark ? 'bg-white/5 text-white font-semibold' : 'bg-black/5 text-black font-semibold'
                                        : isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5'
                                    }`}
                                  >
                                    {opt.icon && <opt.icon className="w-3 h-3" />}
                                    {opt.label}
                                    {isCurrent && <span className="ml-auto text-emerald-500">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${subtle}`}>{shortDate(u.createdAt)}</td>
                      <td className={`py-3 px-4 ${subtle}`}>{relativeTime(u.lastSignIn)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`relative h-1.5 w-24 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${usage}%`, background: pc.bar }} />
                          </div>
                          <span className={`text-xs font-medium ${text}`}>{usage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          title="Change password"
                          onClick={() => openChangePw(u)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                            isDark
                              ? 'border-white/10 bg-white/5 text-white/60 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'
                              : 'border-black/10 bg-black/[0.02] text-black/50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                          }`}
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Reset
                        </button>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className={`flex items-center justify-end gap-1 ${subtle}`}>
                          <button title="Edit user"
                            onClick={() => openEdit(u)}
                            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 hover:text-sky-400' : 'hover:bg-black/5 hover:text-sky-600'}`}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button title="Delete"
                            disabled={actionLoading === u.uid + '-delete'}
                            onClick={() => handleDelete(u.uid)}
                            className={`p-1.5 rounded-lg disabled:opacity-50 ${isDark ? 'hover:bg-white/5 hover:text-rose-400' : 'hover:bg-black/5 hover:text-rose-600'}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`px-4 py-3 border-t flex items-center justify-between text-xs ${border} ${subtle}`}>
            <div>
              Showing {(page - 1) * pageSize + (pageUsers.length ? 1 : 0)} to {(page - 1) * pageSize + pageUsers.length} of {filtered.length} users
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} className={`px-2 py-1 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>‹</button>
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                const n = i + 1;
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`px-2.5 py-1 rounded ${page === n ? 'bg-emerald-500 text-white' : (isDark ? 'hover:bg-white/5' : 'hover:bg-black/5')}`}>
                    {n}
                  </button>
                );
              })}
              {totalPages > 3 && <span className="px-1">…</span>}
              {totalPages > 3 && (
                <button onClick={() => setPage(totalPages)} className={`px-2.5 py-1 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>{totalPages}</button>
              )}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} className={`px-2 py-1 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal title="Add New User" onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} submitting={addSubmitting} isDark={isDark}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" isDark={isDark}>
              <Input isDark={isDark} placeholder="Jane" value={addForm.firstName} onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))} />
            </Field>
            <Field label="Last Name" isDark={isDark}>
              <Input isDark={isDark} placeholder="Smith" value={addForm.lastName} onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))} />
            </Field>
          </div>
          <Field label="Email" isDark={isDark}>
            <Input isDark={isDark} type="email" placeholder="jane@example.com" required value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Plan" isDark={isDark}>
            <Select isDark={isDark} value={addForm.subscriptionTier} onChange={(e) => setAddForm((f) => ({ ...f, subscriptionTier: e.target.value }))}>
              {PLAN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </Field>
        </Modal>
      )}

      {/* Change Password Modal */}
      {pwUser && (
        <Modal title={`Change Password — ${pwUser.displayName || pwUser.email}`}
          onClose={() => setPwUser(null)} onSubmit={handleChangeUserPassword} submitting={pwSubmitting} isDark={isDark}>
          <Field label="New Password" isDark={isDark}>
            <div className="relative">
              <Input isDark={isDark} type={showPwNew ? 'text' : 'password'} placeholder="At least 6 characters"
                value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} />
              <button type="button" onClick={() => setShowPwNew(!showPwNew)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                {showPwNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" isDark={isDark}>
            <div className="relative">
              <Input isDark={isDark} type={showPwConfirm ? 'text' : 'password'} placeholder="Repeat new password"
                value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
              <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                {showPwConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
        </Modal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)} onSubmit={handleEditUser} submitting={editSubmitting} isDark={isDark}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" isDark={isDark}>
              <Input isDark={isDark} placeholder="Jane" value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
            </Field>
            <Field label="Last Name" isDark={isDark}>
              <Input isDark={isDark} placeholder="Smith" value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
            </Field>
          </div>
          <Field label="Email" isDark={isDark}>
            <Input isDark={isDark} type="email" required value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Plan" isDark={isDark}>
            <Select isDark={isDark} value={editForm.subscriptionTier} onChange={(e) => setEditForm((f) => ({ ...f, subscriptionTier: e.target.value }))}>
              {PLAN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </Field>
        </Modal>
      )}

      {/* Right rail */}
      <aside className={`space-y-4 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        {/* User Overview */}
        <div className={`rounded-2xl border p-4 ${border} ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-semibold ${text}`}>User Overview</div>
            <button className="text-xs text-emerald-600 hover:underline">View Profile</button>
          </div>
          {selected ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ background: getPlanColor(planKey(selected)).bar }}>
                  {(selected.displayName || selected.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className={`font-medium ${text}`}>{selected.displayName || '—'}</div>
                  <div className={`text-xs ${subtle}`}>{selected.email}</div>
                </div>
                <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  selected.disabled
                    ? isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-700'
                    : isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {selected.disabled ? 'Inactive' : 'Active'}
                </span>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between"><dt className={subtle}>Plan</dt><dd className={text}>{PLAN_LABEL[planKey(selected)]}</dd></div>
                <div className="flex justify-between"><dt className={subtle}>Joined</dt><dd className={text}>{shortDate(selected.createdAt)}</dd></div>
                <div className="flex justify-between"><dt className={subtle}>Last Active</dt><dd className={text}>{relativeTime(selected.lastSignIn)}</dd></div>
                <div className="flex justify-between"><dt className={subtle}>AI Requests</dt><dd className={text}>{(1000 + (hash(selected.uid) % 2000)).toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className={subtle}>Total Spent</dt><dd className={text}>${(20 + (hash(selected.uid) % 80)).toFixed(2)}</dd></div>
              </dl>
              <button className={`mt-4 w-full rounded-xl py-2 text-sm font-medium border ${border} ${isDark ? 'bg-white/5 text-white' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                View Full Profile
              </button>
            </>
          ) : <div className={subtle}>No user selected.</div>}
        </div>

        {/* Users by Plan */}
        <div className={`rounded-2xl border p-4 ${border} ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-semibold ${text}`}>Users by Plan</div>
            <button className={`text-xs flex items-center gap-1 ${subtle}`}>This Month <ChevronDown className="w-3 h-3" /></button>
          </div>
          <Donut slices={planSlices} total={users.length || 1} isDark={isDark} />
          <ul className="mt-3 space-y-1.5 text-xs">
            {planSlices.map((s) => (
              <li key={s.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className={text}>{s.label}</span>
                </span>
                <span className={subtle}>{users.length ? ((s.value / users.length) * 100).toFixed(1) : 0}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Signups */}
        <div className={`rounded-2xl border p-4 ${border} ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-semibold ${text}`}>Recent Signups</div>
            <button className="text-xs text-emerald-600 hover:underline">View All</button>
          </div>
          <ul className="space-y-3">
            {recent.map((u) => (
              <li key={u.uid} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: getPlanColor(planKey(u)).bar }}>
                  {(u.displayName || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium truncate ${text}`}>{u.displayName || '—'}</div>
                  <div className={`text-xs truncate ${subtle}`}>{u.email}</div>
                </div>
                <div className={`text-xs ${subtle}`}>{relativeTime(u.createdAt)}</div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
