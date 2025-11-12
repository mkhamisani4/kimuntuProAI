/**
 * Deterministic Financial Calculations for Business Track
 * Pure functions for unit economics, CAC/LTV, and financial projections
 *
 * All functions are deterministic - same inputs produce same outputs
 * No network I/O, no randomness, fully typed with Zod validation
 */

import type {
  FinancialInputs,
  BusinessTrackUnitEconomics,
  BusinessTrackProjection,
  BusinessTrackFinancialModel,
} from '@kimuntupro/shared';
import { FinancialInputsSchema } from '@kimuntupro/shared';

/**
 * Round to N decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default 2 for currency)
 * @returns Rounded number
 */
function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Ensure value is non-negative
 * @param value - Number to clamp
 * @returns Non-negative number
 */
function nonNegative(value: number): number {
  return Math.max(0, value);
}

/**
 * Calculate ARPU (Average Revenue Per User) monthly
 * @param params - Pricing parameters
 * @returns ARPU monthly and calculation notes
 */
export function calcARPU(params: {
  arpuMonthly?: number;
  acv?: number;
}): { arpuMonthly: number; notes: string } {
  if (params.arpuMonthly && params.arpuMonthly > 0) {
    return {
      arpuMonthly: round(params.arpuMonthly, 2),
      notes: 'Using provided ARPU monthly',
    };
  }

  if (params.acv && params.acv > 0) {
    const arpuMonthly = params.acv / 12;
    return {
      arpuMonthly: round(arpuMonthly, 2),
      notes: 'Calculated from ACV / 12',
    };
  }

  // Should not reach here due to Zod validation, but provide fallback
  return {
    arpuMonthly: 0,
    notes: 'No valid pricing provided',
  };
}

/**
 * Calculate Gross Margin percentage
 * @param params - Revenue and cost parameters
 * @returns Gross margin percentage (0-1 scale)
 */
export function calcGrossMargin(params: {
  arpuMonthly: number;
  cogsPct: number;
  variableCostPerUser?: number;
}): { grossMarginPct: number } {
  const { arpuMonthly, cogsPct, variableCostPerUser } = params;

  // Calculate COGS
  let cogs = arpuMonthly * cogsPct;

  // Add variable cost if provided
  if (variableCostPerUser && variableCostPerUser > 0) {
    cogs = Math.max(cogs, variableCostPerUser);
  }

  // Calculate GM%
  const grossMargin = arpuMonthly - cogs;
  const grossMarginPct = arpuMonthly > 0 ? grossMargin / arpuMonthly : 0;

  return {
    grossMarginPct: round(grossMarginPct, 4),
  };
}

/**
 * Calculate Customer Acquisition Cost (CAC)
 * @param params - Sales/marketing parameters
 * @returns CAC and calculation method
 */
export function calcCAC(params: {
  salesMarketingSpendMonthly: number;
  customersAcquiredPerMonth?: number;
  assumedCAC?: number;
}): { cac: number; method: 'derived' | 'assumed' } {
  // If assumed CAC is provided, use it
  if (params.assumedCAC !== undefined && params.assumedCAC >= 0) {
    return {
      cac: round(params.assumedCAC, 2),
      method: 'assumed',
    };
  }

  // Otherwise derive from spend / customers
  const customers = params.customersAcquiredPerMonth || 0;
  const cac = customers > 0 ? params.salesMarketingSpendMonthly / customers : 0;

  return {
    cac: round(cac, 2),
    method: 'derived',
  };
}

/**
 * Calculate Lifetime Value (LTV)
 * LTV = ARPU * GM% / Churn Rate
 * @param params - LTV calculation parameters
 * @returns LTV and average months of customer life
 */
export function calcLTV(params: {
  arpuMonthly: number;
  grossMarginPct: number;
  churnRateMonthly: number;
}): { ltv: number; monthsOfLife: number } {
  const { arpuMonthly, grossMarginPct, churnRateMonthly } = params;

  // Edge case: no churn means infinite LTV
  if (churnRateMonthly === 0) {
    return {
      ltv: Infinity,
      monthsOfLife: Infinity,
    };
  }

  // Calculate months of life = 1 / churn rate
  const monthsOfLife = 1 / churnRateMonthly;

  // LTV = ARPU * GM% / Churn
  const ltv = (arpuMonthly * grossMarginPct) / churnRateMonthly;

  return {
    ltv: round(ltv, 2),
    monthsOfLife: round(monthsOfLife, 1),
  };
}

/**
 * Calculate Payback Period (in months)
 * Payback = CAC / (ARPU * GM%)
 * @param params - Payback calculation parameters
 * @returns Payback period in months
 */
export function calcPaybackMonths(params: {
  cac: number;
  arpuMonthly: number;
  grossMarginPct: number;
}): { paybackMonths: number } {
  const { cac, arpuMonthly, grossMarginPct } = params;

  const monthlyGrossProfit = arpuMonthly * grossMarginPct;

  // Edge case: no gross profit means infinite payback
  if (monthlyGrossProfit === 0) {
    return {
      paybackMonths: Infinity,
    };
  }

  const paybackMonths = cac / monthlyGrossProfit;

  return {
    paybackMonths: round(paybackMonths, 1),
  };
}

/**
 * Build complete financial model with unit economics and projections
 * @param inputs - Financial inputs (validated with Zod)
 * @returns Complete financial model
 */
export function buildFinancialModel(inputs: FinancialInputs): BusinessTrackFinancialModel {
  // Validate inputs with Zod
  const validated = FinancialInputsSchema.parse(inputs);

  // Calculate ARPU
  const { arpuMonthly, notes: arpuNotes } = calcARPU({
    arpuMonthly: validated.arpuMonthly,
    acv: validated.acv,
  });

  // Calculate Gross Margin %
  const { grossMarginPct } = calcGrossMargin({
    arpuMonthly,
    cogsPct: validated.cogsPct,
    variableCostPerUser: validated.variableCostPerUser,
  });

  // Determine customers acquired per month for CAC calculation
  const customersAcquiredForCAC =
    validated.customersAcquiredPerMonth ?? validated.newCustomersPerMonth;

  // Calculate CAC
  const { cac, method: cacMethod } = calcCAC({
    salesMarketingSpendMonthly: validated.salesMarketingSpendMonthly,
    customersAcquiredPerMonth: customersAcquiredForCAC,
    assumedCAC: validated.assumedCAC,
  });

  // Calculate LTV
  const { ltv, monthsOfLife } = calcLTV({
    arpuMonthly,
    grossMarginPct,
    churnRateMonthly: validated.churnRateMonthly,
  });

  // Calculate Payback
  const { paybackMonths } = calcPaybackMonths({
    cac,
    arpuMonthly,
    grossMarginPct,
  });

  // Calculate LTV:CAC ratio
  const ltvCacRatio = cac > 0 && ltv !== Infinity ? round(ltv / cac, 2) : undefined;

  // Build unit economics
  const unitEconomics: BusinessTrackUnitEconomics = {
    arpuMonthly,
    grossMarginPct,
    cac,
    ltv: ltv === Infinity ? Infinity : ltv,
    paybackMonths: paybackMonths === Infinity ? 'Infinity' : paybackMonths,
    ltvCacRatio,
  };

  // Build monthly projections
  const projections: BusinessTrackProjection[] = [];
  let currentCustomers = validated.startingCustomers;

  for (let month = 1; month <= validated.months; month++) {
    // Calculate churned customers
    const churnedCustomers = round(currentCustomers * validated.churnRateMonthly, 0);

    // Calculate retained customers
    const retainedCustomers = nonNegative(currentCustomers - churnedCustomers);

    // Add new customers
    const newCustomers = round(validated.newCustomersPerMonth, 0);

    // Calculate end customers
    const customersEnd = nonNegative(retainedCustomers + newCustomers);

    // Calculate revenue
    // Baseline: all customers * ARPU
    let revenue = customersEnd * arpuMonthly;

    // Expansion uplift: only on retained base
    const expansionRate = validated.expansionPctMonthly ?? 0;
    if (expansionRate > 0 && retainedCustomers > 0) {
      const expansionRevenue = retainedCustomers * arpuMonthly * expansionRate;
      revenue += expansionRevenue;
    }

    revenue = round(revenue, 2);

    // Calculate COGS
    let cogs = revenue * validated.cogsPct;

    // If variable cost per user provided, use max
    if (validated.variableCostPerUser) {
      const variableCogs = customersEnd * validated.variableCostPerUser;
      cogs = Math.max(cogs, variableCogs);
    }

    cogs = round(cogs, 2);

    // Calculate gross margin
    const grossMargin = round(revenue - cogs, 2);
    const grossMarginPctMonth = revenue > 0 ? round(grossMargin / revenue, 4) : 0;

    // Add projection row
    projections.push({
      month,
      customersEnd,
      newCustomers,
      churnedCustomers,
      revenue,
      cogs,
      grossMargin,
      grossMarginPct: grossMarginPctMonth,
      cac,
    });

    // Update current customers for next iteration
    currentCustomers = customersEnd;
  }

  // Build assumptions record
  const assumptions: Record<string, string | number> = {
    arpuMonthly,
    arpuNotes,
    cogsPct: validated.cogsPct,
    startingCustomers: validated.startingCustomers,
    newCustomersPerMonth: validated.newCustomersPerMonth,
    churnRateMonthly: validated.churnRateMonthly,
    expansionPctMonthly: validated.expansionPctMonthly ?? 0,
    salesMarketingSpendMonthly: validated.salesMarketingSpendMonthly,
    cacMethod,
    monthsOfLife: monthsOfLife === Infinity ? 'Infinity' : monthsOfLife,
  };

  if (validated.variableCostPerUser) {
    assumptions.variableCostPerUser = validated.variableCostPerUser;
  }

  if (validated.acv) {
    assumptions.acv = validated.acv;
  }

  return {
    unitEconomics,
    projections,
    assumptions,
  };
}

/**
 * Validate financial inputs (returns validation result)
 * @param inputs - Financial inputs to validate
 * @returns Validation success/error
 */
export function validateFinancialInputs(inputs: unknown): {
  success: boolean;
  data?: FinancialInputs;
  errors?: string[];
} {
  try {
    const validated = FinancialInputsSchema.parse(inputs);
    return {
      success: true,
      data: validated,
    };
  } catch (error: any) {
    const errors: string[] = [];

    if (error.errors) {
      for (const err of error.errors) {
        errors.push(`${err.path.join('.')}: ${err.message}`);
      }
    } else {
      errors.push(error.message || 'Validation failed');
    }

    return {
      success: false,
      errors,
    };
  }
}
