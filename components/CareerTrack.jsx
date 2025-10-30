'use client';

import React, { useState } from 'react';
import { FileText, Target, Users, Shield, X } from 'lucide-react';

const CareerTrack = ({ language }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Career Track Translations
  const careerTranslations = {
    en: {
      personalTrack: 'Personal Track',
      description: 'Level up your career with a CV Builder, Job Matching Platform, and Interview Simulator powered by AI.',
      seeFeatures: 'See Features',
      features: 'Personal Track Features',
      focusedTools: 'Focused tools to help you get started and succeed in your career journey.',
      cvBuilder: 'CV Builder',
      cvItems: [
        'Create a professional CV in minutes',
        'Guided sections and expert tips',
        'Export and share easily'
      ],
      cvDesc: 'Build a standout CV with our guided tool. Get expert tips for every section and export your CV for easy sharing. Perfect for students and professionals ready to showcase their experience.',
      jobMatch: 'Job Matching Platform',
      jobMatchItems: [
        'Discover jobs tailored to your profile',
        'AI-powered matching and recommendations',
        'Track applications in one place'
      ],
      jobMatchDesc: 'Find jobs that fit your skills and goals. Our AI matches you to opportunities and helps you track your applications, so you never miss a chance.',
      interview: 'Interview Simulator',
      interviewItems: [
        'Practice with realistic interview scenarios',
        'Sentiment analysis and facial recognition',
        'Instant feedback and tailored questions',
        'Industry standards and best practices'
      ],
      interviewDesc: 'Practice interviews in a realistic, AI-powered environment. Advanced features include sentiment analysis, facial recognition, and instant feedback. Get tailored questions based on your industry and experience, and learn best practices to stand out in any interview.',
      privacyFirst: 'Privacy First',
      privacyDesc: 'Your information is never shared. Backed by Firebase and AWS for maximum security.'
    },
    fr: {
      personalTrack: 'Piste personnelle',
      description: 'Améliorez votre carrière avec un constructeur de CV, une plateforme de correspondance d\'emploi et un simulateur d\'entrevue alimentés par l\'IA.',
      seeFeatures: 'Voir les fonctionnalités',
      features: 'Fonctionnalités de la piste personnelle',
      focusedTools: 'Outils ciblés pour vous aider à démarrer et réussir dans votre parcours de carrière.',
      cvBuilder: 'Constructeur de CV',
      cvItems: [
        'Créez un CV professionnel en quelques minutes',
        'Sections guidées et conseils d\'experts',
        'Export et partage facile'
      ],
      cvDesc: 'Créez un CV remarquable avec notre outil guidé. Obtenez des conseils d\'experts pour chaque section et exportez votre CV pour un partage facile. Parfait pour les étudiants et les professionnels prêts à présenter leur expérience.',
      jobMatch: 'Plateforme de correspondance d\'emploi',
      jobMatchItems: [
        'Découvrez des emplois adaptés à votre profil',
        'Correspondance et recommandations alimentées par l\'IA',
        'Suivez les candidatures en un seul endroit'
      ],
      jobMatchDesc: 'Trouvez des emplois qui correspondent à vos compétences et à vos objectifs. Notre IA vous met en relation avec des opportunités et vous aide à suivre vos candidatures, vous ne manquerez donc jamais une chance.',
      interview: 'Simulateur d\'entrevue',
      interviewItems: [
        'Pratiquez avec des scénarios d\'entrevue réalistes',
        'Analyse du sentiment et reconnaissance faciale',
        'Rétroaction instantanée et questions adaptées',
        'Normes et meilleures pratiques de l\'industrie'
      ],
      interviewDesc: 'Pratiquez des entrevues dans un environnement réaliste alimenté par l\'IA. Les fonctionnalités avancées incluent l\'analyse du sentiment, la reconnaissance faciale et la rétroaction instantanée. Obtenez des questions adaptées en fonction de votre industrie et de votre expérience, et apprenez les meilleures pratiques pour vous démarquer lors de toute entrevue.',
      privacyFirst: 'Confidentialité avant tout',
      privacyDesc: 'Vos informations ne sont jamais partagées. Soutenu par Firebase et AWS pour une sécurité maximale.'
    }
  };
  
  const t = careerTranslations[language] || careerTranslations.en;
  
  const features = [
    {
      id: 'cv',
      title: t.cvBuilder,
      icon: FileText,
      items: t.cvItems,
      description: t.cvDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'CV Builder',
        inputs: [
          { label: 'Job Link', type: 'text', placeholder: 'Paste job posting URL...' },
          { label: 'Upload Resume', type: 'file' },
          { label: 'Skills You Have', type: 'text', placeholder: 'e.g. Python, Communication, Excel...', items: ['Python', 'Communication', 'Excel', 'Project Management', 'Teamwork'] }
        ],
        howItWorks: [
          { label: 'Personal Info', desc: 'Name, contact, LinkedIn, etc.' },
          { label: 'Education', desc: 'Schools, degrees, dates' },
          { label: 'Experience', desc: 'Jobs, internships, achievements' },
          { label: 'Skills', desc: 'Technical, soft skills, languages' },
          { label: 'Certifications & Awards', desc: 'Relevant recognitions' },
          { label: 'Export', desc: 'Download as PDF or share link' }
        ]
      }
    },
    {
      id: 'jobmatch',
      title: t.jobMatch,
      icon: Target,
      items: t.jobMatchItems,
      description: t.jobMatchDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'Job Matching Platform',
        inputs: [
          { label: 'Your Skills', type: 'text', placeholder: 'e.g. Python, Marketing...' },
          { label: 'Work Type', type: 'select', options: ['Online', 'Hybrid', 'In Person'] },
          { label: 'Salary', type: 'number-salary', placeholder: 'e.g. 60000', currency: ['USD', 'CAD', 'EUR', 'GBP', 'Other'] },
          { label: 'Location', type: 'text', placeholder: 'e.g. Toronto, Remote...' }
        ],
        howItWorks: [
          { label: 'Profile Setup', desc: 'Enter skills, experience, preferences' },
          { label: 'AI Matching', desc: 'See jobs tailored to your profile' },
          { label: 'Recommendations', desc: 'Get daily/weekly job suggestions' },
          { label: 'Application Tracker', desc: 'Manage and track job applications' },
          { label: 'Notifications', desc: 'Alerts for new matches and deadlines' }
        ]
      }
    },
    {
      id: 'interview',
      title: t.interview,
      icon: Users,
      items: t.interviewItems,
      description: t.interviewDesc,
      outline: {
        title: 'General Outline',
        formTitle: 'Interview Simulator',
        inputs: [
          { label: 'Company Website', type: 'text', placeholder: 'Paste company URL...' },
          { label: 'Industry', type: 'text', placeholder: 'e.g. Technology, Finance...' },
          { label: 'Job Role', type: 'text', placeholder: 'e.g. Software Engineer, Analyst...' }
        ],
        howItWorks: [
          { label: 'Scenario Selection', desc: 'Choose industry, role, difficulty' },
          { label: 'Live Simulation', desc: 'Answer questions via text or video' },
          { label: 'Sentiment Analysis', desc: 'Real-time feedback on tone and confidence' },
          { label: 'Facial Recognition', desc: 'Analyze expressions and engagement' },
          { label: 'Tailored Questions', desc: 'AI adapts questions to your background' },
          { label: 'Industry Standards', desc: 'Benchmark answers against best practices' },
          { label: 'Summary & Feedback', desc: 'Get actionable tips for improvement' }
        ]
      }
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
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{t.personalTrack}</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">{t.description}</p>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-10">
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{t.features}</h2>
            <p className="text-gray-400 mb-6">{t.focusedTools}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => showFeature(feature.id)}
                  className="bg-white/5 border border-gray-800 rounded-2xl p-6 text-left hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 text-center">
            <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{t.privacyFirst}</h3>
            <p className="text-gray-400">
              {t.privacyDesc}
            </p>
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
                <h3 className="text-xl font-bold text-white mb-4 text-center">{selectedFeature.outline.formTitle}</h3>
                
                <form className="space-y-4">
                  {selectedFeature.outline.inputs.map((input, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{input.label}</label>
                      {input.type === 'file' ? (
                        <input
                          type="file"
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                        />
                      ) : input.type === 'select' ? (
                        <select className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                          {input.options.map((option, j) => (
                            <option key={j} value={option} className="bg-gray-900">{option}</option>
                          ))}
                        </select>
                      ) : input.type === 'number-salary' ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={input.placeholder}
                            className="flex-1 bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <select className="w-32 bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                            {input.currency.map((curr, j) => (
                              <option key={j} value={curr} className="bg-gray-900">{curr}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      )}
                      {input.items && (
                        <ul className="mt-2 space-y-1">
                          {input.items.map((item, j) => (
                            <li key={j} className="text-sm text-gray-400">• {item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    {selectedFeature.outline.formTitle.includes('CV') ? 'Tailor My CV' : selectedFeature.outline.formTitle.includes('Interview') ? 'Start Simulation' : 'Find Jobs'}
                  </button>
                </form>
              </div>

              <div className="bg-gray-900/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 text-center">How It Works</h3>
                <ul className="space-y-3">
                  {selectedFeature.outline.howItWorks.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold flex-shrink-0">•</span>
                      <div>
                        <strong className="text-white">{step.label}:</strong>
                        <span className="text-gray-300 ml-2">{step.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerTrack;

