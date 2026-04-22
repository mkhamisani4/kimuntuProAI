'use client';

import { useState, useEffect } from 'react';
import { X, User, Check, LogOut, ArrowLeftRight } from 'lucide-react';
import { auth, db, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useRouter } from 'next/navigation';

const PLAN_OPTIONS = [
  { value: 'pro',         label: 'Pro Launch Plan',   price: '$29/mo' },
  { value: 'starter',    label: 'Career Premium',     price: '$19/mo' },
  { value: 'business',   label: 'Business Premium',   price: '$49/mo' },
  { value: 'free',       label: 'Legal Premium',      price: '$39/mo' },
  { value: 'innovation', label: 'Innovation Premium', price: '$59/mo' },
];

export function ProfileButton({ onSignOut }) {
  const { isDark } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', plan: 'pro' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const handleOpen = async () => {
    const [first, ...rest] = (user?.displayName || '').split(' ');
    let plan = 'pro';
    try {
      if (user?.uid) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) plan = snap.data()?.subscriptionTier || 'pro';
      }
    } catch {}
    setForm({ firstName: first || '', lastName: rest.join(' '), plan });
    setError(null);
    setSaved(false);
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const displayName = [form.firstName, form.lastName].filter(Boolean).join(' ');
      await updateProfile(auth.currentUser, { displayName });
      if (user?.uid) {
        await setDoc(doc(db, 'users', user.uid), { subscriptionTier: form.plan, displayName }, { merge: true });
      }
      setUser((prev) => ({ ...prev, displayName }));
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '').replace(/ \(auth\/.*\)/, '') || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOutUser();
    if (onSignOut) onSignOut();
    else router.push('/');
  };

  const handleSwitchAccount = async () => {
    setOpen(false);
    await signOutUser();
    router.push('/?switch=1');
  };

  const avatar = (user?.displayName || user?.email || '?').charAt(0).toUpperCase();
  const displayName = user?.displayName || user?.email || '—';

  const bg = isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10';
  const divider = isDark ? 'border-white/10' : 'border-black/8';
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
      : 'bg-black/[0.03] border-black/10 text-black placeholder:text-black/30'
  }`;
  const sectionLabel = `text-[11px] font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-black/30'}`;

  return (
    <>
      {/* Sidebar trigger */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={handleOpen}
          className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border ${
            isDark
              ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
              : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.05]'
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>Logged in as</p>
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{displayName}</p>
          </div>
          <User className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
        </button>
      </div>

      {/* Popup menu — centered on screen */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Menu card */}
          <form
            onSubmit={handleSave}
            className={`relative z-10 w-[360px] rounded-2xl border shadow-2xl overflow-hidden ${bg}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Profile header ── */}
            <div className={`flex items-center justify-between px-5 pt-5 pb-4 border-b ${divider}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {avatar}
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-black'}`}>{displayName}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-black/40'}`}>{user?.email || ''}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-black/5 text-black/30'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Name fields ── */}
            <div className={`px-5 py-4 border-b ${divider}`}>
              <p className={sectionLabel}>Name</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>First</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="Jane"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Last</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Smith"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Payment plan ── */}
            <div className={`px-5 py-4 border-b ${divider}`}>
              <p className={sectionLabel}>Payment Plan</p>
              <div className="space-y-1">
                {PLAN_OPTIONS.map((p) => {
                  const active = form.plan === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, plan: p.value }))}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        active
                          ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                          : isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          active
                            ? 'border-emerald-500 bg-emerald-500'
                            : isDark ? 'border-white/20' : 'border-black/20'
                        }`}>
                          {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-medium">{p.label}</span>
                      </div>
                      <span className={`text-xs font-medium ${active ? 'text-emerald-500' : isDark ? 'text-white/30' : 'text-black/30'}`}>
                        {p.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Switch / Sign out actions ── */}
            <div className={`px-5 py-2 border-b ${divider}`}>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isDark
                    ? 'text-white/70 hover:bg-white/5 hover:text-white'
                    : 'text-black/60 hover:bg-black/[0.04] hover:text-black'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                Switch Account
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isDark
                    ? 'text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400'
                    : 'text-rose-600/70 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>

            {/* ── Error ── */}
            {error && (
              <div className={`mx-5 mt-3 text-xs rounded-xl px-3 py-2 border ${
                isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                {error}
              </div>
            )}

            {/* ── Footer actions ── */}
            <div className="px-5 py-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {saved
                  ? <><Check className="w-4 h-4" /> Saved!</>
                  : saving
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                    : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
