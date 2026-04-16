'use client';

/**
 * Streamlined Business Plan Assistant Page (#108)
 * Generates lean one-page business plans for startups
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TrendingUp, Clock, Lock, AlertTriangle, X, ArrowLeft } from 'lucide-react';
import AssistantLayout from '@/components/ai/AssistantLayout';
import TaskForm from '@/app/dashboard/business/ai-assistant/TaskForm';
import ResultViewer from '@/app/dashboard/business/ai-assistant/ResultViewer';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { AssistantResult } from '@/app/dashboard/business/ai-assistant/page';
import { getAssistantResult, type AssistantResult as DbAssistantResult } from '@kimuntupro/db';

export default function StreamlinedPlanPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'auth' | 'server' | null>(null);
  const [resetsAt, setResetsAt] = useState<string | null>(null);

  // Load saved result from URL parameter
  useEffect(() => {
    const savedResultId = searchParams.get('resultId');
    if (savedResultId) {
      setResultId(savedResultId);
      setIsLoading(true);
      getAssistantResult(savedResultId)
        .then((savedResult) => {
          if (savedResult) {
            const dbResult = savedResult as DbAssistantResult;
            setResult({
              sections: dbResult.sections,
              sources: dbResult.sources,
              meta: {
                model: dbResult.metadata?.model || 'unknown',
                tokensIn: 0,
                tokensOut: dbResult.metadata?.tokensUsed || 0,
                costCents: Math.round((dbResult.metadata?.cost || 0) * 100),
                latencyMs: dbResult.metadata?.latencyMs || 0,
                timestamp: dbResult.createdAt?.toISOString() || new Date().toISOString(),
              },
            });
          } else {
            setError(t.biz_savedResultNotFound);
            setErrorType('server');
          }
        })
        .catch((err) => {
          console.error('Failed to load saved result:', err);
          setError(t.biz_failedLoadSavedResult);
          setErrorType('server');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchParams]);

  const handleResult = (newResult: AssistantResult) => {
    setResult(newResult);
    // Extract resultId from meta if available
    if (newResult.meta?.resultId) {
      console.log('[StreamlinedPlan] Setting resultId:', newResult.meta.resultId);
      setResultId(newResult.meta.resultId);
    } else {
      console.warn('[StreamlinedPlan] No resultId in response meta:', newResult.meta);
    }
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
      title={t.biz_streamlinedPlanTitle}
      description={t.biz_streamlinedPlanSubtitle}
      icon={<TrendingUp className="w-16 h-16" />}
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
              <p className="font-semibold flex items-center gap-2">
                {errorType === 'quota' && (
                  <>
                    <Clock className="w-5 h-5" />
                    {t.biz_quotaExceeded}
                  </>
                )}
                {errorType === 'auth' && (
                  <>
                    <Lock className="w-5 h-5" />
                    {t.biz_authRequired}
                  </>
                )}
                {errorType === 'server' && (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    {t.biz_serverError}
                  </>
                )}
              </p>
              <p className="mt-1 text-sm">{error}</p>
              {resetsAt && (
                <p className="mt-2 text-sm font-medium">
                  {t.biz_resetsAt} {new Date(resetsAt).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={clearError}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
              aria-label={t.biz_dismissError}
            >
              <X className="w-5 h-5" />
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
            resultId={resultId}
          />
          {!result && !error && !isLoading && (
            <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-gray-400 text-lg">
                <p className="mb-2 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t.biz_enterPromptToStart}
                </p>
                <p className="text-sm">{t.biz_planWillAppear}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AssistantLayout>
  );
}
