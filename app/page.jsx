'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, Mail, Lock, Chrome, BarChart, Shield, Sun, Moon, Rocket } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '@/lib/firebase';
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                router.push('/dashboard');
            }
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
                ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black'
                : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
                }`}>
                <div className="flex flex-col items-center gap-4">
                    <Image src="/assets/LOGOS(4).svg" alt="KimuntuPro AI" width={80} height={80} className="animate-bounce" />
                    <div className={`text-2xl font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${isDark
            ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black'
            : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
            }`}>
            {/* Animated gradient blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-full ${isDark
                    ? 'bg-gradient-to-br from-gray-950 via-gray-900/50 to-black'
                    : 'bg-gradient-to-br from-gray-50 via-blue-100/50 to-gray-100'
                    }`}></div>
                <div className={`absolute top-20 -left-20 w-96 h-96 rounded-full filter blur-3xl opacity-30 animate-pulse ${isDark ? 'bg-blue-600' : 'bg-blue-200'
                    }`}></div>
                <div className={`absolute bottom-20 -right-20 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-cyan-600' : 'bg-cyan-200'
                    }`} style={{ animationDelay: '2s' }}></div>
                <div className={`absolute top-1/2 left-1/2 w-72 h-72 rounded-full filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-300'
                    }`} style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Image src="/assets/LOGOS(4).svg" alt="KimuntuPro AI Logo" width={48} height={48} />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        KimuntuPro AI
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-4 py-8">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Hero Content */}
                    <div className="text-center lg:text-left space-y-8">
                        <div className="flex justify-center lg:justify-start mb-6">
                            <Image src="/assets/LOGOS(8).svg" alt="KimuntuPro" width={64} height={64} />
                        </div>

                        <h1 className={`text-5xl lg:text-6xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            Empowering Your{' '}
                            <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                                Future with AI
                            </span>
                        </h1>

                        <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                                ? 'bg-white/10 backdrop-blur-lg border border-white/20'
                                : 'bg-white/60 backdrop-blur-lg border border-gray-200'
                                }`}>
                                <Briefcase className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Career Development</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                                ? 'bg-white/10 backdrop-blur-lg border border-white/20'
                                : 'bg-white/60 backdrop-blur-lg border border-gray-200'
                                }`}>
                                <BarChart className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Business Planning</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                                ? 'bg-white/10 backdrop-blur-lg border border-white/20'
                                : 'bg-white/60 backdrop-blur-lg border border-gray-200'
                                }`}>
                                <Shield className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Legal Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Glassmorphism Login Card */}
                    <div className="w-full max-w-md mx-auto">
                        <div className={`relative group ${isDark
                            ? 'bg-white/5 backdrop-blur-2xl border border-white/20'
                            : 'bg-white/40 backdrop-blur-2xl border border-white/60'
                            } rounded-3xl p-8 shadow-2xl`}>
                            {/* Glass reflection effect */}
                            <div className={`absolute inset-0 rounded-3xl ${isDark
                                ? 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
                                : 'bg-gradient-to-br from-white/50 via-transparent to-transparent'
                                } pointer-events-none`}></div>

                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <Image src="/assets/LOGOS(9).svg" alt="Logo" width={64} height={64} className="mx-auto mb-4" />
                                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {isLogin ? 'Welcome Back' : 'Get Started'}
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {isLogin ? 'Sign in to continue your journey' : 'Create your account today'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>Email</label>
                                        <div className="relative group">
                                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                                }`} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                                                    ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20'
                                                    : 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                                    } focus:outline-none backdrop-blur-xl`}
                                                placeholder="your@email.com"
                                                disabled={authLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>Password</label>
                                        <div className="relative">
                                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                                }`} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                                                    ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20'
                                                    : 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                                    } focus:outline-none backdrop-blur-xl`}
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
                                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-purple-500/25"
                                    >
                                        {authLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                    </button>
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className={`px-3 ${isDark ? 'bg-slate-900 text-gray-400' : 'bg-purple-50 text-gray-600'
                                            }`}>Or</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={authLoading}
                                    className={`w-full font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 ${isDark
                                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                                        : 'bg-white/80 text-gray-900 hover:bg-white border border-gray-300'
                                        } backdrop-blur-xl shadow-lg`}
                                >
                                    <Chrome className="w-5 h-5" />
                                    Continue with Google
                                </button>

                                <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError('');
                                            setEmail('');
                                            setPassword('');
                                        }}
                                        className={`font-medium ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
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
                        ? 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
                        : 'bg-white/40 backdrop-blur-xl border border-gray-300 hover:bg-white/60'
                        }`}
                >
                    {isDark ? (
                        <Sun className="w-6 h-6 text-yellow-400" />
                    ) : (
                        <Moon className="w-6 h-6 text-purple-600" />
                    )}
                </button>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
