'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Briefcase,
  FileText,
  Loader2,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import InterviewLiveAvatar from '@/components/InterviewLiveAvatar';
import { chatPersonalAssistant, extractCareerDocumentText } from '@/services/aiService';

function UploadDropZone({ isDark, onFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-[32px] border-2 border-dashed p-8 transition-all ${
        dragging
          ? 'border-cyan-400 bg-cyan-500/10'
          : isDark
          ? 'border-white/10 bg-white/[0.02] hover:border-cyan-400/50 hover:bg-white/[0.04]'
          : 'border-gray-300 bg-white hover:border-cyan-500 hover:bg-cyan-50/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />
      <Upload className={`mx-auto mb-4 h-10 w-10 ${isDark ? 'text-white/35' : 'text-gray-400'}`} />
      <p className={`text-center text-lg font-semibold ${isDark ? 'text-white/85' : 'text-gray-900'}`}>
        Drop resumes, cover letters, or notes here
      </p>
      <p className={`mt-2 text-center text-sm ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
        PDF, TXT, or Markdown. Upload your files, ask a question, then the assistant opens as a full chat with avatar.
      </p>
    </div>
  );
}

function ChatBubble({ isDark, message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15">
          <Bot className="h-4 w-4 text-cyan-400" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-cyan-600 text-white'
            : isDark
            ? 'rounded-bl-md border border-white/8 bg-white/7 text-white/85'
            : 'rounded-bl-md bg-gray-100 text-gray-800'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function CareerPersonalAssistantPage() {
  const { isDark } = useTheme();
  const avatarRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello, I am your ProLaunch Personal Assistant. Upload your career documents and ask your first question to begin.',
    },
  ]);
  const [sending, setSending] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [pendingSpeech, setPendingSpeech] = useState('');
  const useAvatar = process.env.NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR === 'true';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (avatarReady && pendingSpeech) {
      avatarRef.current?.speak(pendingSpeech);
      setPendingSpeech('');
    }
  }, [avatarReady, pendingSpeech]);

  const speak = useCallback((text) => {
    if (avatarRef.current && avatarReady) {
      avatarRef.current.speak(text);
    } else {
      setPendingSpeech(text);
    }
  }, [avatarReady]);

  const handleFiles = useCallback(async (files) => {
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);

    if (!validFiles.length) {
      setUploadError('Please upload files under 10 MB.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const nextDocs = await Promise.all(
        validFiles.map(async (file) => {
          const text = await extractCareerDocumentText(file);
          if (!text || text.trim().length < 20) {
            throw new Error(`${file.name} did not contain enough readable text.`);
          }
          return {
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            text,
            chars: text.length,
          };
        })
      );

      setDocuments((prev) => [...prev, ...nextDocs].slice(-6));
    } catch (error) {
      setUploadError(error?.message || 'Failed to read one of the files.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleRemoveDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || sending || documents.length === 0) return;

    const userMessage = { role: 'user', content: question };
    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    avatarRef.current?.interrupt?.();

    try {
      const answer = await chatPersonalAssistant({
        message: question,
        conversationHistory: messages.slice(-12),
        documents: documents.map((doc) => ({
          name: doc.name,
          text: doc.text,
        })),
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      setChatStarted(true);
      speak(answer);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error?.message || 'Something went wrong while getting a response.',
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [documents, input, messages, sending, speak]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatStarted) {
    return (
      <div className={`min-h-[calc(100vh-2rem)] -m-8 ${isDark ? 'bg-gray-950' : 'bg-[#f4f7fb]'}`}>
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col px-6 py-8">
          <Link
            href="/dashboard/career"
            className={`mb-6 inline-flex items-center gap-1.5 text-xs ${isDark ? 'text-white/45 hover:text-white/75' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Career Track
          </Link>

          <div className={`rounded-[36px] border ${isDark ? 'border-white/8 bg-gray-950' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`border-b px-6 py-5 ${isDark ? 'border-white/8' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/15">
                  <Briefcase className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Personal Assistant
                  </h1>
                  <p className={`mt-1 text-sm ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                    Upload documents and ask one question to open the assistant chat with avatar.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <UploadDropZone isDark={isDark} onFiles={handleFiles} />

                {uploading && (
                  <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/8 bg-white/[0.03]' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-900'}`}>Reading documents...</p>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Preparing context for your first question</p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {uploadError}
                  </div>
                )}

                {documents.length > 0 && (
                  <div className={`rounded-3xl border p-4 ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
                    <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.24em] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                      Loaded Documents
                    </p>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${isDark ? 'border-white/8 bg-white/[0.03]' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
                            <FileText className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-medium ${isDark ? 'text-white/85' : 'text-gray-900'}`}>{doc.name}</p>
                            <p className={`text-[11px] ${isDark ? 'text-white/35' : 'text-gray-500'}`}>{(doc.chars / 1000).toFixed(1)}k characters</p>
                          </div>
                          <button
                            onClick={() => handleRemoveDocument(doc.id)}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDark ? 'text-white/35 hover:bg-white/10 hover:text-white/70' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={`rounded-3xl border p-5 ${isDark ? 'border-cyan-500/15 bg-cyan-500/[0.05]' : 'border-cyan-200 bg-cyan-50/70'}`}>
                <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.24em] ${isDark ? 'text-cyan-300/75' : 'text-cyan-700'}`}>
                  First Question
                </p>
                <p className={`mb-4 text-sm leading-relaxed ${isDark ? 'text-white/55' : 'text-gray-600'}`}>
                  Ask your first question here. After the first answer, the page switches into the full chat screen with the avatar reading responses aloud.
                </p>

                <div className="space-y-3">
                  {[
                    'Rewrite my resume bullets for this role',
                    'Compare my resume and cover letter',
                    'What interview points should I emphasize?',
                  ].map((idea) => (
                    <button
                      key={idea}
                      onClick={() => setInput(idea)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-xs transition-colors ${isDark ? 'border-white/8 text-white/65 hover:bg-white/[0.05]' : 'border-gray-200 text-gray-600 hover:bg-white'}`}
                    >
                      {idea}
                    </button>
                  ))}
                </div>

                <div className={`mt-5 flex items-center gap-2 rounded-2xl border px-3 py-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                  <Bot className={`h-4 w-4 shrink-0 ${isDark ? 'text-white/25' : 'text-gray-300'}`} />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={documents.length > 0 ? 'Ask your first question...' : 'Upload at least one document first...'}
                    disabled={sending || documents.length === 0}
                    className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'}`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !input.trim() || documents.length === 0}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                      sending || !input.trim() || documents.length === 0
                        ? isDark ? 'bg-white/8 text-white/20' : 'bg-gray-100 text-gray-300'
                        : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500'
                    }`}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-2rem)] -m-8 overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-[#f4f7fb]'}`}>
      <div className={`relative h-full shrink-0 overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-900'} w-[40%] min-w-[360px]`}>
        {useAvatar ? (
          <InterviewLiveAvatar
            ref={avatarRef}
            className="h-full w-full"
            onSpeakingChange={setAvatarSpeaking}
            onReady={() => setAvatarReady(true)}
            onError={setAvatarError}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-cyan-950 via-slate-900 to-gray-900">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-500/30 bg-cyan-500/15">
                <Bot className="h-12 w-12 text-cyan-300" />
              </div>
              {avatarSpeaking && <div className="absolute inset-0 animate-ping rounded-full border-2 border-cyan-400/50" />}
            </div>
            <div className="px-6 text-center">
              <p className="text-sm font-semibold text-white/80">AI Career Assistant</p>
              <p className="mt-1 text-xs text-white/35">
                {avatarError ? `Avatar unavailable: ${avatarError}` : 'Set NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR=true to enable the live avatar'}
              </p>
            </div>
          </div>
        )}

        {avatarSpeaking && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-end gap-0.5">
            {[3, 7, 5, 9, 6, 8, 4, 7, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-1 animate-bounce rounded-full bg-cyan-400 opacity-80"
                style={{ height: `${h * 3}px`, animationDelay: `${i * 60}ms`, animationDuration: '0.6s' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className={`flex items-center gap-3 border-b px-5 py-4 ${isDark ? 'border-white/8 bg-gray-950' : 'border-gray-200 bg-white'}`}>
          <Link
            href="/dashboard/career"
            className={`inline-flex items-center gap-1.5 text-xs ${isDark ? 'text-white/45 hover:text-white/75' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Career Track
          </Link>
          <div className="flex-1" />
          {documents.length > 0 && (
            <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              {documents.length} document{documents.length === 1 ? '' : 's'} loaded
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((message, index) => (
            <ChatBubble key={`${message.role}-${index}`} isDark={isDark} message={message} />
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className={`rounded-3xl rounded-bl-md px-4 py-3 ${isDark ? 'border border-white/8 bg-white/7' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-1">
                  {[0, 120, 240].map((delay) => (
                    <div
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={`border-t px-4 py-3 ${isDark ? 'border-white/8 bg-gray-950' : 'border-gray-200 bg-white'}`}>
          <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
            <Bot className={`h-4 w-4 shrink-0 ${isDark ? 'text-white/25' : 'text-gray-300'}`} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your documents, next steps, interviews, or career strategy..."
              disabled={sending}
              className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'}`}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                sending || !input.trim()
                  ? isDark ? 'bg-white/8 text-white/20' : 'bg-gray-100 text-gray-300'
                  : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500'
              }`}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
