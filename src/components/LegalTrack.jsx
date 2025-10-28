import React from 'react';

const LegalTrack = ({ t }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">{t.legalTrack}</h2>
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
        <p className="text-gray-300 mb-4">{t.legalTrackDesc}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[t.contractReview, t.legalTemplates, t.complianceCheck, t.documentDrafting].map((item, i) => (
            <div key={i} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 cursor-pointer hover:bg-purple-500/20 transition-all">
              <p className="text-purple-400 font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalTrack;

