import React, { useState, useEffect } from 'react';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, ChevronRight, Mail, Lock, Chrome, Sparkles, BarChart, Shield, Zap, Target, BookOpen, Sun, Moon, Rocket } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from './context/ThemeContext';
import Footer from './components/Footer';
import InnovativeTrack from './components/InnovativeTrack';
import { getCurrentRoute, isPageRoute, getPageName } from './utils/router';
import logo1 from '../assets/LOGOS(4).svg';
import logo2 from '../assets/LOGOS(8).svg';
import logo3 from '../assets/LOGOS(9).svg';
import whiteLogo from '../assets/white_logo.png';
import darkLogo from '../assets/dark_logo.png';

// Import footer pages
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import GDPR from './pages/GDPR';
import License from './pages/License';
import About from './pages/About';
import Team from './pages/Team';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Press from './pages/Press';
import Docs from './pages/Docs';
import API from './pages/API';
import Community from './pages/Community';
import SupportCenter from './pages/SupportCenter';
import Status from './pages/Status';

const App = () => {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle hash route changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getCurrentRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
      // User-friendly error messages
      const errorCode = err.code;
      let friendlyMessage = '';

      if (errorCode === 'auth/invalid-credential') {
        friendlyMessage = "Doesn't look like you have an account with us. Please sign up or check your credentials.";
      } else if (errorCode === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered. Please sign in instead or use a different email.";
      } else if (errorCode === 'auth/weak-password') {
        friendlyMessage = "Password should be at least 6 characters long.";
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (errorCode === 'auth/user-not-found') {
        friendlyMessage = "No account found with this email. Please sign up first.";
      } else if (errorCode === 'auth/wrong-password') {
        friendlyMessage = "Incorrect password. Please try again.";
      } else {
        friendlyMessage = err.message || 'Authentication failed. Please try again.';
      }

      setError(friendlyMessage);
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
      setError('Google sign-in failed. Please try again.');
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

  // Render footer pages if navigated to one
  if (isPageRoute(currentRoute)) {
    const pageName = getPageName(currentRoute);
    const pageComponents = {
      privacy: Privacy,
      terms: Terms,
      cookies: Cookies,
      gdpr: GDPR,
      license: License,
      about: About,
      team: Team,
      careers: Careers,
      blog: Blog,
      press: Press,
      docs: Docs,
      api: API,
      community: Community,
      support: SupportCenter,
      status: Status,
    };
    const PageComponent = pageComponents[pageName];
    if (PageComponent) {
      return <PageComponent />;
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }`}>
        <div className="flex flex-col items-center gap-4">
          <img src={logo1} alt="KimuntuPro AI" className="w-20 h-20 animate-bounce" />
          <div className={`text-2xl font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Landing/Login Page
  if (!user) {
    return (
      <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }`}>
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-full ${isDark
            ? 'bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900'
            : 'bg-gradient-to-br from-blue-50 via-purple-100/50 to-pink-50'
            }`}></div>
          <div className={`absolute top-20 -left-20 w-96 h-96 rounded-full filter blur-3xl opacity-30 animate-pulse ${isDark ? 'bg-purple-500' : 'bg-purple-300'
            }`}></div>
          <div className={`absolute bottom-20 -right-20 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-pink-500' : 'bg-pink-300'
            }`} style={{ animationDelay: '2s' }}></div>
          <div className={`absolute top-1/2 left-1/2 w-72 h-72 rounded-full filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-300'
            }`} style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo1} alt="KimuntuPro AI Logo" className="w-12 h-12" />
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              KimuntuPro AI
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-4 py-8">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="flex justify-center lg:justify-start mb-6">
                <img src={logo2} alt="KimuntuPro" className="h-16 w-auto" />
              </div>

              <h1 className={`text-5xl lg:text-6xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Empowering Your{' '}
                <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Future with AI
                </span>
              </h1>

              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                  ? 'bg-white/10 backdrop-blur-lg border border-white/20'
                  : 'bg-white/60 backdrop-blur-lg border border-gray-200'
                  }`}>
                  <Briefcase className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Career Development</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                  ? 'bg-white/10 backdrop-blur-lg border border-white/20'
                  : 'bg-white/60 backdrop-blur-lg border border-gray-200'
                  }`}>
                  <BarChart className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Business Planning</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark
                  ? 'bg-white/10 backdrop-blur-lg border border-white/20'
                  : 'bg-white/60 backdrop-blur-lg border border-gray-200'
                  }`}>
                  <Shield className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Legal Support</span>
                </div>
              </div>
            </div>

            {/* Right side - Glassmorphism Login Card */}
            <div className="w-full max-w-md mx-auto">
              <div className={`relative group ${isDark
                ? 'bg-white/5 backdrop-blur-2xl border border-white/20'
                : 'bg-white/40 backdrop-blur-2xl border border-white/60'
                } rounded-3xl p-8 shadow-2xl`}>
                {/* Glass reflection effect */}
                <div className={`absolute inset-0 rounded-3xl ${isDark
                  ? 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
                  : 'bg-gradient-to-br from-white/50 via-transparent to-transparent'
                  } pointer-events-none`}></div>

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <img src={logo3} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isLogin ? 'Sign in to continue your journey' : 'Create your account today'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Email</label>
                      <div className="relative group">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                            ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20'
                            : 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            } focus:outline-none backdrop-blur-xl`}
                          placeholder="your@email.com"
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Password</label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all ${isDark
                            ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20'
                            : 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            } focus:outline-none backdrop-blur-xl`}
                          placeholder="••••••••"
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className={`${isDark
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-red-50/80 border border-red-300 text-red-700'
                        } backdrop-blur-xl text-sm p-3 rounded-lg`}>
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleEmailAuth}
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-purple-500/25"
                    >
                      {authLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className={`px-3 ${isDark ? 'bg-slate-900 text-gray-400' : 'bg-purple-50 text-gray-600'
                        }`}>Or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className={`w-full font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 ${isDark
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-white/80 text-gray-900 hover:bg-white border border-gray-300'
                      } backdrop-blur-xl shadow-lg`}
                  >
                    <Chrome className="w-5 h-5" />
                    Continue with Google
                  </button>

                  <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setEmail('');
                        setPassword('');
                      }}
                      className={`font-medium ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                        }`}
                      disabled={authLoading}
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggle - Bottom Center */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={toggleTheme}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isDark
              ? 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
              : 'bg-white/40 backdrop-blur-xl border border-gray-300 hover:bg-white/60'
              }`}
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-purple-600" />
            )}
          </button>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  // Dashboard
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'career', label: 'Career Track', icon: Briefcase },
    { id: 'business', label: 'Business Track', icon: TrendingUp },
    { id: 'legal', label: 'Legal Track', icon: Scale },
    { id: 'innovative', label: 'Innovative Track', icon: Rocket },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const stats = [
    { label: 'Documents Created', value: '12', icon: FileText, color: isDark ? 'bg-blue-500' : 'bg-blue-400' },
    { label: 'Job Matches', value: '48', icon: Target, color: isDark ? 'bg-purple-500' : 'bg-purple-400' },
    { label: 'AI Queries', value: '156', icon: Zap, color: isDark ? 'bg-pink-500' : 'bg-pink-400' },
  ];

  const actions = [
    {
      title: 'Create CV/Resume',
      desc: 'AI-powered resume builder',
      icon: FileText,
      bg: isDark ? 'bg-purple-500/10' : 'bg-purple-100',
      border: isDark ? 'border-purple-500/30' : 'border-purple-300',
      text: isDark ? 'text-purple-400' : 'text-purple-600'
    },
    {
      title: 'Business Plan',
      desc: 'Generate comprehensive plans',
      icon: TrendingUp,
      bg: isDark ? 'bg-blue-500/10' : 'bg-blue-100',
      border: isDark ? 'border-blue-500/30' : 'border-blue-300',
      text: isDark ? 'text-blue-400' : 'text-blue-600'
    },
    {
      title: 'Legal Assistant',
      desc: 'Get legal guidance',
      icon: Scale,
      bg: isDark ? 'bg-pink-500/10' : 'bg-pink-100',
      border: isDark ? 'border-pink-500/30' : 'border-pink-300',
      text: isDark ? 'text-pink-400' : 'text-pink-600'
    },
    {
      title: 'Job Matching',
      desc: 'Find perfect opportunities',
      icon: Briefcase,
      bg: isDark ? 'bg-orange-500/10' : 'bg-orange-100',
      border: isDark ? 'border-orange-500/30' : 'border-orange-300',
      text: isDark ? 'text-orange-400' : 'text-orange-600'
    },
    {
      title: 'Interview Prep',
      desc: 'Practice with AI coach',
      icon: Users,
      bg: isDark ? 'bg-teal-500/10' : 'bg-teal-100',
      border: isDark ? 'border-teal-500/30' : 'border-teal-300',
      text: isDark ? 'text-teal-400' : 'text-teal-600'
    },
    {
      title: 'Document Review',
      desc: 'AI contract analysis',
      icon: BookOpen,
      bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-100',
      border: isDark ? 'border-indigo-500/30' : 'border-indigo-300',
      text: isDark ? 'text-indigo-400' : 'text-indigo-600'
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <div className="mb-10">
              <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Dashboard Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`relative group ${isDark
                      ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10'
                      : 'bg-white/60 backdrop-blur-xl border border-gray-200 hover:bg-white/80'
                      } rounded-2xl p-6 transition-all duration-300 shadow-lg`}
                  >
                    <div className={`absolute inset-0 rounded-2xl ${isDark
                      ? 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
                      : 'bg-gradient-to-br from-white/40 via-transparent to-transparent'
                      } pointer-events-none`}></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stat.label}
                          </p>
                          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {stat.value}
                          </p>
                        </div>
                        <stat.icon className={`w-8 h-8 opacity-50 ${isDark ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                      </div>
                      <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-300'
                        }`}>
                        <div className={`${stat.color} h-full w-3/4`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {actions.map((action, i) => (
                  <div
                    key={i}
                    className={`group relative ${action.bg} backdrop-blur-xl border ${action.border} rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg`}
                  >
                    <div className={`absolute inset-0 rounded-2xl ${isDark
                      ? 'bg-gradient-to-br from-white/5 via-transparent to-transparent'
                      : 'bg-gradient-to-br from-white/30 via-transparent to-transparent'
                      } pointer-events-none`}></div>

                    <div className="relative z-10">
                      <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                        <action.icon className={`w-6 h-6 ${action.text}`} />
                      </div>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {action.title}
                      </h3>
                      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {action.desc}
                      </p>
                      <div className={`flex items-center ${action.text} text-sm font-medium`}>
                        Get Started
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'career':
        return (
          <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Career Track
            </h2>
            <div className={`${isDark
              ? 'bg-white/5 backdrop-blur-xl border border-white/10'
              : 'bg-white/60 backdrop-blur-xl border border-gray-200'
              } rounded-2xl p-8 shadow-lg`}>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Explore AI-powered career opportunities and development paths.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Job Recommendations', 'Skill Assessment', 'Interview Training', 'Resume Optimization'].map((item, i) => (
                  <div
                    key={i}
                    className={`${isDark
                      ? 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20'
                      : 'bg-purple-100 border border-purple-300 hover:bg-purple-200'
                      } backdrop-blur-xl rounded-lg p-4 cursor-pointer transition-all`}
                  >
                    <p className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'business':
        return (
          <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Business Track
            </h2>
            <div className={`${isDark
              ? 'bg-white/5 backdrop-blur-xl border border-white/10'
              : 'bg-white/60 backdrop-blur-xl border border-gray-200'
              } rounded-2xl p-8 shadow-lg`}>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Build and scale your business with AI-driven insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Business Plan Generator', 'Market Analysis', 'Financial Forecasting', 'Growth Strategy'].map((item, i) => (
                  <div
                    key={i}
                    className={`${isDark
                      ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20'
                      : 'bg-blue-100 border border-blue-300 hover:bg-blue-200'
                      } backdrop-blur-xl rounded-lg p-4 cursor-pointer transition-all`}
                  >
                    <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'legal':
        return (
          <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Legal Track
            </h2>
            <div className={`${isDark
              ? 'bg-white/5 backdrop-blur-xl border border-white/10'
              : 'bg-white/60 backdrop-blur-xl border border-gray-200'
              } rounded-2xl p-8 shadow-lg`}>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Access legal guidance and document analysis.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Contract Review', 'Legal Templates', 'Compliance Check', 'Document Drafting'].map((item, i) => (
                  <div
                    key={i}
                    className={`${isDark
                      ? 'bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20'
                      : 'bg-pink-100 border border-pink-300 hover:bg-pink-200'
                      } backdrop-blur-xl rounded-lg p-4 cursor-pointer transition-all`}
                  >
                    <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Documents
            </h2>
            <div className={`${isDark
              ? 'bg-white/5 backdrop-blur-xl border border-white/10'
              : 'bg-white/60 backdrop-blur-xl border border-gray-200'
              } rounded-2xl p-8 shadow-lg`}>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your documents will appear here
              </p>
              <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all shadow-lg">
                Create New Document
              </button>
            </div>
          </div>
        );
      case 'innovative':
        return <InnovativeTrack user={user} />;
      case 'support':
        return (
          <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${isDark
                ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <HelpCircle className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  FAQ
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Find answers to common questions about KimuntuPro AI.
                </p>
              </div>
              <div className={`${isDark
                ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <Mail className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Contact Us
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  support@kimuntupro.com
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
      {/* Glassmorphism Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 backdrop-blur-2xl border-r shadow-2xl z-40 ${isDark
        ? 'bg-black/40 border-white/10'
        : 'bg-white/30 border-gray-200'
        }`}>
        <div className={`absolute inset-0 ${isDark
          ? 'bg-gradient-to-br from-white/5 via-transparent to-transparent'
          : 'bg-gradient-to-br from-white/40 via-transparent to-transparent'
          } pointer-events-none`}></div>

        <div className="flex flex-col h-full relative z-10">
          <div className="p-6">
            <button
              onClick={() => setActiveSection('overview')}
              className="flex items-center justify-center mb-8 hover:opacity-80 transition-opacity cursor-pointer w-full"
            >
              <img
                src={isDark ? whiteLogo : darkLogo}
                alt="KimuntuPro AI"
                className="h-36 w-auto"
              />
            </button>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === item.id
                    ? isDark
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-l-2 border-purple-400 backdrop-blur-xl'
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-l-2 border-purple-600'
                    : isDark
                      ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6">
            <div className={`rounded-xl p-4 mb-4 backdrop-blur-xl ${isDark
              ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30'
              : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-300'
              }`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Logged in as
              </p>
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.email || user?.displayName}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all backdrop-blur-xl ${isDark
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-300'
                }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="min-h-screen p-8">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Theme Toggle - Bottom Center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={toggleTheme}
          className={`p-4 rounded-full transition-all duration-300 shadow-xl ${isDark
            ? 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
            : 'bg-white/40 backdrop-blur-xl border border-gray-300 hover:bg-white/60'
            }`}
        >
          {isDark ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-purple-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default App;
