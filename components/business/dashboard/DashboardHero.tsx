'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Globe, TrendingUp } from 'lucide-react';
import { getPrimaryLogo, type Logo } from '@kimuntupro/db';

interface DashboardHeroProps {
  userName?: string;
  tenantId?: string;
  userId?: string;
}

export default function DashboardHero({ userName, tenantId, userId }: DashboardHeroProps) {
  const router = useRouter();
  const [primaryLogo, setPrimaryLogo] = useState<Logo | null>(null);
  const [logoDataURL, setLogoDataURL] = useState<string | null>(null);

  // Load primary logo
  useEffect(() => {
    async function loadPrimaryLogo() {
      if (!tenantId || !userId) return;

      try {
        const logo = await getPrimaryLogo(tenantId, userId);
        if (logo) {
          setPrimaryLogo(logo);

          // Convert LogoSpec to data URL
          const { logoSpecToSVGString } = await import('../../../app/dashboard/business/logo-studio/utils/svgRenderer');
          const svgString = logoSpecToSVGString(logo.currentSpec);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);

          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.drawImage(img, 0, 0, 200, 200);
              const dataURL = canvas.toDataURL('image/png');
              setLogoDataURL(dataURL);
            }

            URL.revokeObjectURL(svgUrl);
          };

          img.src = svgUrl;
        }
      } catch (error) {
        console.error('[DashboardHero] Failed to load primary logo:', error);
      }
    }

    loadPrimaryLogo();
  }, [tenantId, userId]);

  // Get current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Logo + Greeting */}
        <div className="flex-1 flex items-center gap-4">
          {/* Primary Logo Badge */}
          {logoDataURL && (
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur border-2 border-emerald-400/50 p-2 shadow-lg">
                <img
                  src={logoDataURL}
                  alt={primaryLogo?.companyName || 'Company Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold mb-1 text-white">
              {userName ? `Welcome back, ${userName}` : 'Welcome to Business Track'}
            </h1>
            <p className="text-emerald-300 text-lg mb-1">
              Your AI-Powered Business Command Center
            </p>
            <p className="text-gray-400 text-sm">
              {today}
            </p>
          </div>
        </div>

        {/* Right Side: CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/dashboard/business/streamlined-plan')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <TrendingUp size={20} />
            Generate Business Plan
          </button>
          <button
            onClick={() => router.push('/dashboard/business/websites/new')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors shadow-lg"
          >
            <Globe size={20} />
            Build AI Website
          </button>
        </div>
      </div>
    </div>
  );
}
