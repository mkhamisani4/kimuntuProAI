'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SiteSettingsContext = createContext({
  siteName: 'Kimuntu AI',
  setSiteName: () => {},
});

export function SiteSettingsProvider({ children }) {
  const [siteName, setSiteNameState] = useState('Kimuntu AI');

  // Load persisted value on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_siteName');
      if (stored) setSiteNameState(stored);
    } catch {}
  }, []);

  const setSiteName = (name) => {
    setSiteNameState(name);
    try { localStorage.setItem('admin_siteName', name); } catch {}
  };

  return (
    <SiteSettingsContext.Provider value={{ siteName, setSiteName }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
