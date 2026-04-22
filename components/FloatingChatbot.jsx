'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Bot,
    Send,
    X,
    Minimize2,
    Maximize2,
    RotateCcw,
    MessageSquare,
    ExternalLink,
} from 'lucide-react';
import { auth, saveChatMessage, getChatHistory } from '@/lib/firebase';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

// Split a plain-text segment on **bold** markers and return React nodes.
const renderBold = (text, startKey) => {
    const parts = [];
    let key = startKey;
    const boldPattern = /\*\*([^*]+)\*\*/g;
    let last = 0;
    let m;
    while ((m = boldPattern.exec(text)) !== null) {
        if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
        parts.push(<strong key={key++}>{m[1]}</strong>);
        last = boldPattern.lastIndex;
    }
    if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
    return { nodes: parts, key };
};

const renderContent = (content) => {
    // Matches [label](url) or bare https:// URLs
    const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s,)"'<>]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = pattern.exec(content)) !== null) {
        if (match.index > lastIndex) {
            const { nodes, key: nextKey } = renderBold(content.slice(lastIndex, match.index), key);
            parts.push(...nodes);
            key = nextKey;
        }
        if (match[1] && match[2]) {
            parts.push(
                <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer"
                   className="underline decoration-dotted underline-offset-2 inline-flex items-center gap-0.5 hover:opacity-80">
                    {match[1]}<ExternalLink className="w-3 h-3 opacity-70 inline" />
                </a>
            );
        } else if (match[3]) {
            parts.push(
                <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer"
                   className="underline decoration-dotted underline-offset-2 inline-flex items-center gap-0.5 hover:opacity-80 break-all">
                    {match[3]}<ExternalLink className="w-3 h-3 opacity-70 inline" />
                </a>
            );
        }
        lastIndex = pattern.lastIndex;
    }
    if (lastIndex < content.length) {
        const { nodes, key: nextKey } = renderBold(content.slice(lastIndex), key);
        parts.push(...nodes);
        key = nextKey;
    }
    return parts.length ? parts : content;
};

const TypingDots = () => (
    <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

/* ------------------------------------------------------------------ */
/*  Sub-components defined OUTSIDE FloatingChatbot                     */
/*  (if defined inside, React remounts them on every render and the    */
/*   text input loses focus after every keystroke)                     */
/* ------------------------------------------------------------------ */

const MessageBubble = ({ message, compact, isDark, msgBubbleBg }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={compact ? 'max-w-[80%]' : 'max-w-[70%]'}>
            {message.content && (
                <div className={`${compact ? 'p-3 rounded-2xl text-sm' : 'p-4 rounded-2xl'} ${
                    message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : msgBubbleBg
                }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{renderContent(message.content)}</p>
                </div>
            )}
            {!compact && (
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-black/40'} ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp instanceof Date
                        ? message.timestamp.toLocaleTimeString()
                        : new Date(message.timestamp).toLocaleTimeString()}
                </p>
            )}
        </div>
    </div>
);

const InputRow = ({
    compact, isDark, inputBg, inputFocus, borderColor,
    input, isTyping, onSend, onInputChange,
}) => (
    <div className="flex items-center gap-2">
        <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder="Type a message…"
            className={`flex-1 ${compact ? 'px-4 py-2 rounded-xl text-sm' : 'px-6 py-4 rounded-2xl'} ${inputBg} ${inputFocus} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all`}
            disabled={isTyping}
        />
        <button onClick={onSend} disabled={!input.trim() || isTyping}
            className={`${compact ? 'p-2' : 'px-5 py-4'} rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium flex-shrink-0`}>
            <Send className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            {!compact && <span>Send</span>}
        </button>
    </div>
);

const FloatingChatbot = () => {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm the Kimuntu AI assistant. Ask me anything — platform help (password reset, billing, features), legal questions, career advice, business planning, or anything else!",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (auth.currentUser) {
                const history = await getChatHistory(auth.currentUser.uid);
                if (history.length > 0) setMessages(history);
            }
        };
        loadHistory();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        const userMessage = { role: 'user', content: trimmed, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        if (auth.currentUser) {
            await saveChatMessage(auth.currentUser.uid, { role: 'user', content: trimmed, timestamp: userMessage.timestamp });
        }

        try {
            const history = messages
                .map(({ role, content }) => ({ role, content }))
                .concat({ role: 'user', content: trimmed });

            const res = await fetch('/api/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }),
            });
            const json = await res.json();
            const responseText = json.content || 'Sorry, I could not generate a response. Please try again.';

            const assistantMessage = { role: 'assistant', content: responseText, timestamp: new Date() };
            setMessages((prev) => [...prev, assistantMessage]);

            if (auth.currentUser) {
                await saveChatMessage(auth.currentUser.uid, { role: 'assistant', content: responseText, timestamp: assistantMessage.timestamp });
            }
        } catch {
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: 'Something went wrong. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping, messages]);

    const handleClear = () => {
        setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you?', timestamp: new Date() }]);
    };

    const bgColor = isDark ? 'bg-black/90 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl';
    const textColor = isDark ? 'text-white' : 'text-black';
    const borderColor = isDark ? 'border-white/10' : 'border-black/5';
    const hoverBg = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';
    const inputBg = isDark ? 'bg-white/5' : 'bg-black/[0.02]';
    const inputFocus = isDark ? 'focus:bg-white/10' : 'focus:bg-white';
    const msgBubbleBg = isDark ? 'bg-white/5 border border-white/10' : 'bg-black/[0.03] border border-black/5';

    // Shared props passed down to the outer InputRow component
    const inputRowProps = {
        isDark, inputBg, inputFocus, borderColor,
        input, isTyping,
        onSend: handleSend,
        onInputChange: setInput,
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25">
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    if (isExpanded) {
        return (
            <div className={`fixed inset-4 z-50 ${bgColor} ${textColor} border ${borderColor} rounded-3xl shadow-2xl flex flex-col`}>
                <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">AI Assistant</h3>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Supports text &amp; links</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleClear} className={`px-4 py-2 rounded-xl ${hoverBg} transition-all flex items-center gap-2 text-sm`}>
                            <RotateCcw className="w-4 h-4" /> Clear
                        </button>
                        <button onClick={() => setIsExpanded(false)} className={`p-2 rounded-lg ${hoverBg} transition-all`}>
                            <Minimize2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg ${hoverBg} transition-all`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, i) => <MessageBubble key={i} message={msg} compact={false} isDark={isDark} msgBubbleBg={msgBubbleBg} />)}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`}><TypingDots /></div>
                        </div>
                    )}
                </div>
                <div className={`p-6 border-t ${borderColor}`}>
                    <InputRow compact={false} {...inputRowProps} />
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 w-96 ${bgColor} ${textColor} border ${borderColor} rounded-3xl shadow-2xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Assistant</h3>
                        <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>Platform help &amp; general questions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsExpanded(true)} className={`p-2 rounded-lg ${hoverBg} transition-all`}>
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg ${hoverBg} transition-all`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => <MessageBubble key={i} message={msg} compact={true} isDark={isDark} msgBubbleBg={msgBubbleBg} />)}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`}><TypingDots /></div>
                    </div>
                )}
            </div>
            <div className={`p-4 border-t ${borderColor}`}>
                <InputRow compact={true} {...inputRowProps} />
            </div>
        </div>
    );
};

export default FloatingChatbot;
