'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, User, Shield, Globe, Moon, Sun, Camera, Mail, Phone, MapPin, FileText, Save, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';

export default function SettingsPage() {
    const { isDark, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setDisplayName(currentUser.displayName || '');
                setAvatarPreview(currentUser.photoURL || null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateProfile(user, {
                displayName: displayName,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        if (displayName) {
            return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return (user?.email || '?').charAt(0).toUpperCase();
    };

    const inputClass = `w-full px-4 py-3 rounded-xl transition-all focus:outline-none ${isDark
        ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
        : 'bg-black/[0.02] border border-black/10 text-black placeholder-black/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
    }`;

    const cardClass = `rounded-2xl p-8 transition-all ${isDark
        ? 'glass-card'
        : 'bg-white border border-black/5 shadow-sm'
    }`;

    const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-black'}`;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
                <Settings className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.settings}
                </h2>
            </div>

            <div className="space-y-6">
                {/* Profile / Avatar Section */}
                <div className={cardClass}>
                    <div className="flex items-center gap-3 mb-6">
                        <User className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Profile
                        </h3>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative group">
                            <div className={`w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center ${isDark
                                ? 'bg-emerald-500/10 border-2 border-emerald-500/20'
                                : 'bg-emerald-50 border-2 border-emerald-200'
                            }`}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {getInitials()}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`absolute -bottom-2 -right-2 p-2 rounded-xl transition-all ${isDark
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                } shadow-lg`}
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                                {displayName || 'Your Name'}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black'}`}>
                                {user?.email}
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-black'}`}>
                                Click the camera icon to change your photo
                            </p>
                        </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your full name"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>{t.email}</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`${inputClass} opacity-50 cursor-not-allowed`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Job Title</label>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g. Software Engineer"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Company</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. Acme Inc."
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, Country"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className={labelClass}>Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us a bit about yourself..."
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex items-center gap-4">
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 ${isDark
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                        {saved && (
                            <div className="flex items-center gap-2 text-emerald-400 animate-fadeIn">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Profile updated!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preferences */}
                <div className={cardClass}>
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.preferences}
                        </h3>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black'}`}>
                                    {t.theme}
                                </label>
                                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-black'}`}>
                                    {t.themeDesc}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`p-3 rounded-xl transition-all ${isDark
                                    ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                                    : 'bg-black/5 hover:bg-black/10 border border-black/5'
                                }`}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700" />
                                )}
                            </button>
                        </div>
                        <div className={`border-t ${isDark ? 'border-white/10' : 'border-black/5'}`} />
                        <div className="flex items-center justify-between">
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black'}`}>
                                    {t.language}
                                </label>
                                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-black'}`}>
                                    {t.languageDesc}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === 'en'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                        : isDark
                                            ? 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'
                                            : 'bg-black/5 text-black hover:bg-black/10 border border-black/5'
                                    }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('fr')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === 'fr'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                        : isDark
                                            ? 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'
                                            : 'bg-black/5 text-black hover:bg-black/10 border border-black/5'
                                    }`}
                                >
                                    Français
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className={cardClass}>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.privacySecurity}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-black/[0.02] border border-black/5'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-black'}`}>Account secured</span>
                            </div>
                            <p className={`text-xs ml-5 ${isDark ? 'text-white/40' : 'text-black'}`}>
                                Your data is encrypted and stored securely with Firebase Auth
                            </p>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black'}`}>
                            {t.deleteAccountDesc}
                        </p>
                        <button
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            }`}
                        >
                            {t.deleteAccount}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
