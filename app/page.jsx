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
            <section className="relative z-10 py-16 overflow-hidden">
                <div className="text-center mb-10">
                    <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                        Powered by Industry Leaders
                    </p>
                </div>
                <div className="relative group/marquee">
                    <div className={`absolute left-0 top-0 bottom-0 w-40 z-10 bg-gradient-to-r ${isDark ? 'from-black' : 'from-gray-50'} to-transparent`} />
                    <div className={`absolute right-0 top-0 bottom-0 w-40 z-10 bg-gradient-to-l ${isDark ? 'from-black' : 'from-gray-50'} to-transparent`} />
                    <div className="marquee-track flex gap-16 items-center whitespace-nowrap group-hover/marquee:[animation-play-state:paused]">
                        {[
                            { name: 'OpenAI', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>
                            )},
                            { name: 'Firebase', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 0 0-.96 0L3.53 17.984z"/></svg>
                            )},
                            { name: 'Next.js', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/></svg>
                            )},
                            { name: 'Vercel', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M24 22.525H0l12-21.05z"/></svg>
                            )},
                            { name: 'Anthropic', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0L0 20.48h3.672l1.364-3.675h6.81l1.364 3.675h3.672L10.172 3.52H6.569zm1.832 5.05l2.3 6.18H8.1l2.3-6.18z"/></svg>
                            )},
                            { name: 'Tailwind', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>
                            )},
                            { name: 'React', logo: (
                                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.31 0-.592.068-.846.196-1.048.529-1.393 2.105-.918 4.332C2.48 6.904 1.017 8.45 1.017 9.9c0 .716.421 1.412 1.184 2.029-.263 1.39-.164 2.569.28 3.253.345.53.883.798 1.568.798 1.346 0 3.108-.96 4.888-2.623 1.78 1.654 3.543 2.603 4.887 2.603.31 0 .592-.068.847-.197 1.048-.528 1.392-2.104.917-4.332 2.86-1.042 4.324-2.588 4.324-4.038 0-.716-.421-1.412-1.184-2.028.263-1.39.164-2.57-.28-3.254-.346-.53-.883-.797-1.568-.797zM18.505 5c.247 0 .435.063.561.197.357.381.395 1.27.095 2.48C18.195 7.307 17.134 7.011 16 6.844c-.703-.938-1.436-1.748-2.164-2.408C15.47 3.023 17.189 5 18.505 5zM12 15.55c-.488.455-.985.856-1.483 1.192-.498-.337-.995-.738-1.483-1.192-.98-.945-1.76-1.985-2.318-3.055.14-.008.282-.013.426-.013 1.666 0 3.19.325 4.508.883.22.093.438.195.646.305-.556 1.068-1.335 2.107-2.296 3.05-.016.014.016-.014 0 0zm-4.77-4.413c-.12-.236-.226-.478-.323-.72 1.107-.307 2.303-.483 3.558-.483.247 0 .492.01.733.028-.42.573-.887 1.14-1.396 1.694-.8-.254-1.664-.427-2.572-.52zm9.54 0c-.912.093-1.773.266-2.573.52-.509-.554-.976-1.121-1.396-1.694.241-.018.486-.028.733-.028 1.255 0 2.451.176 3.558.483-.097.241-.204.483-.322.72zM12 8.07c-.487-.456-.984-.856-1.483-1.192C11.015 6.54 11.512 6.14 12 5.683c.488.456.985.857 1.483 1.193-.498.336-.995.737-1.483 1.193zM5.495 5c1.316 0 3.035 2.023 4.668 3.436C9.436 9.096 8.703 9.906 8 10.844c-1.134.167-2.195.463-3.161.833-.3-1.21-.262-2.099.095-2.48.126-.134.314-.197.561-.197zm-2.8 6.567c0-.593.598-1.397 1.696-2.114.244.664.55 1.34.92 2.004-.37.665-.676 1.34-.92 2.004-1.098-.717-1.696-1.52-1.696-2.114v.22zm2.8 6.567c-.247 0-.435-.064-.561-.197-.357-.381-.395-1.27-.095-2.48.966.37 2.027.666 3.161.833.703.938 1.436 1.748 2.164 2.408-1.634 1.413-3.353 3.436-4.669 3.436v-4zm6.505 1.433c.488-.455.985-.856 1.483-1.192.498.337.995.738 1.483 1.192-1.025.988-2.07 1.806-3.093 2.415-.016-.016 1.111-.587.127-2.415zm4.77-1.433c1.316 0 3.035-2.023 4.668-3.436-.728-.66-1.461-1.47-2.164-2.408 1.134-.167 2.195-.463 3.161-.833.3 1.21.262 2.099-.095 2.48-.126.134-.314.197-.561.197v4zm2.8-6.567c0 .593-.598 1.397-1.696 2.114-.244-.664-.55-1.34-.92-2.004.37-.665.676-1.34.92-2.004 1.098.717 1.696 1.52 1.696 2.114v-.22z"/></svg>
                            )},
                        ].flatMap((item, idx) => [
                            { ...item, key: `a-${idx}` },
                            { ...item, key: `b-${idx}` },
                        ]).map((item) => (
                            <div
                                key={item.key}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 cursor-default group/logo ${isDark
                                    ? 'text-white/20 hover:text-white/80 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                                    : 'text-black/15 hover:text-black/70 hover:bg-black/5 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                }`}
                            >
                                <div className="transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                    {item.logo}
                                </div>
                                <span className="text-base font-semibold tracking-wide">{item.name}</span>
                            </div>
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
