'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth, completeOnboarding } from '@/lib/firebase';
import {
    Sparkles, Scale, Briefcase, TrendingUp, Rocket,
    ChevronRight, ChevronLeft, Check, User, Building2,
    Target, Settings, Sun, Moon
} from 'lucide-react';

const TRACKS = [
    { id: 'legal', label: 'Legal Track', icon: Scale, desc: 'Research, case analysis, and AI-powered legal insights' },
    { id: 'career', label: 'Career Track', icon: Briefcase, desc: 'CV building, interview prep, and job matching' },
    { id: 'business', label: 'Business Track', icon: TrendingUp, desc: 'Business plans, market analysis, and branding' },
    { id: 'innovative', label: 'Innovative Track', icon: Rocket, desc: 'Project management and innovation tools' }
];

const TOTAL_STEPS = 4;

const Onboarding = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [organization, setOrganization] = useState('');
    const [role, setRole] = useState('');
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [goals, setGoals] = useState('');

    const handleTrackToggle = (trackId) => {
        setSelectedTracks(prev =>
            prev.includes(trackId)
                ? prev.filter(id => id !== trackId)
                : [...prev, trackId]
        );
    };

    const handleComplete = async () => {
        const user = auth.currentUser;
        if (!user) { router.push('/'); return; }
        setSaving(true);
        try {
            await completeOnboarding(user.uid, {
                fullName, organization, role, selectedTracks, goals,
                completedAt: new Date().toISOString()
            });
        } catch (e) {
            console.error('Onboarding save error:', e);
        }
        router.push('/dashboard');
    };

    const canProceed = () => {
        if (currentStep === 0) return fullName && organization;
        if (currentStep === 1) return selectedTracks.length > 0;
        if (currentStep === 2) return goals;
        return true;
    };

    const inputClass = `w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${isDark
        ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-white/30'
        : 'bg-white border border-black/20 text-black placeholder-black/40 focus:ring-black/30'
    }`;

    const inputClassWithIcon = `w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${isDark
        ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-white/30'
        : 'bg-white border border-black/20 text-black placeholder-black/40 focus:ring-black/30'
    }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-md`} />

            <div className={`relative w-full max-w-3xl rounded-3xl ${
                isDark ? 'bg-black/60 border border-white/20' : 'bg-white/60 border border-black/10'
            } backdrop-blur-2xl shadow-2xl`}>

                {/* Progress */}
                <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                            Step {currentStep + 1} of {TOTAL_STEPS}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                            {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}%
                        </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isDark ? 'bg-white' : 'bg-black'}`}
                            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 min-h-[500px] flex flex-col">
                    <div className="flex-1">

                        {/* ── STEP 0: Welcome ── */}
                        {currentStep === 0 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                                            <Sparkles className={`w-12 h-12 ${isDark ? 'text-white' : 'text-black'}`} />
                                        </div>
                                    </div>
                                    <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        Welcome to Kimuntu
                                    </h1>
                                    <p className={`text-lg ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                        Let&#39;s personalize your experience
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-white/50' : 'text-black/50'}`} />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                placeholder="Enter your full name"
                                                autoComplete="off"
                                                className={inputClassWithIcon}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                            Organization
                                        </label>
                                        <div className="relative">
                                            <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-white/50' : 'text-black/50'}`} />
                                            <input
                                                type="text"
                                                value={organization}
                                                onChange={e => setOrganization(e.target.value)}
                                                placeholder="Company or institution"
                                                autoComplete="off"
                                                className={inputClassWithIcon}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                            Your Role (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            placeholder="e.g., Student, Professional"
                                            autoComplete="off"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 1: Tracks ── */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                                            <Target className={`w-12 h-12 ${isDark ? 'text-white' : 'text-black'}`} />
                                        </div>
                                    </div>
                                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        Choose Your Tracks
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                        Select areas you want to focus on
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TRACKS.map((track) => {
                                        const Icon = track.icon;
                                        const sel = selectedTracks.includes(track.id);
                                        return (
                                            <button
                                                key={track.id}
                                                type="button"
                                                onClick={() => handleTrackToggle(track.id)}
                                                className={`p-6 rounded-2xl text-left transition-all ${
                                                    sel
                                                        ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                                                        : isDark
                                                            ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                                                            : 'bg-white border border-black/20 hover:bg-black/5'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-lg ${sel ? (isDark ? 'bg-black/10' : 'bg-white/20') : (isDark ? 'bg-white/10' : 'bg-black/10')}`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-1">{track.label}</h3>
                                                        <p className={`text-sm ${sel ? 'opacity-70' : (isDark ? 'text-white/70' : 'text-black/70')}`}>
                                                            {track.desc}
                                                        </p>
                                                    </div>
                                                    {sel && <Check className="w-5 h-5 flex-shrink-0" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Goals ── */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                                            <Settings className={`w-12 h-12 ${isDark ? 'text-white' : 'text-black'}`} />
                                        </div>
                                    </div>
                                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        Your Goals
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                        What do you want to achieve?
                                    </p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                        Describe your main goals
                                    </label>
                                    <textarea
                                        value={goals}
                                        onChange={e => setGoals(e.target.value)}
                                        placeholder="e.g., Build my career, start a business..."
                                        rows={6}
                                        autoComplete="off"
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Complete ── */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                                            <Check className={`w-12 h-12 ${isDark ? 'text-white' : 'text-black'}`} />
                                        </div>
                                    </div>
                                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        All Set!
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                        Ready to start your journey
                                    </p>
                                </div>
                                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-black/20'}`}>
                                    <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Profile Summary</h3>
                                    <div className={`space-y-3 text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                        <div className="flex justify-between">
                                            <span>Name:</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{fullName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Organization:</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{organization}</span>
                                        </div>
                                        {role && (
                                            <div className="flex justify-between">
                                                <span>Role:</span>
                                                <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{role}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Tracks:</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                                                {selectedTracks.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Navigation */}
                    <div className={`flex justify-between items-center mt-8 pt-6 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(s => s - 1)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                currentStep === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : isDark
                                        ? 'bg-white/10 hover:bg-white/20 text-white'
                                        : 'bg-black/5 hover:bg-black/10 text-black'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>

                        {currentStep < TOTAL_STEPS - 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(s => s + 1)}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    canProceed()
                                        ? isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
                                        : isDark ? 'opacity-30 cursor-not-allowed bg-white/10 text-white/50' : 'opacity-30 cursor-not-allowed bg-black/10 text-black/50'
                                }`}
                            >
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={saving}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                                    isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
                                } disabled:opacity-50`}
                            >
                                {saving ? (
                                    <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Completing...</>
                                ) : (
                                    <>Get Started <Sparkles className="w-5 h-5" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Theme Toggle - Bottom Center */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={`p-3 rounded-full transition-all backdrop-blur-xl ${
                            isDark
                                ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                                : 'bg-black/5 hover:bg-black/10 border border-black/10'
                        }`}
                    >
                        {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-black" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
