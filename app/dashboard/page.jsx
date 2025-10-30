import { Briefcase, BarChart, Shield } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function DashboardPage() {
  const t = translations.en; // Default to English for now

  return (
    <div>
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
      <div className="bg-white/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-black/50">
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
  );
}
