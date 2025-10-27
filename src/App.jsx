import React, { useState, useEffect } from 'react';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, ChevronRight, Mail, Lock, Chrome, Sparkles, BarChart, Shield, Zap, Target, BookOpen, X } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

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

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('landing');
  const [authLoading, setAuthLoading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [language, setLanguage] = useState('en');

  // Translations
  const translations = {
    en: {
      // Navigation
      overview: 'Overview',
      career: 'Career Track',
      business: 'Business Track',
      legal: 'Legal Track',
      documents: 'My Documents',
      support: 'Support',
      // Landing Page
      heroTitle: 'Empowering Your',
      heroSubtitle: 'Future',
      heroDescription: 'Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.',
      careerDev: 'Career Development',
      businessPlanning: 'Business Planning',
      legalSupport: 'Legal Support',
      whyChooseTitle: 'Why Choose Kimuntu ProLaunch AI',
      allInOne: 'All-in-One Platform:',
      allInOneDesc: 'Career, business, legal, and innovation tools — in one intelligent hub.',
      aiPowered: 'AI-Powered Precision:',
      aiPoweredDesc: 'Personalized solutions for every user.',
      secure: 'Secure & Compliant:',
      secureDesc: 'GDPR, CCPA, and PIPEDA standards.',
      accessible: 'Accessible & Multilingual:',
      accessibleDesc: 'Available in English, French, and Spanish.',
      futureReady: 'Future-Ready:',
      futureReadyDesc: 'Designed to empower people and organizations for the next era of intelligent innovation.',
      tagline: 'Kimuntu ProLaunch AI — Where Ambition Meets Artificial Intelligence.',
      getStarted: 'Get Started',
      welcomeBack: 'Welcome Back',
      continueJourney: 'Sign in to continue your journey',
      createAccount: 'Create your account today',
      loggedInAs: 'Logged in as',
      signOut: 'Sign Out',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      continueWithGoogle: 'Continue with Google',
      or: 'Or',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      processing: 'Processing...',
      // Dashboard content
      dashboardOverview: 'Dashboard Overview',
      documentsCreated: 'Documents Created',
      jobMatches: 'Job Matches',
      aiQueries: 'AI Queries',
      createCvResume: 'Create CV/Resume',
      cvResumeDesc: 'AI-powered resume builder',
      businessPlan: 'Business Plan',
      businessPlanDesc: 'Generate comprehensive plans',
      legalAssistant: 'Legal Assistant',
      legalAssistantDesc: 'Get legal guidance',
      jobMatching: 'Job Matching',
      jobMatchingDesc: 'Find perfect opportunities',
      interviewPrep: 'Interview Prep',
      interviewPrepDesc: 'Practice with AI coach',
      documentReview: 'Document Review',
      documentReviewDesc: 'AI contract analysis',
      businessTrack: 'Business Track',
      businessTrackDesc: 'Build and scale your business with AI-driven insights.',
      businessPlanGen: 'Business Plan Generator',
      marketAnalysis: 'Market Analysis',
      financialForecasting: 'Financial Forecasting',
      growthStrategy: 'Growth Strategy',
      legalTrack: 'Legal Track',
      legalTrackDesc: 'Access legal guidance and document analysis.',
      contractReview: 'Contract Review',
      legalTemplates: 'Legal Templates',
      complianceCheck: 'Compliance Check',
      documentDrafting: 'Document Drafting',
      myDocuments: 'My Documents',
      documentsWillAppear: 'Your documents will appear here',
      createNewDocument: 'Create New Document',
      faq: 'FAQ',
      faqDesc: 'Find answers to common questions about KimuntuPro AI.',
      contactUs: 'Contact Us',
      supportEmail: 'support@kimuntupro.com',
    },
    fr: {
      // Navigation
      overview: 'Aperçu',
      career: 'Piste de carrière',
      business: 'Piste d\'entreprise',
      legal: 'Piste juridique',
      documents: 'Mes documents',
      support: 'Support',
      // Landing Page
      heroTitle: 'Renforcer Votre',
      heroSubtitle: 'Avenir avec l\'IA',
      heroDescription: 'Succès professionnel, croissance d\'entreprise et assistance juridique - tout alimenté par l\'intelligence artificielle de pointe.',
      careerDev: 'Développement de carrière',
      businessPlanning: 'Planification d\'entreprise',
      legalSupport: 'Support juridique',
      whyChooseTitle: 'Pourquoi choisir Kimuntu ProLaunch AI',
      allInOne: 'Plateforme tout-en-un:',
      allInOneDesc: 'Carrière, entreprise, juridique et innovation - tout dans un hub intelligent.',
      aiPowered: 'Précision alimentée par l\'IA:',
      aiPoweredDesc: 'Solutions personnalisées pour chaque utilisateur.',
      secure: 'Sécurisé et conforme:',
      secureDesc: 'Normes GDPR, CCPA et PIPEDA.',
      accessible: 'Accessible et multilingue:',
      accessibleDesc: 'Disponible en anglais, français et espagnol.',
      futureReady: 'Prêt pour l\'avenir:',
      futureReadyDesc: 'Conçu pour autonomiser les personnes et les organisations pour la prochaine ère de l\'innovation intelligente.',
      tagline: 'Kimuntu ProLaunch AI — Là où l\'Ambition rencontre l\'Intelligence Artificielle.',
      getStarted: 'Commencer',
      welcomeBack: 'Bon retour',
      continueJourney: 'Connectez-vous pour continuer votre parcours',
      createAccount: 'Créez votre compte aujourd\'hui',
      loggedInAs: 'Connecté en tant que',
      signOut: 'Se déconnecter',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      email: 'Courriel',
      password: 'Mot de passe',
      continueWithGoogle: 'Continuer avec Google',
      or: 'Ou',
      dontHaveAccount: 'Vous n\'avez pas de compte?',
      alreadyHaveAccount: 'Vous avez déjà un compte?',
      processing: 'Traitement...',
      // Dashboard content
      dashboardOverview: 'Aperçu du tableau de bord',
      documentsCreated: 'Documents créés',
      jobMatches: 'Correspondances d\'emploi',
      aiQueries: 'Requêtes IA',
      createCvResume: 'Créer un CV/Résumé',
      cvResumeDesc: 'Constructeur de CV alimenté par l\'IA',
      businessPlan: 'Plan d\'entreprise',
      businessPlanDesc: 'Générer des plans complets',
      legalAssistant: 'Assistant juridique',
      legalAssistantDesc: 'Obtenir des conseils juridiques',
      jobMatching: 'Correspondance d\'emploi',
      jobMatchingDesc: 'Trouver des opportunités parfaites',
      interviewPrep: 'Préparation d\'entrevue',
      interviewPrepDesc: 'Pratiquer avec un coach IA',
      documentReview: 'Révision de document',
      documentReviewDesc: 'Analyse de contrat IA',
      businessTrack: 'Piste d\'entreprise',
      businessTrackDesc: 'Construisez et développez votre entreprise avec des informations alimentées par l\'IA.',
      businessPlanGen: 'Générateur de plan d\'entreprise',
      marketAnalysis: 'Analyse de marché',
      financialForecasting: 'Prévisions financières',
      growthStrategy: 'Stratégie de croissance',
      legalTrack: 'Piste juridique',
      legalTrackDesc: 'Accédez à des conseils juridiques et à l\'analyse de documents.',
      contractReview: 'Révision de contrat',
      legalTemplates: 'Modèles juridiques',
      complianceCheck: 'Vérification de conformité',
      documentDrafting: 'Rédaction de documents',
      myDocuments: 'Mes documents',
      documentsWillAppear: 'Vos documents apparaîtront ici',
      createNewDocument: 'Créer un nouveau document',
      faq: 'FAQ',
      faqDesc: 'Trouvez des réponses aux questions courantes sur KimuntuPro AI.',
      contactUs: 'Nous contacter',
      supportEmail: 'support@kimuntupro.com',
    }
  };

  const t = translations[language];

  // Check if user is logged in on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError('Sign out failed');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !authLoading) {
      handleEmailAuth();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-2xl">Loading...</div>
      </div>
    );
  }

  // Landing/Login Page
  if (!user) {
    // Landing Page
    if (showLanding) {
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
              onClick={() => setShowLanding(false)}
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
                  Empowering Your{' '}
                  <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Future
                  </span>
                </h1>
                <div className="flex flex-wrap gap-4 justify-center mb-0">
                  <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-xl">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    <span>Career Development</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-xl">
                    <BarChart className="w-5 h-5 text-emerald-400" />
                    <span>Business Planning</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>Legal Support</span>
                  </div>
                </div>
              </div>

              {/* Why Choose Section */}
              <div className="bg-white/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-black/50 mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-12 text-center">
                  Why Choose <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Kimuntu ProLaunch AI</span>
                </h2>
                <ul className="space-y-6 max-w-4xl mx-auto text-center">
                  <li className="text-gray-300">
                    <span className="text-xl"><strong className="text-white">All-in-One Platform:</strong> Career, business, legal, and innovation tools — in one intelligent hub.</span>
                  </li>
                  <li className="text-gray-300">
                    <span className="text-xl"><strong className="text-white">AI-Powered Precision:</strong> Personalized solutions for every user.</span>
                  </li>
                  <li className="text-gray-300">
                    <span className="text-xl"><strong className="text-white">Secure & Compliant:</strong> GDPR, CCPA, and PIPEDA standards.</span>
                  </li>
                  <li className="text-gray-300">
                    <span className="text-xl"><strong className="text-white">Accessible & Multilingual:</strong> Available in English, French, and Spanish.</span>
                  </li>
                  <li className="text-gray-300">
                    <span className="text-xl"><strong className="text-white">Future-Ready:</strong> Designed to empower people and organizations for the next era of intelligent innovation.</span>
                  </li>
                </ul>
                <p className="text-center text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mt-12">
                  ✨ Kimuntu ProLaunch AI — Where Ambition Meets Artificial Intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Login/Signup Page
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
        <header className="relative z-10 p-6">
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-4">
          <div className="w-full max-w-md mx-auto">
              <div className="bg-white/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-black/50">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? t.welcomeBack : t.getStarted}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {isLogin ? t.continueJourney : t.createAccount}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-white/5 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        placeholder="your@email.com"
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-white/5 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-emerald-500/25"
                  >
                    {authLoading ? t.processing : (isLogin ? t.signIn : t.signUp)}
                  </button>
                </div>

                <div className="relative my-6">
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
                  className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Chrome className="w-5 h-5" />
                  {t.continueWithGoogle}
                </button>

                <p className="text-center text-gray-400 text-sm mt-6">
                  {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
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

  // Dashboard
  const navItems = [
    { id: 'overview', label: t.overview, icon: Home },
    { id: 'career', label: t.career, icon: Briefcase },
    { id: 'business', label: t.business, icon: TrendingUp },
    { id: 'legal', label: t.legal, icon: Scale },
    { id: 'documents', label: t.documents, icon: FileText },
    { id: 'support', label: t.support, icon: HelpCircle },
  ];

  const stats = [
    { label: t.documentsCreated, value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: t.jobMatches, value: '48', icon: Target, color: 'bg-emerald-500' },
    { label: t.aiQueries, value: '156', icon: Zap, color: 'bg-purple-500' },
  ];

  const actions = [
    { title: t.createCvResume, desc: t.cvResumeDesc, icon: FileText, bg: 'bg-emerald-500/20', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { title: t.businessPlan, desc: t.businessPlanDesc, icon: TrendingUp, bg: 'bg-blue-500/20', border: 'border-blue-500/20', text: 'text-blue-400' },
    { title: t.legalAssistant, desc: t.legalAssistantDesc, icon: Scale, bg: 'bg-purple-500/20', border: 'border-purple-500/20', text: 'text-purple-400' },
    { title: t.jobMatching, desc: t.jobMatchingDesc, icon: Briefcase, bg: 'bg-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-400' },
    { title: t.interviewPrep, desc: t.interviewPrepDesc, icon: Users, bg: 'bg-pink-500/20', border: 'border-pink-500/20', text: 'text-pink-400' },
    { title: t.documentReview, desc: t.documentReviewDesc, icon: BookOpen, bg: 'bg-indigo-500/20', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'landing':
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
      case 'overview':
        return (
          <div>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-8">{t.dashboardOverview}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      </div>
                      <stat.icon className="w-8 h-8 text-emerald-400 opacity-50" />
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                      <div className={`${stat.color} h-full w-3/4`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {actions.map((action, i) => (
                  <div
                    key={i}
                    className={`group ${action.bg} backdrop-blur border ${action.border} rounded-2xl p-6 text-left hover:bg-white/10 transition-all duration-300 cursor-pointer`}
                  >
                    <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-6 h-6 ${action.text}`} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{action.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{action.desc}</p>
                    <div className="flex items-center text-emerald-400 text-sm font-medium">
                      {t.getStarted} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'career':
        return <CareerTrack language={language} />;
      case 'business':
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
      case 'legal':
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
      case 'documents':
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
      case 'support':
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/60 backdrop-blur-xl border-r border-gray-800">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <button 
              onClick={() => {
                console.log('Logo clicked, navigating to landing page');
                setActiveSection('landing');
              }}
              className="mb-8 cursor-pointer hover:opacity-80 transition-opacity w-full flex items-center justify-center bg-transparent border-none p-0"
              type="button"
            >
              <img 
                src="/kimuntu_logo_black.png" 
                alt="KimuntuPro AI Logo" 
                className="h-36 w-full object-contain"
              />
            </button>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4 mb-4 border border-emerald-500/20">
              <p className="text-xs text-gray-400 mb-1">{t.loggedInAs}</p>
              <p className="text-white text-sm font-medium truncate">{user?.email || user?.displayName}</p>
            </div>
            
            {/* Language Toggle */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  language === 'en' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  language === 'fr' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                FR
              </button>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{t.signOut}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default App;