'use client';

import React from 'react';
import { HelpCircle, Mail } from 'lucide-react';

const Support = ({ t }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">{t.support}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
          <HelpCircle className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-white font-semibold mb-3">{t.faq}</h3>
          <p className="text-gray-400 text-sm">{t.faqDesc}</p>
        </div>
        <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
          <Mail className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-white font-semibold mb-3">{t.contactUs}</h3>
          <p className="text-gray-400 text-sm">{t.supportEmail}</p>
        </div>
      </div>
    </div>
  );
};

export default Support;

