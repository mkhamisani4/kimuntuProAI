/**
 * Finance Tool Spec for chatWithTools() Integration
 * Provides ToolSpec and handler for deterministic financial calculations
 */

import type { ToolSpec, ToolHandler } from '../llm/client.js';
import type { BusinessTrackFinancialModel } from '@kimuntupro/shared';
import { buildFinancialModel, validateFinancialInputs } from './finance.js';

/**
 * Build finance calculation ToolSpec for use with chatWithTools()
 * @returns ToolSpec and handler
 */
export function buildFinanceToolSpec(): {
  spec: ToolSpec;
  handler: ToolHandler;
} {
  const spec: ToolSpec = {
    type: 'function',
    function: {
      name: 'finance_calc',
      description:
        'Deterministic financial calculations for SaaS/B2B business models. Computes unit economics (ARPU, Gross Margin, CAC, LTV, Payback) and generates 12-24 month revenue/customer projections with churn modeling.',
      parameters: {
        type: 'object',
        properties: {
          // Pricing & costs
          arpuMonthly: {
            type: 'number',
            description: 'Average Revenue Per User per month (monthly pricing)',
            minimum: 0,
          },
          acv: {
            type: 'number',
            description: 'Annual Contract Value (annual pricing, converted to monthly ARPU)',
            minimum: 0,
          },
          cogsPct: {
            type: 'number',
            description: 'Cost of Goods Sold as percentage of revenue (0-1 scale, e.g., 0.25 = 25%)',
            minimum: 0,
            maximum: 1,
          },
          variableCostPerUser: {
            type: 'number',
            description: 'Variable cost per user per month (optional, uses max of this or cogsPct)',
            minimum: 0,
          },

          // Funnel & growth
          startingCustomers: {
            type: 'integer',
            description: 'Number of customers at start of projection period',
            minimum: 0,
          },
          newCustomersPerMonth: {
            type: 'number',
            description: 'New customers acquired each month',
            minimum: 0,
          },
          churnRateMonthly: {
            type: 'number',
            description: 'Monthly churn rate (0-0.99 scale, e.g., 0.05 = 5% monthly churn)',
            minimum: 0,
            maximum: 0.99,
          },
          expansionPctMonthly: {
            type: 'number',
            description:
              'Monthly expansion/upsell rate on retained customers (0-1 scale, default 0)',
            minimum: 0,
            maximum: 1,
          },

          // Sales/marketing & CAC
          salesMarketingSpendMonthly: {
            type: 'number',
            description: 'Monthly sales & marketing spend',
            minimum: 0,
          },
          customersAcquiredPerMonth: {
            type: 'number',
            description:
              'Customers acquired per month for CAC calc (if different from newCustomersPerMonth)',
            minimum: 0,
          },
          assumedCAC: {
            type: 'number',
            description: 'Override CAC with assumed value (optional)',
            minimum: 0,
          },

          // Horizon
          months: {
            type: 'integer',
            description: 'Number of months to project (1-24, default 12)',
            minimum: 1,
            maximum: 24,
          },
        },
        required: [
          'cogsPct',
          'startingCustomers',
          'newCustomersPerMonth',
          'churnRateMonthly',
          'salesMarketingSpendMonthly',
        ],
      },
    },
  };

  const handler: ToolHandler = (args: Record<string, any>): BusinessTrackFinancialModel | { error: string; errors?: string[] } => {
    try {
      // Validate inputs
      const validation = validateFinancialInputs(args);

      if (!validation.success) {
        return {
          error: 'Invalid financial inputs',
          errors: validation.errors,
        };
      }

      // Build financial model
      const model = buildFinancialModel(validation.data!);

      // Return model as JSON
      return model;
    } catch (error: any) {
      return {
        error: 'Financial calculation failed',
        errors: [error.message || 'Unknown error'],
      };
    }
  };

  return { spec, handler };
}

/**
 * Build finance tool for use with OpenAI client
 * Convenience function that returns just the tool array
 * @returns Array with finance tool spec
 */
export function buildFinanceTools(): ToolSpec[] {
  const { spec } = buildFinanceToolSpec();
  return [spec];
}

/**
 * Get finance tool handler
 * @returns Handler function
 */
export function getFinanceToolHandler(): ToolHandler {
  const { handler } = buildFinanceToolSpec();
  return handler;
}
