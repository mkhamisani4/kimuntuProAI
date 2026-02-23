'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Bot,
    Send,
    X,
    Minimize2,
    Maximize2,
    RotateCcw,
    MessageSquare
} from 'lucide-react';
import { auth, saveChatMessage, getChatHistory } from '@/lib/firebase';

const FloatingChatbot = () => {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! How can I help you today?',
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);

    // Load chat history when user is authenticated
    useEffect(() => {
        const loadHistory = async () => {
            if (auth.currentUser) {
                const history = await getChatHistory(auth.currentUser.uid);
                if (history.length > 0) {
                    setMessages(history);
                }
            }
        };
        loadHistory();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        const userMessage = { role: 'user', content: trimmed, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Save to Firebase if authenticated
        if (auth.currentUser) {
            await saveChatMessage(auth.currentUser.uid, userMessage);
        }

        // Simulate AI response
        setTimeout(async () => {
            const assistantMessage = {
                role: 'assistant',
                content: `I received your message: "${trimmed}". This is a demo response. I'm here to help!`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);

            // Save to Firebase if authenticated
            if (auth.currentUser) {
                await saveChatMessage(auth.currentUser.uid, assistantMessage);
            }
        }, 1000);
    };

    const handleClear = () => {
        setMessages([
            {
                role: 'assistant',
                content: 'Chat cleared. How can I help you?',
                timestamp: new Date(),
            },
        ]);
    };

    // Premium colors - pure black/white
    const bgColor = isDark ? 'bg-black' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-black';
    const borderColor = isDark ? 'border-white/20' : 'border-black/20';
    const hoverBg = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';
    const inputBg = isDark ? 'bg-white/10' : 'bg-black/5';
    const inputFocus = isDark ? 'focus:bg-white/20' : 'focus:bg-black/10';

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full ${bgColor} ${textColor} border ${borderColor} shadow-2xl hover:scale-110 transition-all duration-300`}
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    if (!isExpanded) {
        // Small quick chat view
        return (
            <div className={`fixed bottom-6 right-6 z-50 w-96 ${bgColor} ${textColor} border ${borderColor} rounded-3xl shadow-2xl`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Assistant</h3>
                            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>Always here to help</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className={`p-2 rounded-lg ${hoverBg} transition-all`}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={`p-2 rounded-lg ${hoverBg} transition-all`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-3">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    message.role === 'user'
                                        ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                                        : isDark ? 'bg-white/10' : 'bg-black/5'
                                }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className={`p-4 border-t ${borderColor}`}>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className={`flex-1 px-4 py-2 rounded-xl ${inputBg} ${inputFocus} border ${borderColor} focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-white/20' : 'focus:ring-black/20'} transition-all text-sm`}
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className={`p-2 rounded-xl ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Expanded full view
    return (
        <div className={`fixed inset-4 z-50 ${bgColor} ${textColor} border ${borderColor} rounded-3xl shadow-2xl flex flex-col`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">AI Assistant</h3>
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Full conversation view</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClear}
                        className={`px-4 py-2 rounded-xl ${hoverBg} transition-all flex items-center gap-2 text-sm`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Clear
                    </button>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className={`p-2 rounded-lg ${hoverBg} transition-all`}
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className={`p-2 rounded-lg ${hoverBg} transition-all`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%]">
                            <div
                                className={`p-4 rounded-2xl ${
                                    message.role === 'user'
                                        ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                                        : isDark ? 'bg-white/10' : 'bg-black/5'
                                }`}
                            >
                                {message.content}
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-black/40'} ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <div className="flex gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2.5 h-2.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2.5 h-2.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className={`p-6 border-t ${borderColor}`}>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className={`flex-1 px-6 py-4 rounded-2xl ${inputBg} ${inputFocus} border ${borderColor} focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-white/20' : 'focus:ring-black/20'} transition-all`}
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className={`px-6 py-4 rounded-2xl ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'} disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium`}
                    >
                        <Send className="w-5 h-5" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingChatbot;
