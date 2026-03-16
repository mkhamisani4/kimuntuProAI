'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle,
    Mail, Lock, Chrome, BarChart, Shield, Sun, Moon, Rocket,
    Sparkles, Zap, Brain, Target, ArrowRight, CheckCircle2,
    Globe, Star, ChevronDown, Play, Award, Lightbulb,
    Building2, GraduationCap, Gavel, LineChart, Bot, Layers
} from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser, hasCompletedOnboarding } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@/components/providers/ThemeProvider';
import Footer from '@/components/Footer';
import Image from 'next/image';

function useInView(options = {}) {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        if (!ref.current) {
            // Fallback: if ref not attached, show content anyway
            setIsInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.05, ...options });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, isInView];
}

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const [ref, isInView] = useInView();
    useEffect(() => {
        if (!isInView) return;
        let startTime;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, end, duration]);
    return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [heroRef, heroInView] = useInView();
    const [featuresRef, featuresInView] = useInView();
    const [statsRef, statsInView] = useInView();
    const [tracksRef, tracksInView] = useInView();
    const [ctaRef, ctaInView] = useInView();
    const [testimonialsRef, testimonialsInView] = useInView();

    const authSectionRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const completedOnboarding = await hasCompletedOnboarding(currentUser.uid);
                if (!completedOnboarding) {
                    router.push('/onboarding');
                } else {
                    router.push('/dashboard');
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleMouse = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouse);
        return () => window.removeEventListener('mousemove', handleMouse);
    }, []);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setAuthLoading(true);
        try {
            if (isLogin) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            setEmail('');
            setPassword('');
        } catch (err) {
            const errorCode = err.code;
            let friendlyMessage = '';
            if (errorCode === 'auth/invalid-credential') {
                friendlyMessage = "Doesn't look like you have an account with us. Please sign up or check your credentials.";
            } else if (errorCode === 'auth/email-already-in-use') {
                friendlyMessage = "This email is already registered. Please sign in instead or use a different email.";
            } else if (errorCode === 'auth/weak-password') {
                friendlyMessage = "Password should be at least 6 characters long.";
            } else if (errorCode === 'auth/invalid-email') {
                friendlyMessage = "Please enter a valid email address.";
            } else if (errorCode === 'auth/user-not-found') {
                friendlyMessage = "No account found with this email. Please sign up first.";
            } else if (errorCode === 'auth/wrong-password') {
                friendlyMessage = "Incorrect password. Please try again.";
            } else {
                friendlyMessage = err.message || 'Authentication failed. Please try again.';
            }
            setError(friendlyMessage);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setAuthLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !authLoading) {
            handleEmailAuth();
        }
    };

    const scrollToAuth = () => {
        authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const tracks = [
        {
            icon: GraduationCap,
            title: 'Career Development',
            description: 'AI-powered resume building, smart job matching, and realistic interview simulations to accelerate your professional growth.',
            features: ['Resume Builder', 'Job Matching', 'Interview Prep', 'Skill Analysis'],
            gradient: 'from-blue-500 to-cyan-500',
            iconBg: 'bg-blue-500/10 border-blue-500/20',
            iconColor: 'text-blue-400',
        },
        {
            icon: Building2,
            title: 'Business Growth',
            description: 'From business plans to market analysis, funding strategy to AI-generated websites and logos for your brand.',
            features: ['Business Plans', 'Market Analysis', 'Website Builder', 'Logo Studio'],
            gradient: 'from-emerald-500 to-teal-500',
            iconBg: 'bg-emerald-500/10 border-emerald-500/20',
            iconColor: 'text-emerald-400',
        },
        {
            icon: Gavel,
            title: 'Legal Support',
            description: 'Intelligent contract review, document analysis, and compliance checking with AI-driven legal insights.',
            features: ['Contract Review', 'Document Analysis', 'Compliance Check', 'Legal Q&A'],
            gradient: 'from-violet-500 to-purple-500',
            iconBg: 'bg-violet-500/10 border-violet-500/20',
            iconColor: 'text-violet-400',
        },
        {
            icon: Lightbulb,
            title: 'Innovation Hub',
            description: 'Turn ideas into reality with AI-assisted project management, brainstorming, and innovation tracking.',
            features: ['Idea Management', 'Project Tracking', 'AI Brainstorm', 'Roadmap Builder'],
            gradient: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-500/10 border-amber-500/20',
            iconColor: 'text-amber-400',
        },
    ];

    const features = [
        { icon: Brain, title: 'AI-Powered Intelligence', description: 'Leveraging GPT-4 and Claude for deep insights across every domain.' },
        { icon: Zap, title: 'Lightning Fast', description: 'Get instant AI-powered responses and generated content in seconds.' },
        { icon: Shield, title: 'Enterprise Security', description: 'SOC2 compliant, GDPR ready, with end-to-end encryption.' },
        { icon: Globe, title: 'Multi-Language', description: 'Full support for English and French with more languages coming.' },
        { icon: Layers, title: 'All-in-One Platform', description: 'Career, business, legal, and innovation tools in a single platform.' },
        { icon: Bot, title: 'AI Assistant 24/7', description: 'Always-available AI chatbot ready to help with any question.' },
    ];

    const testimonials = [
        { name: 'Sarah M.', role: 'Startup Founder', text: 'Kimuntu helped me create a professional business plan and website in hours, not weeks.', rating: 5 },
        { name: 'James K.', role: 'Software Engineer', text: 'The career track completely transformed my resume and landing me interviews at top companies.', rating: 5 },
        { name: 'Amara D.', role: 'Legal Consultant', text: 'The contract review feature saves me hours of manual document analysis every single week.', rating: 5 },
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Image src="/assets/LOGOS(9).svg" alt="Kimuntu" width={80} height={80} className="animate-float" />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                    </div>
                    <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>

            {/* ====== AURORA BACKGROUND ====== */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] animate-aurora ${isDark ? 'bg-emerald-600/15' : 'bg-emerald-400/10'}`}
                    style={{ top: '10%', left: '20%' }}
                />
                <div
                    className={`absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-aurora-slow ${isDark ? 'bg-teal-600/10' : 'bg-teal-400/8'}`}
                    style={{ top: '50%', right: '10%', animationDelay: '4s' }}
                />
                <div
                    className={`absolute w-[400px] h-[400px] rounded-full blur-[80px] animate-aurora ${isDark ? 'bg-cyan-600/8' : 'bg-cyan-400/6'}`}
                    style={{ bottom: '10%', left: '40%', animationDelay: '8s' }}
                />
                {/* Subtle mouse-follow glow */}
                <div
                    className={`absolute w-[300px] h-[300px] rounded-full blur-[100px] transition-all duration-[2000ms] ease-out ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-400/5'}`}
                    style={{ left: mousePos.x - 150, top: mousePos.y - 150 }}
                />
            </div>

            {/* ====== STICKY NAVIGATION ====== */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDark
                ? 'bg-black/60 border-white/10'
                : 'bg-white/60 border-black/5'
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Image src="/assets/LOGOS(9).svg" alt="Kimuntu Logo" width={40} height={40} />
                        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            KimuntuPro
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl transition-all ${isDark
                                ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                                : 'bg-black/5 border border-black/5 hover:bg-black/10'
                            }`}
                        >
                            {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
                        </button>
                        <button
                            onClick={scrollToAuth}
                            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${isDark
                                ? 'bg-white text-black hover:bg-white/90'
                                : 'bg-black text-white hover:bg-black/90'
                            }`}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* ====== HERO SECTION ====== */}
            <section ref={heroRef} className="relative z-10 pt-20 pb-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Badge */}
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${isDark
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-emerald-50 border border-emerald-200'
                        }`}
                        style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}
                    >
                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            AI-Powered Professional Platform
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6 ${isDark ? 'text-white' : 'text-black'}`} style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s' }}>
                        Empowering Your
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent text-gradient-animate">
                            Future with AI
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 ${isDark ? 'text-white/60' : 'text-black/60'}`} style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s' }}>
                        Career development, business growth, legal assistance, and innovation
                        — all powered by cutting-edge artificial intelligence in one platform.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center mb-16" style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s' }}>
                        <button
                            onClick={scrollToAuth}
                            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                Start Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className={`px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-105 ${isDark
                                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                : 'bg-black/5 border border-black/5 text-black hover:bg-black/10'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Play className="w-5 h-5" />
                                See How It Works
                            </span>
                        </button>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-3 justify-center" style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s' }}>
                        {[
                            { icon: Briefcase, label: 'Career Development', color: 'text-blue-400' },
                            { icon: BarChart, label: 'Business Planning', color: 'text-emerald-400' },
                            { icon: Scale, label: 'Legal Support', color: 'text-violet-400' },
                            { icon: Rocket, label: 'Innovation Hub', color: 'text-amber-400' },
                        ].map((pill, i) => (
                            <div key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${isDark
                                ? 'bg-white/5 border border-white/10'
                                : 'bg-white border border-black/5 shadow-sm'
                            }`}>
                                <pill.icon className={`w-4 h-4 ${pill.color}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                                    {pill.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== STATS SECTION ====== */}
            <section ref={statsRef} className="relative z-10 py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl ${isDark
                        ? 'glass-card'
                        : 'bg-white border border-black/5 shadow-lg'
                    }`}>
                        {[
                            { value: 10, suffix: 'K+', label: 'Active Users' },
                            { value: 50, suffix: 'K+', label: 'Documents Generated' },
                            { value: 99, suffix: '%', label: 'Uptime' },
                            { value: 4, suffix: '.9', label: 'User Rating' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center" style={{ opacity: statsInView ? 1 : 0, transform: statsInView ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
                                <div className={`text-3xl sm:text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== FEATURES GRID ====== */}
            <section id="features" ref={featuresRef} className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`} style={{ opacity: featuresInView ? 1 : 0, transform: featuresInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
                            Why Choose{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                KimuntuPro
                            </span>
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/50' : 'text-black/50'}`} style={{ opacity: featuresInView ? 1 : 0, transform: featuresInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s' }}>
                            A single platform that combines AI power with professional tools
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`group relative p-6 rounded-2xl transition-all duration-300 card-hover ${isDark
                                    ? 'glass-card hover:bg-white/[0.08]'
                                    : 'bg-white border border-black/5 shadow-sm hover:shadow-lg'
                                }`}
                                style={{ opacity: featuresInView ? 1 : 0, transform: featuresInView ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${0.1 + i * 0.08}s, transform 0.6s ease ${0.1 + i * 0.08}s` }}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-emerald-50 border border-emerald-100'
                                }`}>
                                    <feature.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                    {feature.title}
                                </h3>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== TRACKS / PRODUCT SHOWCASE ====== */}
            <section ref={tracksRef} className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`} style={{ opacity: tracksInView ? 1 : 0, transform: tracksInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
                            Four Powerful{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                AI Tracks
                            </span>
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/50' : 'text-black/50'}`} style={{ opacity: tracksInView ? 1 : 0, transform: tracksInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s' }}>
                            Specialized AI tools for every aspect of your professional journey
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {tracks.map((track, i) => (
                            <div
                                key={i}
                                className={`group relative p-8 rounded-3xl card-hover overflow-hidden ${isDark
                                    ? 'glass-card hover:bg-white/[0.08]'
                                    : 'bg-white border border-black/5 shadow-sm hover:shadow-xl'
                                }`}
                                style={{ opacity: tracksInView ? 1 : 0, transform: tracksInView ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${0.1 + i * 0.12}s, transform 0.6s ease ${0.1 + i * 0.12}s` }}
                            >
                                {/* Gradient accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${track.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${track.iconBg}`}>
                                        <track.icon className={`w-7 h-7 ${track.iconColor}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                            {track.title}
                                        </h3>
                                        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                            {track.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {track.features.map((feat, j) => (
                                                <span
                                                    key={j}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isDark
                                                        ? 'bg-white/5 text-white/60 border border-white/10'
                                                        : 'bg-black/5 text-black/60 border border-black/5'
                                                    }`}
                                                >
                                                    {feat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== TESTIMONIALS ====== */}
            <section ref={testimonialsRef} className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`} style={{ opacity: testimonialsInView ? 1 : 0, transform: testimonialsInView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
                            Loved by{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Professionals
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className={`p-6 rounded-2xl ${isDark
                                    ? 'glass-card'
                                    : 'bg-white border border-black/5 shadow-sm'
                                }`}
                                style={{ opacity: testimonialsInView ? 1 : 0, transform: testimonialsInView ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${0.1 + i * 0.12}s, transform 0.6s ease ${0.1 + i * 0.12}s` }}
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div>
                                    <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>{t.name}</div>
                                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== MARQUEE TRUSTED BY ====== */}
            <section className="relative z-10 py-12 overflow-hidden">
                <div className={`text-center mb-8`}>
                    <p className={`text-sm font-medium tracking-wide uppercase ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                        Trusted Technology Partners
                    </p>
                </div>
                <div className="relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r ${isDark ? 'from-black' : 'from-gray-50'} to-transparent`} />
                    <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l ${isDark ? 'from-black' : 'from-gray-50'} to-transparent`} />
                    <div className="animate-marquee flex gap-12 items-center whitespace-nowrap">
                        {['OpenAI', 'Firebase', 'Next.js', 'Vercel', 'Anthropic', 'Tailwind CSS', 'React', 'OpenAI', 'Firebase', 'Next.js', 'Vercel', 'Anthropic', 'Tailwind CSS', 'React'].map((name, i) => (
                            <span key={i} className={`text-lg font-semibold ${isDark ? 'text-white/15' : 'text-black/15'}`}>
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== AUTH / SIGN UP SECTION ====== */}
            <section ref={authSectionRef} className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div ref={ctaRef} className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: CTA content */}
                        <div style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateX(0)' : 'translateX(-30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
                            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                                Ready to Transform
                                <br />
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                    Your Workflow?
                                </span>
                            </h2>
                            <p className={`text-lg mb-8 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                Join thousands of professionals who use KimuntuPro to accelerate their career, grow their business, and navigate legal complexities with AI.
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Free tier available with generous limits',
                                    'No credit card required to start',
                                    'AI-powered tools across 4 professional tracks',
                                    'Export to PDF, DOCX, and more',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        <span className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Auth Card */}
                        <div className="w-full max-w-md mx-auto" style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateX(0)' : 'translateX(30px)', transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s' }}>
                            <div className={`relative rounded-3xl p-8 overflow-hidden ${isDark
                                ? 'glass-card animate-border-glow'
                                : 'bg-white border border-black/5 shadow-xl'
                            }`}>
                                {/* Glass reflection on dark */}
                                {isDark && (
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                )}

                                <div className="relative z-10">
                                    <div className="text-center mb-8">
                                        <div className="relative inline-block mb-4">
                                            <Image src="/assets/LOGOS(9).svg" alt="Logo" width={64} height={64} className="animate-float" />
                                        </div>
                                        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                            {isLogin ? 'Welcome Back' : 'Get Started'}
                                        </h2>
                                        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                            {isLogin ? 'Sign in to continue your journey' : 'Create your account today'}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>Email</label>
                                            <div className="relative">
                                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                                                        ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
                                                        : 'bg-black/[0.02] border border-black/10 text-black placeholder-black/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
                                                    } focus:outline-none`}
                                                    placeholder="your@email.com"
                                                    disabled={authLoading}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>Password</label>
                                            <div className="relative">
                                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                                                        ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
                                                        : 'bg-black/[0.02] border border-black/10 text-black placeholder-black/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
                                                    } focus:outline-none`}
                                                    placeholder="••••••••"
                                                    disabled={authLoading}
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className={`text-sm p-3 rounded-xl ${isDark
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                                : 'bg-red-50 border border-red-200 text-red-600'
                                            }`}>
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleEmailAuth}
                                            disabled={authLoading}
                                            className="w-full font-semibold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] ripple-effect"
                                        >
                                            {authLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                isLogin ? 'Sign In' : 'Create Account'
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-black/10'}`} />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className={`px-3 ${isDark ? 'bg-black text-white/40' : 'bg-white text-black/40'}`}>or</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={authLoading}
                                        className={`w-full font-medium py-3.5 rounded-xl disabled:opacity-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 ${isDark
                                            ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                            : 'bg-black/[0.02] text-black hover:bg-black/5 border border-black/10'
                                        }`}
                                    >
                                        <Chrome className="w-5 h-5" />
                                        Continue with Google
                                    </button>

                                    <p className={`text-center text-sm mt-6 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setError('');
                                                setEmail('');
                                                setPassword('');
                                            }}
                                            className={`font-semibold underline underline-offset-4 ${isDark
                                                ? 'text-emerald-400 hover:text-emerald-300'
                                                : 'text-emerald-600 hover:text-emerald-500'
                                            }`}
                                            disabled={authLoading}
                                        >
                                            {isLogin ? 'Sign Up' : 'Sign In'}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
