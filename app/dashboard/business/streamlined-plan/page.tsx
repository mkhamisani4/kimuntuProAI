'use client';

/**
 * Streamlined Business Plan Assistant Page (#108)
 * Generates lean one-page business plans for startups
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AssistantLayout from '@/components/ai/AssistantLayout';
import TaskForm from '@/app/dashboard/business/ai-assistant/TaskForm';
import ResultViewer from '@/app/dashboard/business/ai-assistant/ResultViewer';
import type { AssistantResult } from '@/app/dashboard/business/ai-assistant/page';
import { getAssistantResult } from '@kimuntupro/db';

export default function StreamlinedPlanPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'auth' | 'server' | null>(null);
  const [resetsAt, setResetsAt] = useState<string | null>(null);

  // Load saved result from URL parameter
  useEffect(() => {
    const resultId = searchParams.get('resultId');
    if (resultId) {
      setIsLoading(true);
      getAssistantResult(resultId)
        .then((savedResult) => {
          if (savedResult) {
            // Transform Firestore result to AssistantResult format
            setResult({
              sections: savedResult.sections,
              sources: savedResult.sources,
              meta: {
                model: savedResult.metadata?.model || 'unknown',
                tokensIn: 0, // Not stored separately
                tokensOut: savedResult.metadata?.tokensUsed || 0,
                costCents: Math.round((savedResult.metadata?.cost || 0) * 100),
                latencyMs: savedResult.metadata?.latencyMs || 0,
                timestamp: savedResult.createdAt?.toISOString() || new Date().toISOString(),
                toolInvocations: {},
                resultId: savedResult.id,
              },
            });
          } else {
            setError('Saved result not found');
            setErrorType('server');
          }
        })
        .catch((err) => {
          console.error('Failed to load saved result:', err);
          setError('Failed to load saved result');
          setErrorType('server');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchParams]);

  const handleResult = (newResult: AssistantResult) => {
    setResult(newResult);
    setError(null);
    setErrorType(null);
    setResetsAt(null);
    setIsLoading(false);
  };

  const handleError = (err: { type: 'quota' | 'auth' | 'server'; message: string; resetsAt?: string }) => {
    setError(err.message);
    setErrorType(err.type);
    setResetsAt(err.resetsAt || null);
    setResult(null);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setErrorType(null);
    setResetsAt(null);
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
    setResetsAt(null);
  };

  return (
    <AssistantLayout
      title="Streamlined Business Plan"
      description="Generate a lean one-page business plan in under 60 seconds"
      icon="📈"
      backHref="/dashboard/business"
    >
      {/* Error Banner */}
      {error && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            errorType === 'quota'
              ? 'bg-amber-900/20 border-amber-500/50 text-amber-200'
              : errorType === 'auth'
              ? 'bg-red-900/20 border-red-500/50 text-red-200'
              : 'bg-red-900/20 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold">
                {errorType === 'quota' && '⏱️ Quota Exceeded'}
                {errorType === 'auth' && '🔒 Authentication Required'}
                {errorType === 'server' && '⚠️ Server Error'}
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
              className="ml-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Form */}
        <div>
          <TaskForm
            assistant="streamlined_plan"
            onResult={handleResult}
            onError={handleError}
            onLoadingChange={setIsLoading}
          />
        </div>

        {/* Right Column: Results */}
        <div>
          <ResultViewer
            result={result}
            isLoading={isLoading}
            error={error ? { message: error, type: errorType || 'server' } : null}
            onRetry={handleRetry}
            assistantType="streamlined_plan"
          />
          {!result && !error && !isLoading && (
            <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-gray-400 text-lg">
                <p className="mb-2">👈 Enter your prompt to get started</p>
                <p className="text-sm">Your business plan will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AssistantLayout>
  );
}
