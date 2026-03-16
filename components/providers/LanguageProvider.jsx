'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
            setLanguage(savedLanguage);
        } else {
            // Try to detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'fr') {
                setLanguage('fr');
            } else {
                setLanguage('en');
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('language', language);
            // Update HTML lang attribute
            document.documentElement.lang = language;
        }
    }, [language, mounted]);

    const setLanguageWithSave = (lang) => {
        if (lang === 'en' || lang === 'fr') {
            setLanguage(lang);
        }
    };

    const t = translations[language] || translations.en;

    // Always provide context, even before mounted
    return (
        <LanguageContext.Provider value={{ language, setLanguage: setLanguageWithSave, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

