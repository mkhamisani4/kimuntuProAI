'use client';

import React, { useMemo, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { CONTACT_EMAIL, buildSupportMailto } from '@/lib/contact';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function SupportContactForm({ isDark = true }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const inputClassName = useMemo(() => (
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50'
      : 'bg-white border-black/10 text-black placeholder:text-black/30 focus:border-emerald-500/50'
  ), [isDark]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill out all fields before sending.');
      return;
    }

    window.location.href = buildSupportMailto(form);
    setForm(initialForm);
  };

  return (
    <div className={`rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-sm'}`}>
      <div className={`px-6 py-5 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Contact Support</h2>
        <p className={`text-sm mt-2 ${isDark ? 'text-white/50' : 'text-black/60'}`}>
          Fill out the form below and your email app will open a message addressed to {CONTACT_EMAIL}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Your name"
              className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${inputClassName}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${inputClassName}`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={handleChange('subject')}
            placeholder="How can we help?"
            className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${inputClassName}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>Message</label>
          <textarea
            rows={8}
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Tell us what you need help with."
            className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none ${inputClassName}`}
          />
        </div>

        {error && (
          <div className={`rounded-2xl px-4 py-3 text-sm border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {error}
          </div>
        )}

        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-white/45' : 'text-black/55'}`}>
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
