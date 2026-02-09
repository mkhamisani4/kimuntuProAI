'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Sparkles,
    Compass,
    Scale,
    Globe,
    ShieldCheck,
    Settings,
    CheckCircle2,
    User,
    GraduationCap,
    Briefcase,
    Search,
    TrendingUp,
    Rocket,
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    Check,
    MessageSquare,
    BookOpen,
    FileText,
    Zap,
    Star,
    SkipForward
} from 'lucide-react';

// ─── Step metadata for progress bar ────────────────────────────────────────────
const STEP_META = [
    { label: 'Welcome', icon: Sparkles },
    { label: 'Profile', icon: User },
    { label: 'Tracks', icon: Compass },
    { label: 'Jurisdiction', icon: Globe },
    { label: 'Preferences', icon: Settings },
    { label: 'Launch', icon: CheckCircle2 }
];

const TOTAL_STEPS = STEP_META.length;

// ─── Data constants ────────────────────────────────────────────────────────────
const ROLES = [
    { id: 'legal-pro', label: 'Legal Professional', icon: Scale, desc: 'Lawyers, attorneys, and barristers' },
    { id: 'student', label: 'Law Student', icon: GraduationCap, desc: 'Students and academic researchers' },
    { id: 'paralegal', label: 'Paralegal', icon: Briefcase, desc: 'Paralegals and legal assistants' },
    { id: 'researcher', label: 'Researcher', icon: Search, desc: 'Policy analysts and investigators' }
];

const ORG_TYPES = [
    'Law Firm', 'Government', 'Academic', 'Non-Profit', 'Corporate', 'Independent'
];

const TRACKS = [
    {
        id: 'legal',
        label: 'Legal Track',
        icon: Scale,
        desc: 'Criminal law research, case analysis, AI-powered legal insights',
        color: 'purple'
    },
    {
        id: 'career',
        label: 'Career Track',
        icon: Briefcase,
        desc: 'CV building, interview prep, job matching for legal professionals',
        color: 'blue'
    },
    {
        id: 'business',
        label: 'Business Track',
        icon: TrendingUp,
        desc: 'Business plans, market analysis, branding for legal ventures',
        color: 'emerald'
    },
    {
        id: 'innovative',
        label: 'Innovative Track',
        icon: Rocket,
        desc: 'Project management, innovation tools, and future-forward workflows',
        color: 'amber'
    }
];

const JURISDICTIONS = [
    {
        id: 'canada',
        flag: '\u{1F1E8}\u{1F1E6}',
        label: 'Canada',
        sources: ['Criminal Code (R.S.C.)', 'Canadian Charter of Rights', 'Supreme Court of Canada', 'Provincial Statutes'],
        accent: 'red'
    },
    {
        id: 'us',
        flag: '\u{1F1FA}\u{1F1F8}',
        label: 'United States',
        sources: ['Title 18 U.S. Code', 'U.S. Constitution', 'State Criminal Statutes', 'Federal Sentencing Guidelines'],
        accent: 'blue'
    },
    {
        id: 'both',
        flag: '\u{1F30E}',
        label: 'Both Jurisdictions',
        sources: ['Full comparative analysis', 'Cross-border considerations', 'Dual-jurisdiction case law', 'Treaty and extradition law'],
        accent: 'purple'
    }
];

const TONE_OPTIONS = ['Professional', 'Academic', 'Conversational'];
const DETAIL_OPTIONS = ['Summary', 'Standard', 'Comprehensive'];
const CITATION_OPTIONS = ['Inline Citations', 'Footnotes', 'Source List'];

// ─── Main Component ────────────────────────────────────────────────────────────
const Onboarding = () => {
    const { isDark } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState('forward');

    // Step 1 state
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedOrg, setSelectedOrg] = useState(null);

    // Step 2 state
    const [selectedTracks, setSelectedTracks] = useState([]);

    // Step 3 state
    const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);

    // Step 4 state
    const [selectedTone, setSelectedTone] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [selectedCitation, setSelectedCitation] = useState(null);

    // Animation mount state
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Floating element animation seed
    const [floatPhase, setFloatPhase] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setFloatPhase((p) => p + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // ─── Navigation ────────────────────────────────────────────────────────────
    const goTo = useCallback((step, direction) => {
        if (step < 0 || step >= TOTAL_STEPS) return;
        setTransitionDirection(direction || (step > currentStep ? 'forward' : 'backward'));
        setTransitioning(true);
        setTimeout(() => {
            setCurrentStep(step);
            setTransitioning(false);
        }, 250);
    }, [currentStep]);

    const goNext = useCallback(() => goTo(currentStep + 1, 'forward'), [currentStep, goTo]);
    const goBack = useCallback(() => goTo(currentStep - 1, 'backward'), [currentStep, goTo]);

    const canProceed = useCallback(() => {
        switch (currentStep) {
            case 0: return true;
            case 1: return selectedRole !== null;
            case 2: return selectedTracks.length > 0;
            case 3: return selectedJurisdiction !== null;
            case 4: return selectedTone !== null && selectedDetail !== null && selectedCitation !== null;
            case 5: return true;
            default: return true;
        }
    }, [currentStep, selectedRole, selectedTracks, selectedJurisdiction, selectedTone, selectedDetail, selectedCitation]);

    const isSkippable = useCallback(() => {
        return currentStep === 1 || currentStep === 4;
    }, [currentStep]);

    const toggleTrack = useCallback((trackId) => {
        setSelectedTracks((prev) =>
            prev.includes(trackId)
                ? prev.filter((t) => t !== trackId)
                : [...prev, trackId]
        );
    }, []);

    // ─── Shared style helpers ──────────────────────────────────────────────────
    const cardBase = `relative rounded-2xl border backdrop-blur-xl transition-all duration-300 cursor-pointer`;
    const cardIdle = isDark
        ? 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
        : 'bg-white/60 border-gray-200 hover:bg-white/80 hover:border-gray-300';
    const cardSelected = isDark
        ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/20'
        : 'bg-purple-50 border-purple-500 shadow-lg shadow-purple-200';

    const pillBase = `px-4 py-2.5 rounded-xl border backdrop-blur-xl transition-all duration-300 cursor-pointer text-sm font-medium`;
    const pillIdle = isDark
        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
        : 'bg-white/60 border-gray-200 hover:bg-white/80 text-gray-700';
    const pillSelected = isDark
        ? 'bg-purple-500/15 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/10'
        : 'bg-purple-50 border-purple-500 text-purple-700 shadow-md shadow-purple-100';

    const headingColor = isDark ? 'text-white' : 'text-gray-900';
    const subColor = isDark ? 'text-gray-400' : 'text-gray-500';
    const bodyColor = isDark ? 'text-gray-300' : 'text-gray-700';
    const iconColor = isDark ? 'text-purple-300' : 'text-purple-600';

    // ─── Transition wrapper ────────────────────────────────────────────────────
    const transitionStyle = {
        opacity: transitioning ? 0 : 1,
        transform: transitioning
            ? transitionDirection === 'forward'
                ? 'translateX(40px)'
                : 'translateX(-40px)'
            : 'translateX(0)',
        transition: 'opacity 0.25s ease, transform 0.25s ease'
    };

    // ─── Floating orbs background ──────────────────────────────────────────────
    const FloatingOrbs = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className={`absolute w-72 h-72 rounded-full blur-3xl ${isDark ? 'bg-purple-500/8' : 'bg-purple-200/40'}`}
                style={{
                    top: '-5%',
                    right: '-5%',
                    transform: `translate(${Math.sin(floatPhase * 0.5) * 10}px, ${Math.cos(floatPhase * 0.5) * 10}px)`
                }}
            />
            <div
                className={`absolute w-60 h-60 rounded-full blur-3xl ${isDark ? 'bg-pink-500/8' : 'bg-pink-200/30'}`}
                style={{
                    bottom: '-8%',
                    left: '-3%',
                    transform: `translate(${Math.cos(floatPhase * 0.7) * 12}px, ${Math.sin(floatPhase * 0.7) * 12}px)`
                }}
            />
            <div
                className={`absolute w-40 h-40 rounded-full blur-3xl ${isDark ? 'bg-indigo-500/6' : 'bg-indigo-200/30'}`}
                style={{
                    top: '40%',
                    left: '60%',
                    transform: `translate(${Math.sin(floatPhase * 0.3) * 8}px, ${Math.cos(floatPhase * 0.3) * 8}px)`
                }}
            />
        </div>
    );

    // ─── Glass reflection overlay ──────────────────────────────────────────────
    const GlassOverlay = () => (
        <div className={`absolute inset-0 rounded-2xl ${isDark
            ? 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
            : 'bg-gradient-to-br from-white/60 via-transparent to-transparent'
        } pointer-events-none`} />
    );

    // ─── Progress Bar ──────────────────────────────────────────────────────────
    const ProgressBar = () => {
        const progress = ((currentStep) / (TOTAL_STEPS - 1)) * 100;

        return (
            <div className={`relative p-6 rounded-2xl border backdrop-blur-xl mb-8 ${isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white/60 border-gray-200'
            }`}>
                <GlassOverlay />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-medium ${bodyColor}`}>
                            Step {currentStep + 1} of {TOTAL_STEPS}
                        </span>
                        <span className={`text-sm font-medium ${iconColor}`}>
                            {STEP_META[currentStep].label}
                        </span>
                    </div>

                    {/* Bar */}
                    <div className={`h-2 rounded-full overflow-hidden mb-6 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                                width: `${progress}%`,
                                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                            }}
                        />
                    </div>

                    {/* Step dots */}
                    <div className="flex items-center justify-between">
                        {STEP_META.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (isCompleted) goTo(index, index < currentStep ? 'backward' : 'forward');
                                    }}
                                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500 text-white scale-100'
                                            : isCurrent
                                                ? isDark
                                                    ? 'border-purple-400 bg-purple-500/20 text-purple-300 scale-110'
                                                    : 'border-purple-500 bg-purple-50 text-purple-600 scale-110'
                                                : isDark
                                                    ? 'border-white/20 bg-white/5 text-gray-500'
                                                    : 'border-gray-300 bg-gray-50 text-gray-400'
                                    }`}>
                                        {isCompleted ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <StepIcon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${
                                        isCurrent ? iconColor
                                            : isCompleted
                                                ? isDark ? 'text-purple-300' : 'text-purple-600'
                                                : isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        {step.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ─── Navigation Buttons ────────────────────────────────────────────────────
    const NavButtons = () => (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <div>
                {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
                    <button
                        onClick={goBack}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${isDark
                            ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                )}
            </div>
            <div className="flex items-center gap-3">
                {isSkippable() && (
                    <button
                        onClick={goNext}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isDark
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <SkipForward className="w-4 h-4" />
                        Skip
                    </button>
                )}
                {currentStep < TOTAL_STEPS - 1 && (
                    <button
                        onClick={goNext}
                        disabled={!canProceed()}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            canProceed()
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                                : isDark
                                    ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                    >
                        {currentStep === 0 ? 'Get Started' : 'Next'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 0: Welcome
    // ═══════════════════════════════════════════════════════════════════════════
    const StepWelcome = () => (
        <div className="relative">
            <FloatingOrbs />
            <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 border ${isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white/70 border-gray-200'
            }`}>
                <div className={`absolute inset-0 ${isDark
                    ? 'bg-gradient-to-br from-purple-500/15 via-transparent to-pink-500/15'
                    : 'bg-gradient-to-br from-purple-100/80 via-white/60 to-pink-100/80'
                } pointer-events-none`} />

                {/* Decorative floating icons */}
                <div className="absolute top-8 right-8 opacity-20 pointer-events-none hidden md:block">
                    <Scale className="w-16 h-16 text-purple-400" style={{
                        transform: `rotate(${12 + Math.sin(floatPhase * 0.5) * 5}deg) translate(${Math.sin(floatPhase * 0.4) * 6}px, ${Math.cos(floatPhase * 0.4) * 6}px)`
                    }} />
                </div>
                <div className="absolute bottom-12 right-24 opacity-15 pointer-events-none hidden md:block">
                    <Globe className="w-12 h-12 text-pink-400" style={{
                        transform: `translate(${Math.cos(floatPhase * 0.6) * 8}px, ${Math.sin(floatPhase * 0.6) * 8}px)`
                    }} />
                </div>
                <div className="absolute top-20 right-40 opacity-10 pointer-events-none hidden lg:block">
                    <BookOpen className="w-10 h-10 text-indigo-400" style={{
                        transform: `translate(${Math.sin(floatPhase * 0.3) * 5}px, ${Math.cos(floatPhase * 0.3) * 5}px)`
                    }} />
                </div>

                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                            <Sparkles className={`w-7 h-7 ${iconColor}`} />
                        </div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border font-medium ${isDark
                            ? 'bg-white/5 border-white/10 text-purple-200'
                            : 'bg-white/80 border-gray-200 text-purple-700'
                        }`}>
                            <Zap className="w-3 h-3" />
                            Interactive Setup Wizard
                        </span>
                    </div>

                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${headingColor}`}>
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                            KimuntuPro AI
                        </span>
                    </h1>

                    <p className={`text-lg md:text-xl leading-relaxed mb-8 max-w-2xl ${bodyColor}`}>
                        Your intelligent legal research companion for criminal law across Canada and the United States.
                        Let us configure your workspace in a few simple steps.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[
                            { icon: Scale, label: 'AI-Powered Legal Research' },
                            { icon: Globe, label: 'Bi-National Coverage' },
                            { icon: ShieldCheck, label: 'Citation-Backed Answers' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-xl border ${isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/60 border-gray-200'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${iconColor}`} />
                                <span className={`text-sm font-medium ${headingColor}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={goNext}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 1: Profile Setup
    // ═══════════════════════════════════════════════════════════════════════════
    const StepProfile = () => (
        <div>
            <div className="mb-8">
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${headingColor}`}>
                    Profile Setup
                </h2>
                <p className={`text-base ${subColor}`}>
                    Tell us about yourself so we can tailor the experience to your needs.
                </p>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    What is your role?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ROLES.map((role) => {
                        const isActive = selectedRole === role.id;
                        const RoleIcon = role.icon;

                        return (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`${cardBase} p-5 text-left ${isActive ? cardSelected : cardIdle}`}
                                style={{
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
                                }}
                            >
                                <GlassOverlay />
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                        isActive
                                            ? 'bg-purple-500/30'
                                            : isDark ? 'bg-white/10' : 'bg-gray-100'
                                    }`}>
                                        <RoleIcon className={`w-6 h-6 transition-colors duration-300 ${
                                            isActive ? 'text-purple-300' : iconColor
                                        }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`font-semibold ${headingColor}`}>{role.label}</h4>
                                            {isActive && (
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-sm mt-1 ${subColor}`}>{role.desc}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Organization Type */}
            <div>
                <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    Organization type <span className={`text-sm font-normal ${subColor}`}>(optional)</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                    {ORG_TYPES.map((org) => {
                        const isActive = selectedOrg === org;
                        return (
                            <button
                                key={org}
                                onClick={() => setSelectedOrg(isActive ? null : org)}
                                className={`${pillBase} ${isActive ? pillSelected : pillIdle}`}
                                style={{
                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isActive && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                                {org}
                            </button>
                        );
                    })}
                </div>
            </div>

            <NavButtons />
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 2: Choose Your Track
    // ═══════════════════════════════════════════════════════════════════════════
    const StepTracks = () => (
        <div>
            <div className="mb-8">
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${headingColor}`}>
                    Choose Your Track
                </h2>
                <p className={`text-base ${subColor}`}>
                    Select one or more tracks to customize your workspace. You can always change these later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {TRACKS.map((track) => {
                    const isActive = selectedTracks.includes(track.id);
                    const TrackIcon = track.icon;

                    return (
                        <button
                            key={track.id}
                            onClick={() => toggleTrack(track.id)}
                            className={`${cardBase} p-6 text-left ${isActive ? cardSelected : cardIdle}`}
                            style={{
                                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
                            }}
                        >
                            <GlassOverlay />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                                        isActive
                                            ? 'bg-purple-500/30'
                                            : isDark ? 'bg-white/10' : 'bg-gray-100'
                                    }`}>
                                        <TrackIcon className={`w-6 h-6 ${
                                            isActive ? 'text-purple-300' : iconColor
                                        }`} />
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500'
                                            : isDark
                                                ? 'border-white/20 bg-transparent'
                                                : 'border-gray-300 bg-transparent'
                                    }`}>
                                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </div>
                                <h4 className={`text-lg font-semibold mb-2 ${headingColor}`}>{track.label}</h4>
                                <p className={`text-sm leading-relaxed ${subColor}`}>{track.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {selectedTracks.length > 0 && (
                <div className={`mt-5 p-3 rounded-xl border text-sm ${isDark
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                    : 'bg-purple-50 border-purple-200 text-purple-700'
                }`}>
                    <Star className="w-4 h-4 inline mr-2" />
                    {selectedTracks.length} track{selectedTracks.length > 1 ? 's' : ''} selected
                </div>
            )}

            <NavButtons />
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 3: Jurisdiction Selection
    // ═══════════════════════════════════════════════════════════════════════════
    const StepJurisdiction = () => (
        <div>
            <div className="mb-8">
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${headingColor}`}>
                    Jurisdiction Selection
                </h2>
                <p className={`text-base ${subColor}`}>
                    Choose which legal jurisdictions you want to research. This determines which sources and databases are prioritized.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {JURISDICTIONS.map((jur) => {
                    const isActive = selectedJurisdiction === jur.id;

                    return (
                        <button
                            key={jur.id}
                            onClick={() => setSelectedJurisdiction(jur.id)}
                            className={`${cardBase} p-6 text-left ${isActive ? cardSelected : cardIdle}`}
                            style={{
                                transform: isActive ? 'scale(1.03)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
                            }}
                        >
                            <GlassOverlay />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">{jur.flag}</span>
                                    {isActive && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>

                                <h4 className={`text-lg font-semibold mb-3 ${headingColor}`}>{jur.label}</h4>

                                <ul className="space-y-2">
                                    {jur.sources.map((source, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${
                                                isActive
                                                    ? 'bg-purple-400'
                                                    : isDark ? 'bg-gray-500' : 'bg-gray-400'
                                            }`} />
                                            <span className={`text-sm ${isActive ? bodyColor : subColor}`}>
                                                {source}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </button>
                    );
                })}
            </div>

            <NavButtons />
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 4: AI Preferences
    // ═══════════════════════════════════════════════════════════════════════════
    const StepPreferences = () => {
        const renderOptionRow = (title, description, options, selected, onSelect) => (
            <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-1 ${headingColor}`}>{title}</h3>
                <p className={`text-sm mb-4 ${subColor}`}>{description}</p>
                <div className="flex flex-wrap gap-3">
                    {options.map((option) => {
                        const isActive = selected === option;
                        return (
                            <button
                                key={option}
                                onClick={() => onSelect(option)}
                                className={`${pillBase} ${isActive ? pillSelected : pillIdle}`}
                                style={{
                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isActive && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        );

        return (
            <div>
                <div className="mb-8">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${headingColor}`}>
                        AI Preferences
                    </h2>
                    <p className={`text-base ${subColor}`}>
                        Customize how the AI assistant communicates with you. These can be adjusted anytime in settings.
                    </p>
                </div>

                <div className={`p-6 rounded-2xl border backdrop-blur-xl ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-gray-200'
                }`}>
                    <GlassOverlay />
                    <div className="relative z-10">
                        {renderOptionRow(
                            'Response Tone',
                            'How should the AI communicate with you?',
                            TONE_OPTIONS,
                            selectedTone,
                            setSelectedTone
                        )}
                        {renderOptionRow(
                            'Detail Level',
                            'How thorough should responses be?',
                            DETAIL_OPTIONS,
                            selectedDetail,
                            setSelectedDetail
                        )}
                        {renderOptionRow(
                            'Citation Format',
                            'How should legal sources be referenced?',
                            CITATION_OPTIONS,
                            selectedCitation,
                            setSelectedCitation
                        )}
                    </div>
                </div>

                {selectedTone && selectedDetail && selectedCitation && (
                    <div className={`mt-5 p-4 rounded-xl border ${isDark
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-purple-50 border-purple-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className={`w-4 h-4 ${iconColor}`} />
                            <span className={`text-sm font-medium ${headingColor}`}>Preview</span>
                        </div>
                        <p className={`text-sm ${bodyColor}`}>
                            Responses will be <span className="font-semibold">{selectedTone.toLowerCase()}</span> in tone,
                            at <span className="font-semibold">{selectedDetail.toLowerCase()}</span> detail,
                            with <span className="font-semibold">{selectedCitation.toLowerCase()}</span>.
                        </p>
                    </div>
                )}

                <NavButtons />
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 5: Launch / All Set
    // ═══════════════════════════════════════════════════════════════════════════
    const StepLaunch = () => {
        const selectedRoleLabel = ROLES.find((r) => r.id === selectedRole)?.label || 'Not set';
        const selectedTrackLabels = TRACKS.filter((t) => selectedTracks.includes(t.id)).map((t) => t.label);
        const selectedJurLabel = JURISDICTIONS.find((j) => j.id === selectedJurisdiction)?.label || 'Not set';

        const summaryItems = [
            { label: 'Role', value: selectedRoleLabel },
            { label: 'Organization', value: selectedOrg || 'Not specified' },
            { label: 'Tracks', value: selectedTrackLabels.length > 0 ? selectedTrackLabels.join(', ') : 'Not set' },
            { label: 'Jurisdiction', value: selectedJurLabel },
            { label: 'Tone', value: selectedTone || 'Default' },
            { label: 'Detail', value: selectedDetail || 'Default' },
            { label: 'Citations', value: selectedCitation || 'Default' }
        ];

        return (
            <div className="relative">
                <FloatingOrbs />

                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 border text-center ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/70 border-gray-200'
                }`}>
                    <div className={`absolute inset-0 ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10'
                        : 'bg-gradient-to-br from-purple-100/60 via-white/60 to-pink-100/60'
                    } pointer-events-none`} />

                    <div className="relative z-10">
                        {/* Animated checkmark */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
                                style={{
                                    animation: mounted ? 'none' : undefined,
                                    transform: 'scale(1)',
                                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${headingColor}`}>
                            You&apos;re All Set!
                        </h2>
                        <p className={`text-lg mb-8 max-w-xl mx-auto ${bodyColor}`}>
                            Your workspace is configured and ready. Here is a summary of your selections.
                        </p>

                        {/* Summary grid */}
                        <div className={`max-w-2xl mx-auto p-6 rounded-2xl border backdrop-blur-xl mb-8 text-left ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                        }`}>
                            <GlassOverlay />
                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {summaryItems.map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <span className={`text-xs font-medium uppercase tracking-wider ${subColor}`}>
                                            {item.label}
                                        </span>
                                        <span className={`text-sm font-semibold ${headingColor}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="/dashboard"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                            >
                                <Zap className="w-5 h-5" />
                                Launch Dashboard
                            </a>
                            <a
                                href="/chat"
                                className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${isDark
                                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                Try Legal AI Demo
                            </a>
                            <a
                                href="/research"
                                className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${isDark
                                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <FileText className="w-5 h-5" />
                                Explore Research
                            </a>
                        </div>
                    </div>
                </div>

                {/* Back to edit */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={goBack}
                        className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${isDark
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Go back and edit selections
                    </button>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════════════════
    const renderStep = () => {
        switch (currentStep) {
            case 0: return <StepWelcome />;
            case 1: return <StepProfile />;
            case 2: return <StepTracks />;
            case 3: return <StepJurisdiction />;
            case 4: return <StepPreferences />;
            case 5: return <StepLaunch />;
            default: return <StepWelcome />;
        }
    };

    return (
        <PageWrapper title="Onboarding">
            <div className={`${bodyColor} max-w-5xl mx-auto`}>
                {/* Progress bar (hidden on welcome and launch) */}
                {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
                    <ProgressBar />
                )}

                {/* Step content with transition */}
                <div style={transitionStyle}>
                    {renderStep()}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Onboarding;
