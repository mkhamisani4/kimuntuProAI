'use client';

/**
 * Business Track AI Assistant Page
 * Demo interface for three assistants: Streamlined Plan, Executive Summary, Market Analysis
 */

import { useState } from 'react';
import { ArrowLeft, Clock, Lock, AlertTriangle, X } from 'lucide-react';
import TaskForm from './TaskForm';
import ResultViewer from './ResultViewer';
import UsageBadge from './UsageBadge';

export interface AssistantResult {
  sections: Record<string, string>;
  sources: Array<{
    type: 'rag' | 'web';
    title?: string;
    url?: string;
    snippet?: string;
  }>;
  meta: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    latencyMs: number;
    timestamp?: string; // ISO timestamp for web search data freshness
  };
}

export default function AIAssistantPage() {
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'auth' | 'server' | null>(null);
  const [resetsAt, setResetsAt] = useState<string | null>(null);

  const handleResult = (newResult: AssistantResult) => {
    setResult(newResult);
    setError(null);
    setErrorType(null);
    setResetsAt(null);
  };

  const handleError = (err: { type: 'quota' | 'auth' | 'server'; message: string; resetsAt?: string }) => {
    setError(err.message);
    setErrorType(err.type);
    setResetsAt(err.resetsAt || null);
    setResult(null);
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
    setResetsAt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Business Track AI Assistant
              </h1>
              <p className="mt-2 text-gray-600">
                Generate business plans, financial summaries, and market analysis with AI
              </p>
            </div>
            <UsageBadge />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              errorType === 'quota'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : errorType === 'auth'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold flex items-center gap-2">
                  {errorType === 'quota' && (
                    <>
                      <Clock className="w-5 h-5" />
                      Quota Exceeded
                    </>
                  )}
                  {errorType === 'auth' && (
                    <>
                      <Lock className="w-5 h-5" />
                      Authentication Required
                    </>
                  )}
                  {errorType === 'server' && (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      Server Error
                    </>
                  )}
                </p>
                <p className="mt-1 text-sm">{error}</p>
                {resetsAt && (
                  <p className="mt-2 text-sm font-medium">
                    Resets at: {new Date(resetsAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={clearError}
                className="ml-4 text-gray-500 hover:text-gray-700"
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Task Form */}
          <div>
            <TaskForm onResult={handleResult} onError={handleError} />
          </div>

          {/* Right: Results */}
          <div>
            {result && <ResultViewer result={result} />}
            {!result && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-lg">
                  <p className="mb-2 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Select a task and enter your prompt
                  </p>
                  <p className="text-sm">Results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
