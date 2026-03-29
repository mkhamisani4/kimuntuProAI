'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function DocumentsPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.myDocuments}
            </h2>
            <div className={`${isDark
                ? 'bg-gray-900/80 border border-gray-800'
                : 'bg-white border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.documentsWillAppear}
                </p>
                <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all shadow-lg">
                    {t.createNewDocument}
                </button>
            </div>
        </div>
    );
}
