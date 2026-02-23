'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, Mail, Lock, Chrome, BarChart, Shield, Sun, Moon, Rocket } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser, hasCompletedOnboarding } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@/components/providers/ThemeProvider';
import Footer from '@/components/Footer';
import Image from 'next/image';

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if user has completed onboarding
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

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark
                ? 'bg-black'
                : 'bg-white'
                }`}>
                <div className="flex flex-col items-center gap-4">
                    <Image src="/assets/LOGOS(9).svg" alt="Kimuntu" width={80} height={80} className="animate-bounce" />
                    <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${isDark
            ? 'bg-black'
            : 'bg-white'
            }`}>

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Image src="/assets/LOGOS(9).svg" alt="Kimuntu Logo" width={48} height={48} />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        Kimuntu
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-4 py-8">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Hero Content */}
                    <div className="text-center lg:text-left space-y-8">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                            <Image src="/assets/LOGOS(9).svg" alt="KimuntuPro" width={80} height={80} />
                            <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                Kimuntu
                            </span>
                        </div>

                        <h1 className={`text-5xl lg:text-6xl font-bold leading-tight ${isDark ? 'text-white' : 'text-black'
                            }`}>
                            Empowering Your{' '}
                            <span className={`block ${isDark ? 'text-white' : 'text-black'}`}>
                                Future with AI
                            </span>
                        </h1>

                        <p className={`text-xl ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                            Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                                ? 'bg-white/10 border border-white/20'
                                : 'bg-black/5 border border-black/10'
                                }`}>
                                <Briefcase className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
                                <span className={isDark ? 'text-white' : 'text-black'}>Career Development</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                                ? 'bg-white/10 border border-white/20'
                                : 'bg-black/5 border border-black/10'
                                }`}>
                                <BarChart className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
                                <span className={isDark ? 'text-white' : 'text-black'}>Business Planning</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                                ? 'bg-white/10 border border-white/20'
                                : 'bg-black/5 border border-black/10'
                                }`}>
                                <Shield className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
                                <span className={isDark ? 'text-white' : 'text-black'}>Legal Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Premium Login Card */}
                    <div className="w-full max-w-md mx-auto">
                        <div className={`relative group ${isDark
                            ? 'bg-white/5 border border-white/20'
                            : 'bg-black/5 border border-black/10'
                            } rounded-3xl p-8 shadow-2xl`}>

                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <Image src="/assets/LOGOS(9).svg" alt="Logo" width={80} height={80} className="mx-auto mb-4" />
                                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                        {isLogin ? 'Welcome Back' : 'Get Started'}
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        {isLogin ? 'Sign in to continue your journey' : 'Create your account today'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'
                                            }`}>Email</label>
                                        <div className="relative group">
                                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-white/40' : 'text-black/40'
                                                }`} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                                                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20'
                                                    : 'bg-black/5 border border-black/10 text-black placeholder-black/40 focus:bg-black/10 focus:border-black/20 focus:ring-2 focus:ring-black/10'
                                                    } focus:outline-none`}
                                                placeholder="your@email.com"
                                                disabled={authLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'
                                            }`}>Password</label>
                                        <div className="relative">
                                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-white/40' : 'text-black/40'
                                                }`} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                                                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20'
                                                    : 'bg-black/5 border border-black/10 text-black placeholder-black/40 focus:bg-black/10 focus:border-black/20 focus:ring-2 focus:ring-black/10'
                                                    } focus:outline-none`}
                                                placeholder="••••••••"
                                                disabled={authLoading}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className={`${isDark
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-red-50/80 border border-red-300 text-red-700'
                                            } backdrop-blur-xl text-sm p-3 rounded-lg`}>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleEmailAuth}
                                        disabled={authLoading}
                                        className={`w-full font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg ${
                                            isDark
                                                ? 'bg-white text-black hover:bg-white/90'
                                                : 'bg-black text-white hover:bg-black/90'
                                        }`}
                                    >
                                        {authLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                    </button>
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={`w-full border-t ${isDark ? 'border-white/20' : 'border-black/20'}`}></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className={`px-3 ${isDark ? 'bg-black text-white/60' : 'bg-white text-black/60'
                                            }`}>Or</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={authLoading}
                                    className={`w-full font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 ${isDark
                                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                        : 'bg-black/5 text-black hover:bg-black/10 border border-black/10'
                                        } shadow-lg`}
                                >
                                    <Chrome className="w-5 h-5" />
                                    Continue with Google
                                </button>

                                <p className={`text-center text-sm mt-6 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError('');
                                            setEmail('');
                                            setPassword('');
                                        }}
                                        className={`font-medium ${isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-black/80'
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

            {/* Theme Toggle - Bottom Center */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={toggleTheme}
                    className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isDark
                        ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                        : 'bg-black/5 border border-black/10 hover:bg-black/10'
                        }`}
                >
                    {isDark ? (
                        <Sun className="w-6 h-6 text-white" />
                    ) : (
                        <Moon className="w-6 h-6 text-black" />
                    )}
                </button>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
