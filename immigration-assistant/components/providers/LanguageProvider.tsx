"use client";

import React, { createContext, useContext, useState } from "react";

type LanguageContextType = {
    t: Record<string, string>;
    language: string;
    setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    t: {},
    language: "en",
    setLanguage: () => { },
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState("en");

    // Mock translations
    const t = {
        legalTrackTitle: "Legal Track",
        legalTrackDesc: "Access comprehensive legal assistance powered by AI"
    };

    return (
        <LanguageContext.Provider value={{ t, language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
