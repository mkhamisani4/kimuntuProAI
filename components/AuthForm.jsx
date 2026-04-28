'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Lock, Chrome } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/firebase';

export default function AuthForm({ t }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      setError(err.message || 'Authentication failed. Please try again.');
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
      setError(err.message || 'Google sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !authLoading) {
      handleEmailAuth();
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-emerald-950/30 to-black"></div>
        <div className="absolute top-10 left-4 sm:top-20 sm:left-20 w-40 h-40 sm:w-72 sm:h-72 bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-20 w-52 h-52 sm:w-96 sm:h-96 bg-teal-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-36 h-36 sm:w-64 sm:h-64 bg-emerald-400 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-start justify-center px-4 py-4 sm:items-center sm:py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/50">
            <div className="text-center mb-5 sm:mb-8">
              <div className="relative inline-block mb-3 sm:mb-4">
                <Image
                  src="/assets/new_single_logo.png"
                  alt="Kimuntu AI"
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-[88px] sm:h-[88px] animate-float"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                {isLogin ? t.welcomeBack : t.getStarted}
              </h2>
              <p className="text-gray-400 text-sm">
                {isLogin ? t.continueJourney : t.createAccount}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-white/5 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="your@email.com"
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-white/5 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="••••••••"
                    disabled={authLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleEmailAuth}
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold py-2.5 sm:py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-emerald-500/25"
              >
                {authLoading ? t.processing : (isLogin ? t.signIn : t.signUp)}
              </button>
            </div>

            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-black text-gray-400">{t.or}</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full bg-white text-black font-medium py-2.5 sm:py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Chrome className="w-5 h-5" />
              {t.continueWithGoogle}
            </button>

            <p className="text-center text-gray-400 text-sm mt-4 sm:mt-6">
              {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-medium ml-1"
                disabled={authLoading}
              >
                {isLogin ? t.signUp : t.signIn}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
