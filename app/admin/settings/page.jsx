'use client';

import { useState } from 'react';
import {
  Settings, Shield, Bell, AlertTriangle,
  Save, Check, Globe, Mail, Eye, EyeOff, Lock, CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ icon: Icon, title, description, children, isDark }) {
  const card = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const text  = isDark ? 'text-white' : 'text-black';
  const muted = isDark ? 'text-white/50' : 'text-black/50';
  return (
    <div className={`rounded-2xl border overflow-hidden ${card}`}>
      <div className={`px-6 py-5 border-b flex items-center gap-3 ${isDark?'border-white/10':'border-black/5'}`}>
        <div className={`p-2 rounded-xl ${isDark?'bg-white/5':'bg-black/5'}`}>
          <Icon className={`w-4 h-4 ${muted}`}/>
        </div>
        <div>
          <h2 className={`font-semibold ${text}`}>{title}</h2>
          {description && <p className={`text-xs mt-0.5 ${muted}`}>{description}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

/* ── Text input ─────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text', isDark }) {
  const [show, setShow] = useState(false);
  const text  = isDark ? 'text-white' : 'text-black';
  const muted = isDark ? 'text-white/50' : 'text-black/50';
  const input = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50'
    : 'bg-white border-black/10 text-black placeholder:text-black/20 focus:border-emerald-500';
  const isPass = type === 'password';
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${muted}`}>{label}</label>
      <div className="relative">
        <input
          type={isPass && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${input}`}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted}`}>
            {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Toggle row ─────────────────────────────────────────────── */
function Toggle({ label, description, value, onChange, isDark }) {
  const text  = isDark ? 'text-white' : 'text-black';
  const muted = isDark ? 'text-white/50' : 'text-black/50';
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className={`text-sm font-medium ${text}`}>{label}</p>
        {description && <p className={`text-xs mt-0.5 ${muted}`}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          value ? 'bg-emerald-500' : isDark ? 'bg-white/10' : 'bg-black/10'
        }`}
        aria-checked={value}
        role="switch"
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value?'translate-x-4':'translate-x-0'}`}/>
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { isDark } = useTheme();
  const { siteName, setSiteName } = useSiteSettings();

  /* Platform */
  const [siteTagline, setSiteTagline] = useState('Empowering African professionals with AI');
  const [supportEmail, setSupportEmail] = useState('support@kimuntuproai.com');
  const [siteUrl,     setSiteUrl]     = useState('https://kimuntuproai.com');

  /* Security */
  const [allowReg,      setAllowReg]      = useState(true);
  const [emailVerify,   setEmailVerify]   = useState(true);
  const [twoFactor,     setTwoFactor]     = useState(false);
  const [maintenanceMode, setMaintenance] = useState(false);

  /* Notifications */
  const [alertHighUsage,  setAlertHighUsage]  = useState(true);
  const [alertPayFail,    setAlertPayFail]    = useState(true);
  const [alertNewUser,    setAlertNewUser]    = useState(false);
  const [alertWeeklyRpt,  setAlertWeeklyRpt]  = useState(true);

  /* UI state */
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState(null);

  /* Change password state */
  const [pwCurrent,  setPwCurrent]  = useState('');
  const [pwNew,      setPwNew]      = useState('');
  const [pwConfirm,  setPwConfirm]  = useState('');
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwSaved,    setPwSaved]    = useState(false);
  const [pwError,    setPwError]    = useState('');

  const handleChangePassword = async () => {
    setPwError('');
    if (!pwNew || pwNew.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwError('Passwords do not match.'); return; }
    const user = auth.currentUser;
    if (!user) { setPwError('Not authenticated.'); return; }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwCurrent);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwNew);
      setPwSaved(true);
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPwError('Current password is incorrect.');
      } else {
        setPwError(err.message || 'Failed to change password.');
      }
    } finally {
      setPwSaving(false);
    }
  };

  const text    = isDark ? 'text-white' : 'text-black';
  const muted   = isDark ? 'text-white/50' : 'text-black/50';

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, 'admin_settings', 'platform'), {
        siteName, siteTagline, supportEmail, siteUrl,
        allowRegistrations: allowReg,
        emailVerification: emailVerify,
        twoFactorRequired: twoFactor,
        maintenanceMode,
        notifications: {
          highUsage: alertHighUsage,
          paymentFailure: alertPayFail,
          newUser: alertNewUser,
          weeklyReport: alertWeeklyRpt,
        },
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${isDark?'border-white/10':'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>Settings</h1>
            <p className={`text-sm mt-0.5 ${muted}`}>Configure platform behaviour, security, and notifications.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60'
            }`}
          >
            {saved
              ? <><Check className="w-4 h-4"/> Saved</>
              : saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving…</>
                : <><Save className="w-4 h-4"/> Save Changes</>
            }
          </button>
        </div>
        {error && (
          <div className={`mt-3 rounded-xl px-4 py-3 text-xs border ${
            isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>{error}</div>
        )}
      </div>

      {/* ── Platform Settings ───────────────────────────────── */}
      <Section icon={Globe} title="Platform Settings" description="General information displayed to users" isDark={isDark}>
        <Field label="Site Name"    value={siteName}     onChange={setSiteName}     placeholder="Kimuntu AI"   isDark={isDark}/>
        <Field label="Tagline"      value={siteTagline}  onChange={setSiteTagline}  placeholder="Your tagline…"   isDark={isDark}/>
        <Field label="Support Email" value={supportEmail} onChange={setSupportEmail} placeholder="support@…"       isDark={isDark}/>
        <Field label="Site URL"     value={siteUrl}      onChange={setSiteUrl}      placeholder="https://…"       isDark={isDark}/>
      </Section>

      {/* ── Security Settings ───────────────────────────────── */}
      <Section icon={Shield} title="Security" description="Access control and authentication policies" isDark={isDark}>
        <Toggle label="Allow New Registrations"    description="Let new users sign up to the platform"            value={allowReg}    onChange={setAllowReg}    isDark={isDark}/>
        <div className={`border-t ${isDark?'border-white/5':'border-black/5'}`}/>
        <Toggle label="Email Verification Required" description="Users must verify their email before accessing the app" value={emailVerify} onChange={setEmailVerify} isDark={isDark}/>
        <div className={`border-t ${isDark?'border-white/5':'border-black/5'}`}/>
        <Toggle label="Require 2FA for Admins"     description="All admin accounts must use two-factor authentication" value={twoFactor}  onChange={setTwoFactor}  isDark={isDark}/>
        <div className={`border-t ${isDark?'border-white/5':'border-black/5'}`}/>
        <Toggle
          label={<span className="text-amber-500">Maintenance Mode</span>}
          description="Temporarily block all non-admin access to the platform"
          value={maintenanceMode}
          onChange={setMaintenance}
          isDark={isDark}
        />
      </Section>

      {/* ── Change Password ──────────────────────────────────── */}
      <Section icon={Lock} title="Change Password" description="Update the password for your admin account" isDark={isDark}>
        <Field label="Current Password" type="password" value={pwCurrent} onChange={setPwCurrent} placeholder="Enter current password" isDark={isDark} />
        <Field label="New Password"     type="password" value={pwNew}     onChange={setPwNew}     placeholder="At least 6 characters"  isDark={isDark} />
        <Field label="Confirm Password" type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="Repeat new password"    isDark={isDark} />
        {pwError && <p className="text-xs text-red-500">{pwError}</p>}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-all"
          >
            {pwSaving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</>
              : <><Lock className="w-4 h-4" />Update Password</>
            }
          </button>
          {pwSaved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-500">
              <CheckCircle2 className="w-4 h-4" /> Password updated!
            </span>
          )}
        </div>
      </Section>

      {/* ── Notification Settings ───────────────────────────── */}
      <Section icon={Bell} title="Admin Notifications" description="Choose which events trigger an email alert to admins" isDark={isDark}>
        <Toggle label="High AI Usage Alert"   description="Notify when daily AI requests exceed threshold" value={alertHighUsage} onChange={setAlertHighUsage} isDark={isDark}/>
        <div className={`border-t ${isDark?'border-white/5':'border-black/5'}`}/>
        <Toggle label="Payment Failure Alert" description="Notify when a subscription payment fails"       value={alertPayFail}   onChange={setAlertPayFail}   isDark={isDark}/>
        <div className={`border-t ${isDark?'border-white/5':'border-black/5'}`}/>
        <Toggle label="New User Signup"       description="Notify on every new user registration"          value={alertNewUser}   onChange={setAlertNewUser}   isDark={isDark}/>
        <div className={`border-t ${isDark?'border-white/5':'border-black/5'}`}/>
        <Toggle label="Weekly Summary Report" description="Receive a weekly digest of platform metrics"    value={alertWeeklyRpt} onChange={setAlertWeeklyRpt} isDark={isDark}/>
      </Section>

      {/* ── Danger Zone ─────────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${isDark?'border-red-500/20':'border-red-200'}`}>
        <div className={`px-6 py-5 border-b flex items-center gap-3 ${isDark?'border-red-500/10 bg-red-500/5':'border-red-100 bg-red-50'}`}>
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="w-4 h-4 text-red-500"/>
          </div>
          <div>
            <h2 className={`font-semibold text-red-500`}>Danger Zone</h2>
            <p className={`text-xs mt-0.5 ${isDark?'text-red-400/60':'text-red-400'}`}>Irreversible actions — proceed with caution.</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Clear AI Usage Logs',   sub: 'Permanently delete all historical AI usage records.',       btn: 'Clear Logs' },
            { label: 'Reset Feature Flags',   sub: 'Restore all feature flags to their default state.',         btn: 'Reset Flags' },
            { label: 'Delete All Test Users', sub: 'Remove all accounts flagged as test/seed data.',            btn: 'Delete Test Users' },
          ].map((action) => (
            <div key={action.label} className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 border ${isDark?'border-red-500/10 bg-red-500/5':'border-red-100 bg-red-50'}`}>
              <div>
                <p className={`text-sm font-medium ${isDark?'text-red-300':'text-red-700'}`}>{action.label}</p>
                <p className={`text-xs mt-0.5 ${isDark?'text-red-400/60':'text-red-400'}`}>{action.sub}</p>
              </div>
              <button
                onClick={() => alert(`Are you sure you want to: ${action.label}?\n\nThis action cannot be undone.`)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                {action.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
