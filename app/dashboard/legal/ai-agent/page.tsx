'use client';

/**
 * Legal AI Agent Page
 * Full legal analysis interface with document upload, case description, and results
 * Covers #187 (document intake), #188 (analysis + prediction), #189 (action plan), #57 (judicial outcomes)
 */

import { useState } from 'react';
import { ArrowLeft, Clock, Lock, AlertTriangle, X, Scale } from 'lucide-react';
import LegalTaskForm from './LegalTaskForm';
import ResultViewer from '@/app/dashboard/business/ai-assistant/ResultViewer';

export interface LegalResult {
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
    timestamp?: string;
    resultId?: string;
    filesProcessed?: number;
  };
}

export default function LegalAIAgentPage() {
  const [result, setResult] = useState<LegalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'auth' | 'server' | null>(null);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (newResult: LegalResult) => {
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
              <div className="flex items-center gap-3 mb-2">
                <Scale className="w-8 h-8 text-emerald-500" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Legal AI Agent
                </h1>
              </div>
              <p className="mt-2 text-gray-600">
                Upload legal documents, describe your situation, and receive AI-powered analysis with predicted outcomes and action plans
              </p>
            </div>
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
          {/* Left: Legal Task Form */}
          <div>
            <LegalTaskForm
              onResult={handleResult}
              onError={handleError}
              onLoadingChange={setIsLoading}
            />
          </div>

          {/* Right: Results */}
          <div>
            {result && (
              <ResultViewer
                result={result}
                isLoading={isLoading}
                assistantType="legal_analysis"
                resultId={result.meta.resultId}
              />
            )}
            {!result && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Scale className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <div className="text-gray-400 text-lg">
                  <p className="mb-2 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Describe your legal situation
                  </p>
                  <p className="text-sm">Upload documents and provide details for AI analysis</p>
                  <div className="mt-6 text-left max-w-sm mx-auto">
                    <p className="text-xs text-gray-500 font-medium mb-2">Your analysis will include:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>Case Summary — synthesized from your documents and description</li>
                      <li>Legal Analysis — applicable laws, statutes, and precedents</li>
                      <li>Predicted Outcome — AI assessment of likely judicial outcomes</li>
                      <li>Action Plan — recommended steps for your situation</li>
                      <li>Risk Assessment — potential risks and mitigation strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
