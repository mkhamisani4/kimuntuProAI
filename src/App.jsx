import React, { useState, useEffect } from 'react';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, ChevronRight, Mail, Lock, Chrome, Sparkles, BarChart, Shield, Zap, Target, BookOpen } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [authLoading, setAuthLoading] = useState(false);

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-7 h-7 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">KimuntuPro AI</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-4">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Empowering Your{' '}
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Future with AI
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <span>Career Development</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <BarChart className="w-5 h-5 text-emerald-400" />
                  <span>Business Planning</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>Legal Support</span>
                </div>
              </div>
            </div>

            {/* Right side - Login Card */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-black/50">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {isLogin ? 'Sign in to continue your journey' : 'Create your account today'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
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
                    {authLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-black text-gray-400">Or</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </button>

                <p className="text-center text-gray-400 text-sm mt-6">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
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
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'career', label: 'Career Track', icon: Briefcase },
    { id: 'business', label: 'Business Track', icon: TrendingUp },
    { id: 'legal', label: 'Legal Track', icon: Scale },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const stats = [
    { label: 'Documents Created', value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: 'Job Matches', value: '48', icon: Target, color: 'bg-emerald-500' },
    { label: 'AI Queries', value: '156', icon: Zap, color: 'bg-purple-500' },
  ];

  const actions = [
    { title: 'Create CV/Resume', desc: 'AI-powered resume builder', icon: FileText, bg: 'bg-emerald-500/20', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { title: 'Business Plan', desc: 'Generate comprehensive plans', icon: TrendingUp, bg: 'bg-blue-500/20', border: 'border-blue-500/20', text: 'text-blue-400' },
    { title: 'Legal Assistant', desc: 'Get legal guidance', icon: Scale, bg: 'bg-purple-500/20', border: 'border-purple-500/20', text: 'text-purple-400' },
    { title: 'Job Matching', desc: 'Find perfect opportunities', icon: Briefcase, bg: 'bg-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-400' },
    { title: 'Interview Prep', desc: 'Practice with AI coach', icon: Users, bg: 'bg-pink-500/20', border: 'border-pink-500/20', text: 'text-pink-400' },
    { title: 'Document Review', desc: 'AI contract analysis', icon: BookOpen, bg: 'bg-indigo-500/20', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
              
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
                      Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
            <h2 className="text-3xl font-bold text-white mb-8">Career Track</h2>
            <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
              <p className="text-gray-300 mb-4">Explore AI-powered career opportunities and development paths.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Job Recommendations', 'Skill Assessment', 'Interview Training', 'Resume Optimization'].map((item, i) => (
                  <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 cursor-pointer hover:bg-emerald-500/20 transition-all">
                    <p className="text-emerald-400 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'business':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Business Track</h2>
            <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
              <p className="text-gray-300 mb-4">Build and scale your business with AI-driven insights.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Business Plan Generator', 'Market Analysis', 'Financial Forecasting', 'Growth Strategy'].map((item, i) => (
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
            <h2 className="text-3xl font-bold text-white mb-8">Legal Track</h2>
            <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
              <p className="text-gray-300 mb-4">Access legal guidance and document analysis.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Contract Review', 'Legal Templates', 'Compliance Check', 'Document Drafting'].map((item, i) => (
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
            <h2 className="text-3xl font-bold text-white mb-8">My Documents</h2>
            <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
              <p className="text-gray-400 mb-6">Your documents will appear here</p>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all">
                Create New Document
              </button>
            </div>
          </div>
        );
      case 'support':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
                <HelpCircle className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-white font-semibold mb-3">FAQ</h3>
                <p className="text-gray-400 text-sm">Find answers to common questions about KimuntuPro AI.</p>
              </div>
              <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
                <Mail className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-white font-semibold mb-3">Contact Us</h3>
                <p className="text-gray-400 text-sm">support@kimuntupro.com</p>
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white">KimuntuPro</span>
            </div>
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
              <p className="text-xs text-gray-400 mb-1">Logged in as</p>
              <p className="text-white text-sm font-medium truncate">{user?.email || user?.displayName}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
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