'use client';

/**
 * TaskForm Component
 * Input form for selecting assistant type and entering prompts
 * Enhanced with character counter, validation, and toast notifications
 */

import { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { AssistantResult } from './page';

interface TaskFormProps {
  onResult: (result: AssistantResult) => void;
  onError: (error: { type: 'quota' | 'auth' | 'server'; message: string; resetsAt?: string }) => void;
  assistant?: 'streamlined_plan' | 'exec_summary' | 'market_analysis' | 'financial_overview';
  onLoadingChange?: (isLoading: boolean) => void;
}

type AssistantType = 'streamlined_plan' | 'exec_summary' | 'market_analysis' | 'financial_overview';

export default function TaskForm({ onResult, onError, assistant: assistantProp, onLoadingChange }: TaskFormProps) {
  const [assistant, setAssistant] = useState<AssistantType>(assistantProp || 'streamlined_plan');
  const [input, setInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Character limit for input
  const MAX_INPUT_LENGTH = 1000;

  // Finance fields for exec_summary
  const [arpu, setArpu] = useState('99');
  const [cogs, setCogs] = useState('20');
  const [churn, setChurn] = useState('4');
  const [newCustomers, setNewCustomers] = useState('25');
  const [smSpend, setSmSpend] = useState('10000');
  const [months, setMonths] = useState('12');

  // Get current Firebase user
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

  const tasks = [
    {
      value: 'streamlined_plan' as const,
      label: 'Streamlined Plan (#108)',
      description: 'Lean one-page business plan',
      placeholder: 'Example: Draft a lean one-page plan for a meal-prep SaaS targeting students at ASU.',
    },
    {
      value: 'exec_summary' as const,
      label: 'Executive Summary + Financials (#109)',
      description: 'Financial overview with projections',
      placeholder: 'Example: Financial overview for $99/mo SaaS, 20% COGS, 4% churn, +25 subs/mo, $10k S&M, 12 months.',
    },
    {
      value: 'market_analysis' as const,
      label: 'Market Analysis (#110)',
      description: 'Market research with web data',
      placeholder: 'Example: Analyze the AI coding assistant market; top competitors, pricing bands, and GTM angles.',
    },
    {
      value: 'financial_overview' as const,
      label: 'Financial Overview',
      description: '12-month financial projections',
      placeholder: 'Example: Generate 12-month financial projections for a B2B SaaS with $199/mo pricing and $50k initial funding.',
    },
  ];

  const currentTask = tasks.find((t) => t.value === assistant)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!input.trim()) {
      toast.error('Please enter a prompt before generating');
      return;
    }

    if (input.length > MAX_INPUT_LENGTH) {
      toast.error(`Prompt is too long. Maximum ${MAX_INPUT_LENGTH} characters`);
      return;
    }

    if (!currentUserId) {
      toast.error('Please sign in to use the AI assistant');
      onError({ type: 'auth', message: 'Please sign in to use the AI assistant' });
      return;
    }

    setIsLoading(true);
    onLoadingChange?.(true);

    // Show loading toast
    const toastId = toast.loading('Generating your response...');

    try {
      // Build request body
      const body: any = {
        assistant,
        input: input.trim(),
        tenantId: 'demo-tenant', // Use default tenant for demo
        userId: currentUserId, // Use Firebase user ID
      };

      // Add finance fields for exec_summary and financial_overview
      if ((assistant === 'exec_summary' || assistant === 'financial_overview') && showAdvanced) {
        body.extra = {
          arpu: parseFloat(arpu) || 0,
          cogs_percent: parseFloat(cogs) || 0,
          churn_rate: parseFloat(churn) / 100 || 0,
          new_customers_per_month: parseInt(newCustomers) || 0,
          sales_marketing_monthly: parseFloat(smSpend) || 0,
          projection_months: parseInt(months) || 12,
        };
      }

      // Call API
      const response = await fetch('/api/ai/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors
        if (response.status === 429) {
          onError({
            type: 'quota',
            message: data.message || 'Quota exceeded',
            resetsAt: data.resetsAt,
          });
        } else if (response.status === 401 || response.status === 403) {
          onError({
            type: 'auth',
            message: data.message || 'Authentication required',
          });
        } else {
          onError({
            type: 'server',
            message: data.message || 'Failed to generate response',
          });
        }
        return;
      }

      // Success
      toast.success('Response generated successfully', { id: toastId });
      onResult({
        sections: data.sections,
        sources: data.sources || [],
        meta: data.meta,
      });
    } catch (error: any) {
      toast.error('Failed to generate response', { id: toastId });
      onError({
        type: 'server',
        message: error.message || 'Network error',
      });
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6">
      <form onSubmit={handleSubmit}>
        {/* Task Selector */}
        {!assistantProp ? (
          /* Show dropdown only on generic AI assistant page */
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Task
            </label>
            <select
              value={assistant}
              onChange={(e) => setAssistant(e.target.value as AssistantType)}
              className="w-full px-4 py-2 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoading}
            >
              {tasks.map((task) => (
                <option key={task.value} value={task.value}>
                  {task.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-400">{currentTask.description}</p>
          </div>
  
        ) : (
          /* Show task name as static header on dedicated pages */
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">
              {currentTask.label}
            </h3>
            <p className="text-sm text-gray-400">{currentTask.description}</p>
          </div>
        )}

        {/* Input Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Prompt
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentTask.placeholder}
              rows={6}
              maxLength={MAX_INPUT_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                input.length > MAX_INPUT_LENGTH
                  ? 'border-red-500 focus:ring-red-500 bg-white/10 text-gray-100'
                  : 'border-gray-600 bg-white/10 text-gray-100 focus:ring-emerald-500'
              }`}
              disabled={isLoading}
              aria-label="Prompt input"
            />
            {/* Character Counter */}
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                input.length > MAX_INPUT_LENGTH
                  ? 'text-red-600 font-semibold'
                  : input.length > MAX_INPUT_LENGTH * 0.9
                  ? 'text-amber-600'
                  : 'text-gray-500'
              }`}
              data-testid="character-counter"
            >
              {input.length}/{MAX_INPUT_LENGTH}
            </div>
          </div>
        </div>

        {/* Advanced Options (Finance Fields for #109 and Financial Overview) */}
        {(assistant === 'exec_summary' || assistant === 'financial_overview') && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2"
            >
              {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Advanced Options (Financial Inputs)
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-white/5 border border-gray-700 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      ARPU ($/month)
                    </label>
                    <input
                      type="number"
                      value={arpu}
                      onChange={(e) => setArpu(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-600 bg-white/10 text-gray-100 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      COGS (%)
                    </label>
                    <input
                      type="number"
                      value={cogs}
                      onChange={(e) => setCogs(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-600 bg-white/10 text-gray-100 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Churn Rate (%)
                    </label>
                    <input
                      type="number"
                      value={churn}
                      onChange={(e) => setChurn(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-600 bg-white/10 text-gray-100 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      New Customers/Month
                    </label>
                    <input
                      type="number"
                      value={newCustomers}
                      onChange={(e) => setNewCustomers(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-600 bg-white/10 text-gray-100 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      S&M Spend ($/month)
                    </label>
                    <input
                      type="number"
                      value={smSpend}
                      onChange={(e) => setSmSpend(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-600 bg-white/10 text-gray-100 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Projection Months
                    </label>
                    <input
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-600 bg-white/10 text-gray-100 rounded"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          aria-label="Run Assistant"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            'Run Assistant'
          )}
        </button>
      </form>
    </div>
  );
}
