'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

// ─── Avatar Options ───────────────────────────────────────────────
const AVATAR_FACES = [
    { id: 'default', label: 'Classic', emoji: '🤖' },
    { id: 'brain', label: 'Brain', emoji: '🧠' },
    { id: 'owl', label: 'Owl', emoji: '🦉' },
    { id: 'crystal', label: 'Crystal', emoji: '🔮' },
    { id: 'star', label: 'Star', emoji: '⭐' },
    { id: 'rocket', label: 'Rocket', emoji: '🚀' },
    { id: 'lightning', label: 'Lightning', emoji: '⚡' },
    { id: 'globe', label: 'Globe', emoji: '🌍' },
    { id: 'shield', label: 'Shield', emoji: '🛡️' },
    { id: 'scales', label: 'Scales', emoji: '⚖️' },
    { id: 'book', label: 'Book', emoji: '📚' },
    { id: 'gem', label: 'Gem', emoji: '💎' },
];

const AVATAR_COLORS = [
    { id: 'blue', label: 'Ocean', from: 'from-blue-500', to: 'to-indigo-600', ring: 'ring-blue-400', bg: 'bg-blue-500' },
    { id: 'purple', label: 'Amethyst', from: 'from-purple-500', to: 'to-violet-600', ring: 'ring-purple-400', bg: 'bg-purple-500' },
    { id: 'emerald', label: 'Emerald', from: 'from-emerald-500', to: 'to-teal-600', ring: 'ring-emerald-400', bg: 'bg-emerald-500' },
    { id: 'rose', label: 'Rose', from: 'from-rose-500', to: 'to-pink-600', ring: 'ring-rose-400', bg: 'bg-rose-500' },
    { id: 'amber', label: 'Amber', from: 'from-amber-500', to: 'to-orange-600', ring: 'ring-amber-400', bg: 'bg-amber-500' },
    { id: 'cyan', label: 'Cyan', from: 'from-cyan-500', to: 'to-blue-600', ring: 'ring-cyan-400', bg: 'bg-cyan-500' },
    { id: 'red', label: 'Ruby', from: 'from-red-500', to: 'to-rose-600', ring: 'ring-red-400', bg: 'bg-red-500' },
    { id: 'lime', label: 'Lime', from: 'from-lime-500', to: 'to-green-600', ring: 'ring-lime-400', bg: 'bg-lime-500' },
];

const AVATAR_ACCESSORIES = [
    { id: 'none', label: 'None', render: null },
    { id: 'ring', label: 'Ring Glow', render: 'ring' },
    { id: 'pulse', label: 'Pulse', render: 'pulse' },
    { id: 'badge', label: 'Status Badge', render: 'badge' },
];

export interface AvatarConfig {
    face: string;
    color: string;
    accessory: string;
}

const DEFAULT_CONFIG: AvatarConfig = {
    face: 'default',
    color: 'blue',
    accessory: 'none',
};

// ─── Hook: useAIAvatar ────────────────────────────────────────────
export function useAIAvatar(assistantId: string) {
    const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(`ai-avatar-${assistantId}`);
            if (stored) {
                setConfig(JSON.parse(stored));
            }
        } catch {}
        setLoaded(true);
    }, [assistantId]);

    const updateConfig = useCallback((updates: Partial<AvatarConfig>) => {
        setConfig(prev => {
            const next = { ...prev, ...updates };
            try {
                localStorage.setItem(`ai-avatar-${assistantId}`, JSON.stringify(next));
            } catch {}
            return next;
        });
    }, [assistantId]);

    const resetConfig = useCallback(() => {
        setConfig(DEFAULT_CONFIG);
        try {
            localStorage.removeItem(`ai-avatar-${assistantId}`);
        } catch {}
    }, [assistantId]);

    return { config, updateConfig, resetConfig, loaded };
}

// ─── Avatar Display Component ─────────────────────────────────────
export function AIAvatar({
    config,
    size = 'md',
    onClick,
    className = '',
}: {
    config: AvatarConfig;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    className?: string;
}) {
    const colorObj = AVATAR_COLORS.find(c => c.id === config.color) || AVATAR_COLORS[0];
    const faceObj = AVATAR_FACES.find(f => f.id === config.face) || AVATAR_FACES[0];

    const sizeClasses = {
        sm: 'w-10 h-10 text-lg',
        md: 'w-12 h-12 text-xl',
        lg: 'w-16 h-16 text-3xl',
    };

    const ringSize = {
        sm: 'ring-2',
        md: 'ring-2',
        lg: 'ring-[3px]',
    };

    return (
        <div className={`relative inline-flex ${className}`}>
            {/* Pulse animation */}
            {config.accessory === 'pulse' && (
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorObj.from} ${colorObj.to} animate-ping opacity-20`} />
            )}

            <button
                onClick={onClick}
                type="button"
                className={`
                    ${sizeClasses[size]}
                    rounded-full flex items-center justify-center
                    bg-gradient-to-br ${colorObj.from} ${colorObj.to}
                    shadow-lg
                    ${config.accessory === 'ring' ? `${ringSize[size]} ${colorObj.ring} ring-offset-2 ring-offset-gray-900` : ''}
                    ${onClick ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
                    transition-transform duration-200
                    relative z-10
                `}
                aria-label="Customize AI Avatar"
            >
                <span className="select-none drop-shadow-sm">{faceObj.emoji}</span>
            </button>

            {/* Status badge */}
            {config.accessory === 'badge' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-900 z-20" />
            )}
        </div>
    );
}

// ─── Customizer Modal ─────────────────────────────────────────────
export function AvatarCustomizerModal({
    config,
    onUpdate,
    onReset,
    onClose,
    assistantName,
}: {
    config: AvatarConfig;
    onUpdate: (updates: Partial<AvatarConfig>) => void;
    onReset: () => void;
    onClose: () => void;
    assistantName: string;
}) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<'face' | 'color' | 'accessory'>('face');

    const tabs = [
        { id: 'face' as const, label: 'Face', icon: '😊' },
        { id: 'color' as const, label: 'Color', icon: '🎨' },
        { id: 'accessory' as const, label: 'Effects', icon: '✨' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${isDark
                ? 'bg-gray-900 border border-gray-700/50'
                : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <Palette className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Customize Avatar
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {assistantName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview */}
                <div className={`px-6 py-6 flex flex-col items-center gap-3 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'}`}>
                    <AIAvatar config={config} size="lg" />
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {AVATAR_FACES.find(f => f.id === config.face)?.label} Avatar
                    </p>
                </div>

                {/* Tabs */}
                <div className={`px-6 pt-4 flex gap-1 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? isDark
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : isDark
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-1.5">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="px-6 py-4">
                    {activeTab === 'face' && (
                        <div className="grid grid-cols-4 gap-2">
                            {AVATAR_FACES.map(face => (
                                <button
                                    key={face.id}
                                    onClick={() => onUpdate({ face: face.id })}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                                        config.face === face.id
                                            ? isDark
                                                ? 'bg-blue-600/20 border border-blue-500/40 ring-1 ring-blue-500/30'
                                                : 'bg-blue-50 border border-blue-300 ring-1 ring-blue-200'
                                            : isDark
                                                ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-2xl">{face.emoji}</span>
                                    <span className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {face.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'color' && (
                        <div className="grid grid-cols-4 gap-2">
                            {AVATAR_COLORS.map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => onUpdate({ color: color.id })}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                                        config.color === color.id
                                            ? isDark
                                                ? 'bg-blue-600/20 border border-blue-500/40 ring-1 ring-blue-500/30'
                                                : 'bg-blue-50 border border-blue-300 ring-1 ring-blue-200'
                                            : isDark
                                                ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.from} ${color.to} shadow-sm`} />
                                    <span className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {color.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'accessory' && (
                        <div className="grid grid-cols-2 gap-2">
                            {AVATAR_ACCESSORIES.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => onUpdate({ accessory: acc.id })}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                                        config.accessory === acc.id
                                            ? isDark
                                                ? 'bg-blue-600/20 border border-blue-500/40 ring-1 ring-blue-500/30'
                                                : 'bg-blue-50 border border-blue-300 ring-1 ring-blue-200'
                                            : isDark
                                                ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <AIAvatar
                                        config={{ ...config, accessory: acc.id }}
                                        size="sm"
                                    />
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {acc.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button
                        onClick={onReset}
                        className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
