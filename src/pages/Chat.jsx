'use client';

import React, { useMemo, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Bot,
    KeyRound,
    ShieldAlert,
    Send,
    RotateCcw,
    Sparkles,
    MessageSquare,
    Database,
    Scale
} from 'lucide-react';

const starterPrompts = [
    'What are the elements of theft in Canada vs the US?',
    'Summarize self-defense standards in both jurisdictions.',
    'How does bail work in Canada and the US?',
    'What is the difference between assault and battery?'
];

const buildDemoResponse = (text) => {
    const query = text.toLowerCase();

    if (query.includes('theft')) {
        return 'In Canada, theft is generally defined in the Criminal Code and requires proof of taking or converting property with intent to deprive. In the US, theft definitions vary by state, with common elements around unlawful taking and intent. The assistant can compare elements, grading, and penalties side-by-side when the database is fully populated.';
    }

    if (query.includes('self-defense') || query.includes('defense')) {
        return 'Self-defense in Canada is grounded in the Criminal Code with a reasonableness analysis. In the US, standards vary by state (duty to retreat vs stand-your-ground). The assistant can surface jurisdiction-specific tests, key case law, and thresholds.';
    }

    if (query.includes('bail')) {
        return 'Bail frameworks differ by jurisdiction: Canada uses a ladder principle with release presumption, while the US uses federal and state pretrial release standards. The assistant can highlight key statutory factors and recent reforms.';
    }

    if (query.includes('assault') || query.includes('battery')) {
        return 'Assault in Canada focuses on the application or threat of force without consent. In many US states, assault and battery are separate offenses, with assault often involving threat and battery involving contact. The assistant can map definitions and elements across jurisdictions.';
    }

    return 'I can help compare criminal law concepts across Canada and the US. Ask about offense elements, defenses, procedures, or sentencing, and I will respond using the structured research database.';
};

const Chat = () => {
    const { isDark } = useTheme();
    const [apiKey, setApiKey] = useState('');
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am the Kimuntu Legal AI demo. Add any API key to unlock demo mode and ask about criminal law.'
        }
    ]);

    const isKeyReady = apiKey.trim().length > 0;

    const keyStatus = useMemo(() => {
        if (!apiKey.trim()) return 'No key added';
        return 'Demo key accepted';
    }, [apiKey]);

    const handleSend = () => {
        if (!input.trim()) return;
        if (!isKeyReady) {
            setError('Add any API key (demo) to start chatting.');
            return;
        }

        const nextMessage = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, nextMessage]);
        setInput('');
        setError('');
        setIsTyping(true);

        setTimeout(() => {
            const assistantMessage = {
                role: 'assistant',
                content: buildDemoResponse(nextMessage.content)
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 700);
    };

    const handleClear = () => {
        setMessages([
            {
                role: 'assistant',
                content: 'Chat cleared. Ask me about criminal law in Canada or the US.'
            }
        ]);
        setError('');
        setInput('');
    };

    return (
        <PageWrapper title="Legal AI Demo">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className={`p-6 rounded-2xl border ${isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                <Bot className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Kimuntu Legal AI
                                </h2>
                                <p className="text-sm">Demo assistant for criminal law research</p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border mb-4 ${isDark
                            ? 'bg-black/30 border-white/10'
                            : 'bg-white/70 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <KeyRound className={`w-4 h-4 ${isDark ? 'text-purple-200' : 'text-purple-600'}`} />
                                <span className="text-sm font-medium">API Key</span>
                            </div>
                            <input
                                value={apiKey}
                                onChange={(event) => setApiKey(event.target.value)}
                                placeholder="Enter any key (demo)"
                                className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${isDark
                                    ? 'bg-white/10 text-white border border-white/10 placeholder:text-gray-400'
                                    : 'bg-white text-gray-900 border border-gray-300 placeholder:text-gray-400'
                                    }`}
                            />
                            <p className={`text-xs mt-2 ${isKeyReady ? 'text-emerald-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {keyStatus}
                            </p>
                        </div>

                        <div className={`p-4 rounded-xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/70 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <Database className={`w-4 h-4 ${isDark ? 'text-purple-200' : 'text-purple-600'}`} />
                                <span className="text-sm font-medium">Knowledge Sources</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className={`mt-2 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-purple-300' : 'bg-purple-600'}`}></span>
                                    Canada Criminal Code + Charter rights
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className={`mt-2 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-purple-300' : 'bg-purple-600'}`}></span>
                                    U.S. federal + state statutes
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className={`mt-2 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-purple-300' : 'bg-purple-600'}`}></span>
                                    Case law summaries + sentencing guidance
                                </li>
                            </ul>
                        </div>

                        <div className={`mt-6 p-4 rounded-xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/70 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className={`w-4 h-4 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
                                <span className="text-sm font-medium">Important</span>
                            </div>
                            <p className="text-xs leading-relaxed">
                                Demo responses are informational only and not legal advice. Always consult qualified counsel for real cases.
                            </p>
                        </div>
                    </section>

                    <section className={`lg:col-span-2 p-6 rounded-2xl border ${isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Conversation
                                </h3>
                            </div>
                            <button
                                onClick={handleClear}
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all ${isDark
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                                    }`}
                            >
                                <RotateCcw className="w-4 h-4" />
                                Clear
                            </button>
                        </div>

                        <div className={`h-[360px] overflow-y-auto p-4 rounded-xl border ${isDark
                            ? 'bg-black/30 border-white/10'
                            : 'bg-white/80 border-gray-200'
                            }`}>
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${message.role === 'user'
                                            ? isDark
                                                ? 'ml-auto bg-purple-500/30 text-white border border-purple-500/40'
                                                : 'ml-auto bg-purple-100 text-gray-900 border border-purple-200'
                                            : isDark
                                                ? 'bg-white/10 text-gray-200 border border-white/10'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className={`max-w-[60%] px-4 py-3 rounded-2xl text-sm ${isDark
                                        ? 'bg-white/10 text-gray-200 border border-white/10'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                        }`}>
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Thinking...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 mt-3">{error}</p>
                        )}

                        <div className="mt-4">
                            <div className="flex gap-2 flex-wrap mb-4">
                                {starterPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInput(prompt)}
                                        className={`text-xs px-3 py-2 rounded-full border transition-all ${isDark
                                            ? 'border-white/10 text-gray-200 hover:bg-white/10'
                                            : 'border-gray-300 text-gray-700 hover:bg-white'
                                            }`}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask about criminal law..."
                                    className={`flex-1 px-4 py-3 rounded-xl focus:outline-none ${isDark
                                        ? 'bg-white/10 text-white border border-white/10 placeholder:text-gray-400'
                                        : 'bg-white text-gray-900 border border-gray-300 placeholder:text-gray-400'
                                        }`}
                                />
                                <button
                                    onClick={handleSend}
                                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className={`mt-6 p-4 rounded-xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/70 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Scale className={`w-4 h-4 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                                <span className="text-sm font-medium">Demo Mode</span>
                            </div>
                            <p className="text-xs leading-relaxed">
                                This is a front-end demo. Any API key enables chat simulation. Integrate a real AI provider later via secure server-side routing.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Chat;
