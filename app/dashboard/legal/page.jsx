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
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-black'}`}>
                {t.legalTrackTitle}
            </h2>
            <div className={`${isDark
                ? 'bg-white/5 border border-white/10'
                : 'bg-black/5 border border-black/10'
                } rounded-2xl p-8 shadow-lg`}>
                <p className={`mb-4 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                    {t.legalTrackDesc}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {legalServices.map((item, i) => (
                        <div
                            key={i}
                            className={`${isDark
                                ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                                : 'bg-black/10 border border-black/20 hover:bg-black/20'
                                } rounded-lg p-4 cursor-pointer transition-all`}
                        >
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
