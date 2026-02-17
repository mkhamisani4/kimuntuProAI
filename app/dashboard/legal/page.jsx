'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function LegalTrackPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const legalServices = [
        t.legalContractReview,
        t.legalTemplates,
        t.legalComplianceCheck,
        t.legalDocumentDrafting
    ];

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.legalTrackTitle}
            </h2>
            <div className={`${isDark
                ? 'bg-gray-900/80 border border-gray-800'
                : 'bg-white border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.legalTrackDesc}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {legalServices.map((item, i) => (
                        <div
                            key={i}
                            className={`${isDark
                                ? 'bg-pink-500/20 border border-pink-500/40 hover:bg-pink-500/30'
                                : 'bg-pink-100 border border-pink-300 hover:bg-pink-200'
                                } rounded-lg p-4 cursor-pointer transition-all`}
                        >
                            <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
