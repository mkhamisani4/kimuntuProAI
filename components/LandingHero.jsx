'use client';

import { Briefcase, BarChart, Shield } from 'lucide-react';

export default function LandingHero({ t, onGetStarted }) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-emerald-950/30 to-black"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-400 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div></div>
        <button
          onClick={onGetStarted}
          className="bg-white/5 border border-emerald-500/20 text-white px-6 py-2 rounded-xl hover:bg-white/10 transition-all"
        >
          {t.getStarted}
        </button>
      </header>

      {/* Landing Page Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-12 mb-1">
            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              {t.heroTitle}{' '}
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {t.heroSubtitle}
              </span>
            </h1>
            <div className="flex flex-wrap gap-4 justify-center mb-0">
              <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-xl">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>{t.careerDev}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-xl">
                <BarChart className="w-5 h-5 text-emerald-400" />
                <span>{t.businessPlanning}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>{t.legalSupport}</span>
              </div>
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="bg-white/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-black/50 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-12 text-center">
              {t.whyChooseTitle}
            </h2>
            <ul className="space-y-6 max-w-4xl mx-auto text-center">
              <li className="text-gray-300">
                <span className="text-xl"><strong className="text-white">{t.allInOne}</strong> {t.allInOneDesc}</span>
              </li>
              <li className="text-gray-300">
                <span className="text-xl"><strong className="text-white">{t.aiPowered}</strong> {t.aiPoweredDesc}</span>
              </li>
              <li className="text-gray-300">
                <span className="text-xl"><strong className="text-white">{t.secure}</strong> {t.secureDesc}</span>
              </li>
              <li className="text-gray-300">
                <span className="text-xl"><strong className="text-white">{t.accessible}</strong> {t.accessibleDesc}</span>
              </li>
              <li className="text-gray-300">
                <span className="text-xl"><strong className="text-white">{t.futureReady}</strong> {t.futureReadyDesc}</span>
              </li>
            </ul>
            <p className="text-center text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mt-12">
              ✨ {t.tagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
