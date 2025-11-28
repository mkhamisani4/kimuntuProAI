'use client';

/**
 * Website AI Editor Page
 * Split view: preview on left, chat-based editing on right
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getWebsite, type Website } from '@kimuntupro/db';
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import { sanitizeWebsiteHTML, getIframeSandboxAttributes } from '@/lib/sanitize';

interface EditMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'complete' | 'error';
}

export default function WebsiteEditPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<EditMessage[]>([]);
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch website
  useEffect(() => {
    async function fetchWebsite() {
      try {
        setLoading(true);
        const data = await getWebsite(websiteId);

        if (!data) {
          setError('Website not found');
          return;
        }

        setWebsite(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch website:', err);
        setError(err.message || 'Failed to load website');
      } finally {
        setLoading(false);
      }
    }

    if (websiteId) {
      fetchWebsite();
    }
  }, [websiteId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for updates while editing
  useEffect(() => {
    if (!isEditing || !website) return;

    const pollInterval = setInterval(async () => {
      try {
        const updated = await getWebsite(websiteId);
        if (updated && updated.status !== 'generating') {
          // Update website state - this will trigger iframe re-render via key prop
          setWebsite(updated);
          setIsEditing(false);

          // Update last message status
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 && msg.role === 'assistant'
                ? { ...msg, status: updated.status === 'ready' ? 'complete' : 'error' }
                : msg
            )
          );

          clearInterval(pollInterval);

          if (updated.status === 'ready') {
            toast.success('Edit applied successfully! Preview updated.', { duration: 3000 });
          } else if (updated.status === 'failed') {
            toast.error('Edit failed: ' + updated.errorMessage);
          }
        }
      } catch (err) {
        console.error('Failed to poll website:', err);
      }
    }, 2000);

    // Clean up after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);

    return () => clearInterval(pollInterval);
  }, [isEditing, websiteId, website]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !website || !currentUserId) return;

    const userMessage: EditMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: EditMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Applying your edits...',
      timestamp: new Date(),
      status: 'pending',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsEditing(true);

    try {
      const response = await fetch(`/api/websites/${websiteId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: currentUserId,
          instruction: userMessage.content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        // Handle quota errors
        if (response.status === 429 || data.error === 'quota_exceeded') {
          const quotaMessage = data.message || 'Usage quota exceeded. Please upgrade or wait until reset.';
          toast.error(quotaMessage, { duration: 6000 });
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 && msg.role === 'assistant'
                ? { ...msg, content: quotaMessage, status: 'error' }
                : msg
            )
          );
          setIsEditing(false);
          return;
        }

        throw new Error(data.error || 'Failed to apply edit');
      }

      // Update local status
      setWebsite({ ...website, status: 'generating', errorMessage: null });
    } catch (err: any) {
      console.error('Failed to apply edit:', err);
      toast.error(`Failed to apply edit: ${err.message}`);
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.role === 'assistant'
            ? { ...msg, content: `Error: ${err.message}`, status: 'error' }
            : msg
        )
      );
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push(`/dashboard/business/websites/${websiteId}`)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Website
          </button>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">Error</h2>
            </div>
            <p className="text-gray-300">{error || 'Website not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (website.status !== 'ready' || !website.siteCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push(`/dashboard/business/websites/${websiteId}`)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Website
          </button>

          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-2xl p-12 max-w-2xl text-center backdrop-blur-sm">
              {website.status === 'generating' ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Sparkles className="w-20 h-20 text-purple-400 animate-pulse" />
                      <div className="absolute inset-0 animate-ping">
                        <Sparkles className="w-20 h-20 text-purple-400 opacity-20" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Your Website is Being Created</h2>
                  <p className="text-gray-300 text-lg mb-6">
                    Claude is generating your complete website with AI. This typically takes 1-2 minutes.
                  </p>
                  <p className="text-gray-400 text-sm mb-8">
                    You'll be able to edit it with AI once generation is complete. The page will automatically update when ready.
                  </p>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ width: '70%' }} />
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Analyzing requirements
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Generating content
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        Building website
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <AlertCircle className="w-20 h-20 text-yellow-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Website Not Ready for Editing</h2>
                  <p className="text-gray-300 text-lg mb-4">
                    This website needs to be fully generated before you can edit it.
                  </p>
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-400">
                      Current Status: <span className="text-yellow-400 font-semibold">{website.status}</span>
                    </p>
                    {website.errorMessage && (
                      <p className="text-sm text-red-400 mt-2">Error: {website.errorMessage}</p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/business/websites/${websiteId}`)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    View Website Details
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/business/websites/${websiteId}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h1 className="text-xl font-bold text-white">AI Editor</h1>
              </div>
              <div className="text-gray-400">·</div>
              <span className="text-gray-400">{website.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="h-[calc(100vh-73px)] flex">
        {/* Preview Panel */}
        <div className="flex-1 border-r border-gray-700 bg-white overflow-auto relative">
          {/* Loading Overlay */}
          {isEditing && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="bg-gray-800 border border-purple-500/50 rounded-2xl p-8 max-w-md text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Sparkles className="w-16 h-16 text-purple-400 animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                      <Sparkles className="w-16 h-16 text-purple-400 opacity-20" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI is Editing...</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Claude is applying your changes to the website. This typically takes 30-60 seconds.
                </p>
                {/* Loading Skeleton */}
                <div className="space-y-3 mt-6">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Analyzing changes
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      Generating code
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                      Updating preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <iframe
            key={website.updatedAt?.getTime() || website.createdAt?.getTime()}
            srcDoc={sanitizeWebsiteHTML(website.siteCode)}
            className="w-full h-full border-0"
            title="Website Preview"
            sandbox={getIframeSandboxAttributes()}
          />
        </div>

        {/* Chat Panel */}
        <div className="w-[400px] flex flex-col bg-gray-800/30">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-2">Edit Instructions</h2>
            <p className="text-sm text-gray-400">
              Tell me what you'd like to change about your website
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm mb-2">Start editing your website</p>
                <p className="text-gray-500 text-xs">
                  Examples: "Change the hero background to blue" or "Add a pricing section"
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && message.status === 'pending' && (
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />
                    )}
                    {message.role === 'assistant' && message.status === 'complete' && (
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                    )}
                    {message.role === 'assistant' && message.status === 'error' && (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-6 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your editing instruction..."
                disabled={isEditing}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isEditing}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isEditing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
