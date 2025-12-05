'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Shield, Globe, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SettingsPage() {
    const { isDark, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <Settings className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.settings}
                </h2>
            </div>

            <div className="space-y-6">
                {/* Account Settings */}
                <div className={`${isDark
                    ? 'bg-gray-900/80 border border-gray-800'
                    : 'bg-white border border-gray-200'
                    } rounded-2xl p-8 shadow-lg`}>
                    <div className="flex items-center gap-3 mb-6">
                        <User className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.account}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.email}
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`w-full px-4 py-2 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-gray-300'
                                    : 'bg-white border border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.displayName}
                            </label>
                            <input
                                type="text"
                                value={user?.displayName || ''}
                                placeholder="Your name"
                                className={`w-full px-4 py-2 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className={`${isDark
                    ? 'bg-gray-900/80 border border-gray-800'
                    : 'bg-white border border-gray-200'
                    } rounded-2xl p-8 shadow-lg`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.preferences}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {t.theme}
                                </label>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {t.themeDesc}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`p-3 rounded-lg transition-all ${isDark
                                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                                    }`}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700" />
                                )}
                            </button>
                        </div>
                        <div className={`flex items-center justify-between pt-4 ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
                            <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {t.language}
                                </label>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {t.languageDesc}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'en'
                                        ? isDark
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                        : isDark
                                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                                        }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('fr')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'fr'
                                        ? isDark
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                        : isDark
                                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                                        }`}
                                >
                                    Français
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className={`${isDark
                    ? 'bg-gray-900/80 border border-gray-800'
                    : 'bg-white border border-gray-200'
                    } rounded-2xl p-8 shadow-lg`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.privacySecurity}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t.deleteAccountDesc}
                        </p>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${isDark
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-300'
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

