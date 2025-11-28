'use client';

import React from 'react';

const BusinessTrack = ({ t }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">{t.businessTrack}</h2>
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
        <p className="text-gray-300 mb-4">{t.businessTrackDesc}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[t.businessPlanGen, t.marketAnalysis, t.financialForecasting, t.growthStrategy].map((item, i) => (
            <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 cursor-pointer hover:bg-blue-500/20 transition-all">
              <p className="text-blue-400 font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessTrack;

