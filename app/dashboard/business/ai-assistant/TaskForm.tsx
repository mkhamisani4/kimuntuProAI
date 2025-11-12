'use client';

/**
 * TaskForm Component
 * Input form for selecting assistant type and entering prompts
 */

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import type { AssistantResult } from './page';

interface TaskFormProps {
  onResult: (result: AssistantResult) => void;
  onError: (error: { type: 'quota' | 'auth' | 'server'; message: string; resetsAt?: string }) => void;
}

type AssistantType = 'streamlined_plan' | 'exec_summary' | 'market_analysis';

export default function TaskForm({ onResult, onError }: TaskFormProps) {
  const [assistant, setAssistant] = useState<AssistantType>('streamlined_plan');
  const [input, setInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
  ];

  const currentTask = tasks.find((t) => t.value === assistant)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      onError({ type: 'server', message: 'Please enter a prompt' });
      return;
    }

    if (!currentUserId) {
      onError({ type: 'auth', message: 'Please sign in to use the AI assistant' });
      return;
    }

    setIsLoading(true);

    try {
      // Build request body
      const body: any = {
        assistant,
        input: input.trim(),
        tenantId: 'demo-tenant', // Use default tenant for demo
        userId: currentUserId, // Use Firebase user ID
      };

      // Add finance fields for exec_summary
      if (assistant === 'exec_summary' && showAdvanced) {
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
      onResult({
        sections: data.sections,
        sources: data.sources || [],
        meta: data.meta,
      });
    } catch (error: any) {
      onError({
        type: 'server',
        message: error.message || 'Network error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit}>
        {/* Task Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Task
          </label>
          <select
            value={assistant}
            onChange={(e) => setAssistant(e.target.value as AssistantType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            {tasks.map((task) => (
              <option key={task.value} value={task.value}>
                {task.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">{currentTask.description}</p>
        </div>

        {/* Input Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentTask.placeholder}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Advanced Options (Finance Fields for #109) */}
        {assistant === 'exec_summary' && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options (Financial Inputs)
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ARPU ($/month)
                    </label>
                    <input
                      type="number"
                      value={arpu}
                      onChange={(e) => setArpu(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      COGS (%)
                    </label>
                    <input
                      type="number"
                      value={cogs}
                      onChange={(e) => setCogs(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Churn Rate (%)
                    </label>
                    <input
                      type="number"
                      value={churn}
                      onChange={(e) => setChurn(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      New Customers/Month
                    </label>
                    <input
                      type="number"
                      value={newCustomers}
                      onChange={(e) => setNewCustomers(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      S&M Spend ($/month)
                    </label>
                    <input
                      type="number"
                      value={smSpend}
                      onChange={(e) => setSmSpend(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Projection Months
                    </label>
                    <input
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
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
          disabled={isLoading || !input.trim()}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isLoading || !input.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
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
