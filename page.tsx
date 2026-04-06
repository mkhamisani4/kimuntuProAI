'use client';

/**
 * Immigration Law AI Assistant
 * Provides guidance on US and Canadian immigration law
 * including visa types, processes, requirements, and legal rights
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  Lock, 
  AlertTriangle, 
  X, 
  Globe, 
  FileText,
  Users,
  Briefcase,
  BookOpen,
  Shield,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ImmigrationResult {
  answer: string;
  jurisdiction: 'US' | 'Canada' | 'Both';
  sources: Array<{
    type: 'legal' | 'official' | 'case';
    title: string;
    url?: string;
    citation?: string;
  }>;
  relatedTopics: string[];
  disclaimer: string;
  meta: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    latencyMs: number;
    timestamp: string;
  };
}

export default function ImmigrationLawAssistant() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImmigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'auth' | 'server' | null>(null);

  // Form state
  const [jurisdiction, setJurisdiction] = useState<'US' | 'Canada' | 'Both'>('US');
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const categories = {
    US: [
      'Visa Types (H-1B, F-1, etc.)',
      'Green Card/Permanent Residence',
      'Citizenship & Naturalization',
      'Family-Based Immigration',
      'Employment-Based Immigration',
      'Asylum & Refugee Status',
      'Deportation & Removal',
      'Work Authorization (EAD)',
      'Travel Documents',
      'Immigration Court Procedures'
    ],
    Canada: [
      'Express Entry System',
      'Provincial Nominee Program (PNP)',
      'Work Permits',
      'Study Permits',
      'Family Sponsorship',
      'Permanent Residence',
      'Citizenship',
      'Refugee Claims',
      'Inadmissibility Issues',
      'Appeals & Reviews'
    ],
    Both: [
      'Cross-Border Work',
      'Dual Citizenship',
      'Travel Between Countries',
      'Document Recognition',
      'General Immigration Comparison'
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !category) {
      setError('Please provide both a category and question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/legal/immigration/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jurisdiction,
          category,
          question: question.trim(),
          context: context.trim(),
          userId: user?.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get immigration law guidance');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
      setErrorType('server');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  const quickQuestions = [
    {
      question: "What are the requirements for H-1B visa?",
      jurisdiction: "US" as const,
      category: "Visa Types (H-1B, F-1, etc.)"
    },
    {
      question: "How does Express Entry work in Canada?",
      jurisdiction: "Canada" as const,
      category: "Express Entry System"
    },
    {
      question: "Can I work in the US while my green card is pending?",
      jurisdiction: "US" as const,
      category: "Work Authorization (EAD)"
    },
    {
      question: "What is the Provincial Nominee Program?",
      jurisdiction: "Canada" as const,
      category: "Provincial Nominee Program (PNP)"
    }
  ];

  return (
    <div className={`min-h-screen p-4 md:p-8 ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/legal')}
            className={`flex items-center gap-2 mb-4 ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Legal Track
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Immigration Law Assistant
              </h1>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Get guidance on US and Canadian immigration law
              </p>
            </div>
            
            <div className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <Globe className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  US & Canada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark 
              ? 'bg-red-900/20 border-red-500/40 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Error
                </p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
              <button onClick={clearError} className="ml-4">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Form */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-6 ${
              isDark 
                ? 'bg-gray-900/80 border border-gray-800' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Jurisdiction Selector */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Jurisdiction
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['US', 'Canada', 'Both'] as const).map((j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setJurisdiction(j);
                          setCategory('');
                        }}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          jurisdiction === j
                            ? isDark
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-600 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Immigration Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select a category...</option>
                    {categories[jurisdiction].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    rows={4}
                    placeholder="e.g., What documents do I need to apply for a work permit?"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Additional Context */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Additional Context (Optional)
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                    placeholder="Provide any relevant details about your situation..."
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !question.trim() || !category}
                  className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                    loading || !question.trim() || !category
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Get Immigration Guidance'
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && (
              <div className={`mt-6 rounded-2xl p-6 ${
                isDark 
                  ? 'bg-gray-900/80 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              } shadow-lg`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Immigration Law Guidance
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-50 text-green-700'
                  }`}>
                    {result.jurisdiction}
                  </span>
                </div>

                {/* Answer */}
                <div className={`mb-6 p-4 rounded-lg ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <div className={`prose max-w-none ${
                    isDark ? 'prose-invert' : ''
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: result.answer }} />
                  </div>
                </div>

                {/* Sources */}
                {result.sources.length > 0 && (
                  <div className="mb-6">
                    <h4 className={`text-sm font-semibold mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Legal Sources & References
                    </h4>
                    <div className="space-y-2">
                      {result.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isDark ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {source.title}
                              </p>
                              {source.citation && (
                                <p className={`text-xs mt-1 ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {source.citation}
                                </p>
                              )}
                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs mt-1 inline-block ${
                                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                  }`}
                                >
                                  View source →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Topics */}
                {result.relatedTopics.length > 0 && (
                  <div className="mb-6">
                    <h4 className={`text-sm font-semibold mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Related Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.relatedTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuestion(topic)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isDark 
                              ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          } transition-colors`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-yellow-900/20 border-yellow-500/40 text-yellow-300' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-900'
                }`}>
                  <p className="text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{result.disclaimer}</span>
                  </p>
                </div>

                {/* Export Options */}
                <div className="mt-6 flex gap-3">
                  <button
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      const text = `# Immigration Law Guidance\n\n${result.answer}\n\n## Sources\n${result.sources.map(s => `- ${s.title}`).join('\n')}`;
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    onClick={() => {
                      // TODO: Implement PDF export
                      alert('PDF export coming soon!');
                    }}
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <div className={`rounded-2xl p-6 ${
              isDark 
                ? 'bg-gray-900/80 border border-gray-800' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Questions
              </h3>
              <div className="space-y-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setJurisdiction(q.jurisdiction);
                      setCategory(q.category);
                      setQuestion(q.question);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <p className="text-sm line-clamp-2">{q.question}</p>
                    <span className={`text-xs mt-1 inline-block ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {q.jurisdiction}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className={`rounded-2xl p-6 ${
              isDark 
                ? 'bg-blue-900/20 border border-blue-500/40' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <Shield className={`w-6 h-6 mt-1 flex-shrink-0 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <h4 className={`font-semibold mb-2 ${
                    isDark ? 'text-blue-300' : 'text-blue-900'
                  }`}>
                    Legal Disclaimer
                  </h4>
                  <p className={`text-sm ${
                    isDark ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    This tool provides general information only and is not legal advice. 
                    For specific immigration matters, please consult with a licensed immigration attorney.
                  </p>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className={`rounded-2xl p-6 ${
              isDark 
                ? 'bg-gray-900/80 border border-gray-800' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Official Resources
              </h3>
              <div className="space-y-3">
                <a
                  href="https://www.uscis.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-3 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-blue-400'
                      : 'bg-gray-50 hover:bg-gray-100 text-blue-600'
                  }`}
                >
                  <p className="text-sm font-medium">USCIS (US)</p>
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Official US immigration services
                  </p>
                </a>
                <a
                  href="https://www.canada.ca/en/immigration-refugees-citizenship.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-3 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-blue-400'
                      : 'bg-gray-50 hover:bg-gray-100 text-blue-600'
                  }`}
                >
                  <p className="text-sm font-medium">IRCC (Canada)</p>
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Immigration, Refugees and Citizenship Canada
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
