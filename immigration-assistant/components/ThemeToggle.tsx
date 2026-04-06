'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`fixed bottom-6 left-6 z-50 p-2.5 rounded-xl shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                isDark
                    ? 'bg-gray-800/90 text-amber-300 hover:bg-gray-700/90 border border-gray-700/80 backdrop-blur-sm shadow-black/30'
                    : 'bg-white/90 text-slate-600 hover:bg-gray-50 border border-gray-200 backdrop-blur-sm shadow-gray-300/40'
            }`}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
