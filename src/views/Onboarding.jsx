'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth, completeOnboarding } from '@/lib/firebase';
import { getMockSubscription, USE_REAL_PAYMENTS, hasActiveSubscription } from '@/lib/payments';
import Image from 'next/image';
import {
    Scale, Briefcase, TrendingUp, Rocket,
    ChevronRight, ChevronLeft, Check, User, Building2,
    Target, Settings, Sun, Moon, ArrowRight
} from 'lucide-react';

const TRACKS = [
    { id: 'legal', label: 'Legal Track', icon: Scale, desc: 'Research, case analysis, and AI-powered legal insights', gradient: 'from-violet-500 to-purple-500' },
    { id: 'career', label: 'Career Track', icon: Briefcase, desc: 'CV building, interview prep, and job matching', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'business', label: 'Business Track', icon: TrendingUp, desc: 'Business plans, market analysis, and branding', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'innovative', label: 'Innovative Track', icon: Rocket, desc: 'Project management and innovation tools', gradient: 'from-amber-500 to-orange-500' }
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

        // Paywall check: if user has active subscription → dashboard, otherwise → pricing
        const isSubscribed = await hasActiveSubscription(user.uid);
        if (isSubscribed) {
            router.push('/dashboard');
        } else {
            router.push('/dashboard/pricing');
        }
    };

    const canProceed = () => {
        if (currentStep === 0) return fullName && organization;
        if (currentStep === 1) return selectedTracks.length > 0;
        if (currentStep === 2) return goals;
        return true;
    };

    const inputClass = `w-full px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all ${isDark
        ? 'bg-white/[0.06] border border-emerald-500/20 text-white placeholder-white/30 focus:ring-emerald-500/30 focus:border-emerald-500/40 focus:bg-white/[0.08]'
        : 'bg-white border border-emerald-200/50 text-black placeholder-black/30 focus:ring-emerald-500/30 focus:border-emerald-500/50'
    }`;

    const inputClassWithIcon = `w-full pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all ${isDark
        ? 'bg-white/[0.06] border border-emerald-500/20 text-white placeholder-white/30 focus:ring-emerald-500/30 focus:border-emerald-500/40 focus:bg-white/[0.08]'
        : 'bg-white border border-emerald-200/50 text-black placeholder-black/30 focus:ring-emerald-500/30 focus:border-emerald-500/50'
    }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0">
                <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-gray-50/80'} backdrop-blur-xl`} />
                {/* Aurora orbs */}
                <div className={`absolute w-[500px] h-[500px] rounded-full blur-[150px] animate-aurora ${isDark ? 'bg-emerald-500/[0.08]' : 'bg-emerald-400/[0.06]'}`} style={{ top: '10%', left: '10%' }} />
                <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] animate-aurora-slow ${isDark ? 'bg-teal-500/[0.06]' : 'bg-teal-400/[0.05]'}`} style={{ bottom: '10%', right: '10%', animationDelay: '4s' }} />
            </div>

            {/* Card */}
            <div
                className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
                style={{
                    background: isDark
                        ? 'rgba(0, 0, 0, 0.6)'
                        : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: isDark
                        ? '1px solid rgba(16, 185, 129, 0.15)'
                        : '1px solid rgba(16, 185, 129, 0.1)',
                }}
            >
                {/* Glass reflection */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                {/* Progress bar */}
                <div className={`p-6 border-b ${isDark ? 'border-emerald-500/10' : 'border-emerald-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Image src="/assets/new_single_logo.png" alt="Kimuntu" width={36} height={36} />
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kimuntu</span>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                            Step {currentStep + 1} of {TOTAL_STEPS}
                        </span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-emerald-50'}`}>
                        <div
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 min-h-[480px] flex flex-col">
                    <div className="flex-1">

                        {/* STEP 0: Welcome */}
                        {currentStep === 0 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <Image src="/assets/new_single_logo.png" alt="Kimuntu" width={80} height={80} className="animate-float" />
                                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                                        </div>
                                    </div>
                                    <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Welcome to{' '}
                                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                            Kimuntu
                                        </span>
                                    </h1>
                                    <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        Let&apos;s personalize your experience
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-400/50' : 'text-emerald-500/50'}`} />
                                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" autoComplete="off" className={inputClassWithIcon} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                            Organization
                                        </label>
                                        <div className="relative">
                                            <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-400/50' : 'text-emerald-500/50'}`} />
                                            <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} placeholder="Company or institution" autoComplete="off" className={inputClassWithIcon} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                            Your Role <span className={isDark ? 'text-white/30' : 'text-black/30'}>(Optional)</span>
                                        </label>
                                        <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., Student, Professional" autoComplete="off" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Tracks */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                                            <Target className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        </div>
                                    </div>
                                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Choose Your Tracks
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        Select the areas you want to focus on
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
                                                className={`p-5 rounded-2xl text-left transition-all duration-300 ${
                                                    sel
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                                                        : isDark
                                                            ? 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-emerald-500/20'
                                                            : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md'
                                                }`}
                                                style={!sel ? {
                                                    backdropFilter: 'blur(20px)',
                                                    WebkitBackdropFilter: 'blur(20px)',
                                                } : {}}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-xl ${sel ? 'bg-white/20' : isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                                        <Icon className={`w-6 h-6 ${sel ? 'text-white' : isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-bold text-base mb-1 ${sel ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>{track.label}</h3>
                                                        <p className={`text-sm ${sel ? 'text-white/80' : isDark ? 'text-white/50' : 'text-black/50'}`}>
                                                            {track.desc}
                                                        </p>
                                                    </div>
                                                    {sel && (
                                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Goals */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                                            <Settings className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        </div>
                                    </div>
                                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Your Goals
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        What do you want to achieve?
                                    </p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                        Describe your main goals
                                    </label>
                                    <textarea
                                        value={goals}
                                        onChange={e => setGoals(e.target.value)}
                                        placeholder="e.g., Build my career, start a business, get legal insights..."
                                        rows={6}
                                        autoComplete="off"
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Summary */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <Image src="/assets/new_single_logo.png" alt="Kimuntu" width={72} height={72} className="animate-float" />
                                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                                        </div>
                                    </div>
                                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        All Set!
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        Ready to start your journey
                                    </p>
                                </div>
                                <div
                                    className="p-6 rounded-2xl"
                                    style={{
                                        background: isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.03)',
                                        border: isDark ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(16, 185, 129, 0.1)',
                                    }}
                                >
                                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Check className="w-5 h-5 text-emerald-500" />
                                        Profile Summary
                                    </h3>
                                    <div className={`space-y-3 text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        <div className="flex justify-between">
                                            <span>Name:</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{fullName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Organization:</span>
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{organization}</span>
                                        </div>
                                        {role && (
                                            <div className="flex justify-between">
                                                <span>Role:</span>
                                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{role}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Tracks:</span>
                                            <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {selectedTracks.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Navigation */}
                    <div className={`flex justify-between items-center mt-8 pt-6 border-t ${isDark ? 'border-emerald-500/10' : 'border-emerald-100'}`}>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(s => s - 1)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                currentStep === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : isDark
                                        ? 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        {currentStep < TOTAL_STEPS - 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(s => s + 1)}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                    canProceed()
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]'
                                        : 'opacity-30 cursor-not-allowed bg-gray-300 text-gray-500'
                                }`}
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up...</>
                                ) : (
                                    <>Get Started <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Theme Toggle */}
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={`p-3 rounded-full transition-all backdrop-blur-xl ${
                            isDark
                                ? 'bg-white/10 hover:bg-white/20 border border-emerald-500/20'
                                : 'bg-white/80 hover:bg-white border border-emerald-200/50 shadow-lg'
                        }`}
                    >
                        {isDark ? <Sun className="w-5 h-5 text-emerald-400" /> : <Moon className="w-5 h-5 text-emerald-600" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
