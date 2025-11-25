import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, FileText, TrendingUp, AlertCircle, Target, Loader, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as openai from '../services/openaiService';

const AIAssistantModal = ({ isOpen, onClose, currentProject, onApplySuggestion }) => {
    const { isDark } = useTheme();
    const [activeFeature, setActiveFeature] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const features = [
        {
            id: 'ideas',
            icon: Lightbulb,
            title: 'Generate Ideas',
            description: 'Get AI-powered project ideas',
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const ideas = await openai.generateProjectIdeas(currentProject.category);
                    setResult({ type: 'ideas', data: ideas });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        },
        {
            id: 'title',
            icon: FileText,
            title: 'Suggest Titles',
            description: 'Generate creative project titles',
            disabled: !currentProject.description,
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const titles = await openai.generateTitleSuggestions(
                        currentProject.description,
                        currentProject.category
                    );
                    setResult({ type: 'titles', data: titles });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        },
        {
            id: 'enhance',
            icon: Sparkles,
            title: 'Enhance Description',
            description: 'Improve your project description',
            disabled: !currentProject.description,
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const enhanced = await openai.enhanceDescription(
                        currentProject.description,
                        currentProject.category
                    );
                    setResult({ type: 'description', data: enhanced });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        },
        {
            id: 'market',
            icon: TrendingUp,
            title: 'Market Analysis',
            description: 'Get market insights',
            disabled: !currentProject.title,
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const analysis = await openai.generateMarketAnalysis(
                        currentProject.category,
                        currentProject.title
                    );
                    setResult({ type: 'market', data: analysis });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        },
        {
            id: 'resources',
            icon: Target,
            title: 'Resource Recommendations',
            description: 'Get required resources',
            disabled: !currentProject.description,
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const resources = await openai.recommendResources(
                        currentProject.description,
                        currentProject.category
                    );
                    setResult({ type: 'resources', data: resources });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        },
        {
            id: 'challenges',
            icon: AlertCircle,
            title: 'Identify Challenges',
            description: 'Find potential risks',
            disabled: !currentProject.description,
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const challenges = await openai.identifyChallenges(
                        currentProject.description,
                        currentProject.category
                    );
                    setResult({ type: 'challenges', data: challenges });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        },
        {
            id: 'goals',
            icon: Target,
            title: 'Generate Goals',
            description: 'Create SMART goals',
            disabled: !currentProject.description,
            action: async () => {
                setLoading(true);
                setError('');
                try {
                    const goals = await openai.generateGoals(
                        currentProject.description,
                        currentProject.category
                    );
                    setResult({ type: 'goals', data: goals });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        }
    ];

    const renderResult = () => {
        if (!result) return null;

        switch (result.type) {
            case 'ideas':
                return (
                    <div className="space-y-4">
                        {result.data.map((idea, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {idea.title}
                                </h4>
                                <p className="text-sm mb-3">{idea.description}</p>
                                <button
                                    onClick={() => {
                                        onApplySuggestion('title', idea.title);
                                        onApplySuggestion('description', idea.description);
                                        onClose();
                                    }}
                                    className={`text-sm px-4 py-2 rounded-lg ${isDark
                                            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                >
                                    Use This Idea
                                </button>
                            </div>
                        ))}
                    </div>
                );

            case 'titles':
                return (
                    <div className="space-y-2">
                        {result.data.map((title, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    onApplySuggestion('title', title);
                                    onClose();
                                }}
                                className={`w-full text-left p-3 rounded-lg border ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    } transition-all`}
                            >
                                {title}
                            </button>
                        ))}
                    </div>
                );

            case 'description':
                return (
                    <div>
                        <div
                            className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{result.data}</p>
                        </div>
                        <button
                            onClick={() => {
                                onApplySuggestion('description', result.data);
                                onClose();
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                            Apply Description
                        </button>
                    </div>
                );

            case 'market':
                return (
                    <div
                        className={`p-4 rounded-xl border whitespace-pre-wrap ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'
                            }`}
                    >
                        {result.data}
                    </div>
                );

            case 'resources':
            case 'goals':
                return (
                    <div className="space-y-2">
                        {result.data.map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg border flex items-start gap-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'
                                    }`} />
                                <span>{item}</span>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const fieldName = result.type === 'resources' ? 'resources' : 'goals';
                                onApplySuggestion(fieldName, result.data.join('\n• '));
                                onClose();
                            }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                            Apply to Form
                        </button>
                    </div>
                );

            case 'challenges':
                return (
                    <div className="space-y-3">
                        {result.data.map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <p className="font-semibold">{item.challenge}</p>
                                </div>
                                <p className="text-sm ml-7">{item.mitigation}</p>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const challengesText = result.data
                                    .map(c => `${c.challenge}\nMitigation: ${c.mitigation}`)
                                    .join('\n\n');
                                onApplySuggestion('challenges', challengesText);
                                onClose();
                            }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                            Apply to Form
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    // Check if API is configured
    const isConfigured = openai.isConfigured();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl ${isDark
                        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10'
                        : 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border border-gray-200'
                    } shadow-2xl`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            AI Assistant
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                            }`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!isConfigured ? (
                        <div className={`p-6 rounded-xl border text-center ${isDark
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-yellow-50 border-yellow-300'
                            }`}>
                            <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'
                                }`} />
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                OpenAI API Key Not Configured
                            </h3>
                            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                To use AI features, please add your OpenAI API key to the <code className="px-2 py-1 rounded bg-black/20">.env</code> file:
                            </p>
                            <code className={`block p-3 rounded-lg text-sm ${isDark ? 'bg-black/40' : 'bg-gray-100'
                                }`}>
                                VITE_OPENAI_API_KEY=your_api_key_here
                            </code>
                            <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">platform.openai.com/api-keys</a>
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Features Grid */}
                            {!activeFeature && !result && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {features.map((feature) => (
                                        <button
                                            key={feature.id}
                                            onClick={() => {
                                                if (!feature.disabled) {
                                                    setActiveFeature(feature);
                                                    feature.action();
                                                }
                                            }}
                                            disabled={feature.disabled}
                                            className={`p-5 rounded-xl border text-left transition-all ${feature.disabled
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : isDark
                                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                                    }`}>
                                                    <feature.icon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                                        }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {feature.title}
                                                    </h4>
                                                    <p className="text-sm">{feature.description}</p>
                                                    {feature.disabled && (
                                                        <p className="text-xs mt-2 text-yellow-500">
                                                            Fill in required fields first
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader className={`w-12 h-12 animate-spin mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                        }`} />
                                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                        AI is thinking...
                                    </p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className={`p-4 rounded-xl border ${isDark
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-red-50 border-red-300'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className={`font-semibold mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                                                Error
                                            </p>
                                            <p className="text-sm">{error}</p>
                                            <button
                                                onClick={() => {
                                                    setError('');
                                                    setResult(null);
                                                    setActiveFeature(null);
                                                }}
                                                className="mt-3 text-sm underline"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Result Display */}
                            {!loading && !error && result && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {activeFeature?.title}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setResult(null);
                                                setActiveFeature(null);
                                            }}
                                            className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
                                        >
                                            ← Back
                                        </button>
                                    </div>
                                    {renderResult()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;
