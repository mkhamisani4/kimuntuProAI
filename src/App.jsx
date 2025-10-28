import React, { useState, useEffect } from 'react';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, ChevronRight, Mail, Lock, Chrome, Sparkles, BarChart, Shield, Zap, Target, BookOpen, X } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import CareerTrack from './components/CareerTrack';
import Overview from './components/Overview';
import BusinessTrack from './components/BusinessTrack';
import LegalTrack from './components/LegalTrack';
import Documents from './components/Documents';
import Support from './components/Support';

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
        return <Overview t={t} />;
      case 'career':
        return <CareerTrack language={language} />;
      case 'business':
        return <BusinessTrack t={t} />;
      case 'legal':
        return <LegalTrack t={t} />;
      case 'documents':
        return <Documents t={t} />;
      case 'support':
        return <Support t={t} />;
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