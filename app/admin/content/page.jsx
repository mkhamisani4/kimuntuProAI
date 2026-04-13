'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Megaphone, HelpCircle, Plus,
  Pencil, Trash2, X, Check, Eye, EyeOff,
  Pin, Calendar, Loader2,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';

/* ── Reusable components ────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, onAdd, isDark }) {
  const muted = isDark ? 'text-white/50' : 'text-black/50';
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${muted}`} />
        <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{title}</h2>
      </div>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add New
      </button>
    </div>
  );
}

function InlineField({ label, value, onChange, multiline, isDark }) {
  const muted = isDark ? 'text-white/40' : 'text-black/40';
  const cls = `w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
    isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-black/10 text-black placeholder:text-black/20'
  }`;
  return (
    <div>
      <label className={`block text-[11px] font-medium mb-1 ${muted}`}>{label}</label>
      {multiline
        ? <textarea rows={3} className={`${cls} resize-none`} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function ContentPage() {
  const { isDark } = useTheme();

  const [announcements, setAnnouncements] = useState([]);
  const [faqs,          setFaqs]          = useState([]);
  const [editAnn,       setEditAnn]       = useState(null);
  const [editFaq,       setEditFaq]       = useState(null);
  const [tab,           setTab]           = useState('announcements');
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);

  const text    = isDark ? 'text-white' : 'text-black';
  const muted   = isDark ? 'text-white/50' : 'text-black/50';
  const card    = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm';
  const divider = isDark ? 'border-white/10' : 'border-black/5';

  /* ── Load from Firestore ────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [annSnap, faqSnap] = await Promise.all([
          getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'faqs'),          orderBy('createdAt', 'asc'))),
        ]);
        setAnnouncements(annSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setFaqs(faqSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('[Content] Firestore load error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  /* ── Announcement handlers ──────────────────────────────── */
  const saveAnn = async () => {
    if (!editAnn || saving) return;
    setSaving(true);
    try {
      if (editAnn.id === 'new') {
        const ref = await addDoc(collection(db, 'announcements'), {
          title:     editAnn.title,
          body:      editAnn.body,
          published: editAnn.published,
          pinned:    editAnn.pinned,
          createdAt: serverTimestamp(),
        });
        const date = new Date().toISOString().slice(0, 10);
        setAnnouncements((prev) => [{ ...editAnn, id: ref.id, date }, ...prev]);
      } else {
        await updateDoc(doc(db, 'announcements', editAnn.id), {
          title:     editAnn.title,
          body:      editAnn.body,
          published: editAnn.published,
          pinned:    editAnn.pinned,
        });
        setAnnouncements((prev) => prev.map((a) => a.id === editAnn.id ? { ...a, ...editAnn } : a));
      }
      setEditAnn(null);
    } catch (err) {
      console.error('[Content] Save announcement error:', err);
    }
    setSaving(false);
  };

  const deleteAnn = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) { console.error('[Content] Delete announcement error:', err); }
  };

  const toggleAnnField = async (id, field) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    const updated = { ...ann, [field]: !ann[field] };
    try {
      await updateDoc(doc(db, 'announcements', id), { [field]: updated[field] });
      setAnnouncements((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch (err) { console.error('[Content] Toggle error:', err); }
  };

  /* ── FAQ handlers ───────────────────────────────────────── */
  const saveFaq = async () => {
    if (!editFaq || saving) return;
    setSaving(true);
    try {
      if (editFaq.id === 'new') {
        const ref = await addDoc(collection(db, 'faqs'), {
          question:  editFaq.question,
          answer:    editFaq.answer,
          createdAt: serverTimestamp(),
        });
        setFaqs((prev) => [...prev, { ...editFaq, id: ref.id }]);
      } else {
        await updateDoc(doc(db, 'faqs', editFaq.id), {
          question: editFaq.question,
          answer:   editFaq.answer,
        });
        setFaqs((prev) => prev.map((f) => f.id === editFaq.id ? { ...f, ...editFaq } : f));
      }
      setEditFaq(null);
    } catch (err) {
      console.error('[Content] Save FAQ error:', err);
    }
    setSaving(false);
  };

  const deleteFaq = async (id) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) { console.error('[Content] Delete FAQ error:', err); }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 gap-3 ${muted}`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading content…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={`pb-4 border-b ${divider}`}>
        <h1 className={`text-2xl font-bold ${text}`}>Content</h1>
        <p className={`text-sm mt-0.5 ${muted}`}>Manage announcements and FAQ content. Changes save to Firestore instantly.</p>
      </div>

      {/* ── Tab switcher ────────────────────────────────────── */}
      <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
        {[
          { key: 'announcements', label: 'Announcements', icon: Megaphone },
          { key: 'faqs',          label: 'FAQs',          icon: HelpCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === key
                ? isDark ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm'
                : `${muted} hover:opacity-80`
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Announcements ───────────────────────────────────── */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <SectionHeader icon={Megaphone} title="Announcements" isDark={isDark}
            onAdd={() => setEditAnn({ id: 'new', title: '', body: '', published: false, pinned: false })} />

          {editAnn && (
            <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
              <p className={`text-sm font-semibold ${text}`}>{editAnn.id === 'new' ? 'New Announcement' : 'Edit Announcement'}</p>
              <InlineField label="Title"   value={editAnn.title} onChange={(v) => setEditAnn((a) => ({ ...a, title: v }))}              isDark={isDark} />
              <InlineField label="Content" value={editAnn.body}  onChange={(v) => setEditAnn((a) => ({ ...a, body: v }))}  multiline isDark={isDark} />
              <div className="flex items-center gap-4">
                <label className={`flex items-center gap-2 text-xs cursor-pointer ${muted}`}>
                  <input type="checkbox" checked={editAnn.published} onChange={(e) => setEditAnn((a) => ({ ...a, published: e.target.checked }))} className="accent-emerald-500" />
                  Published
                </label>
                <label className={`flex items-center gap-2 text-xs cursor-pointer ${muted}`}>
                  <input type="checkbox" checked={editAnn.pinned} onChange={(e) => setEditAnn((a) => ({ ...a, pinned: e.target.checked }))} className="accent-emerald-500" />
                  Pinned
                </label>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={saveAnn} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
                <button onClick={() => setEditAnn(null)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/60 hover:bg-black/5'}`}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          {announcements.map((a) => (
            <div key={a.id} className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {a.pinned && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Pinned</span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      a.published ? 'bg-emerald-500/10 text-emerald-500' : isDark ? 'bg-white/10 text-white/40' : 'bg-black/10 text-black/40'
                    }`}>{a.published ? 'Published' : 'Draft'}</span>
                    {a.date && (
                      <span className={`flex items-center gap-1 text-[10px] ${muted}`}>
                        <Calendar className="w-3 h-3" /> {a.date}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold text-sm ${text}`}>{a.title}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${muted}`}>{a.body}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleAnnField(a.id, 'pinned')} title="Toggle pin"
                    className={`p-2 rounded-lg transition-colors ${a.pinned ? 'text-amber-500 bg-amber-500/10' : `${muted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}`}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleAnnField(a.id, 'published')} title="Toggle publish"
                    className={`p-2 rounded-lg transition-colors ${a.published ? 'text-emerald-500 bg-emerald-500/10' : `${muted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}`}>
                    {a.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditAnn({ ...a })} title="Edit"
                    className={`p-2 rounded-lg ${muted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAnn(a.id)} title="Delete"
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-40 gap-3 rounded-2xl border ${isDark ? 'border-white/10' : 'border-black/5'}`}>
              <Megaphone className={`w-8 h-8 ${muted}`} />
              <p className={`text-sm ${muted}`}>No announcements yet. Add one above.</p>
            </div>
          )}
        </div>
      )}

      {/* ── FAQs ────────────────────────────────────────────── */}
      {tab === 'faqs' && (
        <div className="space-y-4">
          <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" isDark={isDark}
            onAdd={() => setEditFaq({ id: 'new', question: '', answer: '' })} />

          {editFaq && (
            <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
              <p className={`text-sm font-semibold ${text}`}>{editFaq.id === 'new' ? 'New FAQ' : 'Edit FAQ'}</p>
              <InlineField label="Question" value={editFaq.question} onChange={(v) => setEditFaq((f) => ({ ...f, question: v }))} isDark={isDark} />
              <InlineField label="Answer"   value={editFaq.answer}   onChange={(v) => setEditFaq((f) => ({ ...f, answer: v }))}   multiline isDark={isDark} />
              <div className="flex items-center gap-2 pt-2">
                <button onClick={saveFaq} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
                <button onClick={() => setEditFaq(null)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-black/60 hover:bg-black/5'}`}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            {faqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <HelpCircle className={`w-8 h-8 ${muted}`} />
                <p className={`text-sm ${muted}`}>No FAQs yet. Add one above.</p>
              </div>
            ) : faqs.map((f, i) => (
              <div key={f.id} className={`px-5 py-4 ${i < faqs.length - 1 ? `border-b ${divider}` : ''} ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'} transition-colors`}>
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${isDark ? 'bg-white/10 text-white/50' : 'bg-black/5 text-black/40'}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${text}`}>{f.question}</p>
                    <p className={`text-xs mt-1 leading-relaxed ${muted}`}>{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setEditFaq({ ...f })}
                      className={`p-2 rounded-lg ${muted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteFaq(f.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
