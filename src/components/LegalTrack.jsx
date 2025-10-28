import React, { useState } from 'react';
import { Scale, Shield, FileText, FileCheck, X } from 'lucide-react';

const LegalTrack = ({ t, language }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Legal Track Translations
  const legalTranslations = {
    en: {
      legalTrack: 'Legal Track',
      description: 'Access comprehensive legal assistance, document analysis, and compliance tools powered by AI.',
      features: 'Legal Track Features',
      focusedTools: 'Expert legal tools to help you navigate legal matters with confidence.',
      selectServiceType: 'Select Service Type',
      serviceType: 'Service Type',
      uploadDocument: 'Upload Document (Optional)',
      analyzeDocument: 'Analyze Document',
      // Add more translations as needed
    },
    fr: {
      legalTrack: 'Piste juridique',
      description: 'Accédez à une assistance juridique complète, à l\'analyse de documents et à des outils de conformité alimentés par l\'IA.',
      features: 'Fonctionnalités de la piste juridique',
      focusedTools: 'Outils juridiques experts pour vous aider à naviguer dans les questions juridiques en toute confiance.',
      selectServiceType: 'Sélectionner le type de service',
      serviceType: 'Type de service',
      uploadDocument: 'Télécharger un document (optionnel)',
      analyzeDocument: 'Analyser le document',
      // Add more translations as needed
    }
  };
  
  const tLegal = legalTranslations[language] || legalTranslations.en;
  
  const features = [
    {
      id: 'contract',
      title: 'Contract Review',
      icon: FileText,
      items: [
        'AI-powered contract analysis',
        'Risk assessment and recommendations',
        'Compliance checking'
      ],
      description: 'Get comprehensive contract analysis with AI-powered risk assessment and compliance checking.',
      dropdownOptions: ['Employment Contracts', 'Service Agreements', 'NDAs', 'Partnership Agreements', 'Lease Agreements']
    },
    {
      id: 'templates',
      title: 'Legal Templates',
      icon: FileCheck,
      items: [
        'Professional legal document templates',
        'Industry-specific templates',
        'Customizable forms'
      ],
      description: 'Access a library of professional legal templates tailored for your needs.',
      dropdownOptions: ['Business Templates', 'Personal Legal Templates', 'Real Estate', 'Employment', 'Intellectual Property']
    },
    {
      id: 'compliance',
      title: 'Compliance Check',
      icon: Shield,
      items: [
        'GDPR compliance verification',
        'Data protection compliance',
        'Industry-specific regulations'
      ],
      description: 'Ensure your business meets all regulatory requirements with our compliance checker.',
      dropdownOptions: ['GDPR', 'CCPA', 'PIPEDA', 'Industry-Specific', 'International']
    },
    {
      id: 'document',
      title: 'Document Drafting',
      icon: Scale,
      items: [
        'AI-assisted document creation',
        'Legal writing assistance',
        'Review and optimization'
      ],
      description: 'Create professional legal documents with AI assistance and best practices guidance.',
      dropdownOptions: ['Contracts', 'Policies', 'Terms & Conditions', 'Privacy Policies', 'Corporate Documents']
    }
  ];

  const showFeature = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    setSelectedFeature(feature);
  };

  const closeFeature = () => {
    setSelectedFeature(null);
  };

  return (
    <div>
      <div className="mb-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{tLegal.legalTrack}</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">{tLegal.description}</p>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-10">
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{tLegal.features}</h2>
            <p className="text-gray-400 mb-6">{tLegal.focusedTools}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => showFeature(feature.id)}
                  className="bg-white/5 border border-gray-800 rounded-2xl p-6 text-left hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-purple-400 font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeFeature}>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-6xl w-full max-h-[85vh] overflow-y-auto border border-gray-800 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeFeature}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedFeature.title}</h2>
                <p className="text-gray-400">{selectedFeature.description}</p>
              </div>

              <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 text-center">{tLegal.selectServiceType}</h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{tLegal.serviceType}</label>
                    <select className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                      <option value="" className="bg-gray-900">{tLegal.serviceType === 'Service Type' ? 'Select a service...' : 'Sélectionner un service...'}</option>
                      {selectedFeature.dropdownOptions.map((option, i) => (
                        <option key={i} value={option} className="bg-gray-900">{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{tLegal.uploadDocument}</label>
                    <input
                      type="file"
                      className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all"
                  >
                    {tLegal.analyzeDocument}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalTrack;
