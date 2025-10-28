import React from 'react';

const Documents = ({ t }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">{t.myDocuments}</h2>
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
        <p className="text-gray-400 mb-6">{t.documentsWillAppear}</p>
        <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all">
          {t.createNewDocument}
        </button>
      </div>
    </div>
  );
};

export default Documents;

