/**
 * Deterministic Financial Calculations for Business Track
 * Pure functions for unit economics, CAC/LTV, and financial projections
 *
 * All functions are deterministic - same inputs produce same outputs
 * No network I/O, no randomness, fully typed with Zod validation
 */
import type { FinancialInputs, BusinessTrackFinancialModel } from '@kimuntupro/shared';
/**
 * Calculate ARPU (Average Revenue Per User) monthly
 * @param params - Pricing parameters
 * @returns ARPU monthly and calculation notes
 */
export declare function calcARPU(params: {
    arpuMonthly?: number;
    acv?: number;
}): {
    arpuMonthly: number;
    notes: string;
};
/**
 * Calculate Gross Margin percentage
 * @param params - Revenue and cost parameters
 * @returns Gross margin percentage (0-1 scale)
 */
export declare function calcGrossMargin(params: {
    arpuMonthly: number;
    cogsPct: number;
    variableCostPerUser?: number;
}): {
    grossMarginPct: number;
};
/**
 * Calculate Customer Acquisition Cost (CAC)
 * @param params - Sales/marketing parameters
 * @returns CAC and calculation method
 */
export declare function calcCAC(params: {
    salesMarketingSpendMonthly: number;
    customersAcquiredPerMonth?: number;
    assumedCAC?: number;
}): {
    cac: number;
    method: 'derived' | 'assumed';
};
/**
 * Calculate Lifetime Value (LTV)
 * LTV = ARPU * GM% / Churn Rate
 * @param params - LTV calculation parameters
 * @returns LTV and average months of customer life
 */
export declare function calcLTV(params: {
    arpuMonthly: number;
    grossMarginPct: number;
    churnRateMonthly: number;
}): {
    ltv: number;
    monthsOfLife: number;
};
/**
 * Calculate Payback Period (in months)
 * Payback = CAC / (ARPU * GM%)
 * @param params - Payback calculation parameters
 * @returns Payback period in months
 */
export declare function calcPaybackMonths(params: {
    cac: number;
    arpuMonthly: number;
    grossMarginPct: number;
}): {
    paybackMonths: number;
};
/**
 * Build complete financial model with unit economics and projections
 * @param inputs - Financial inputs (validated with Zod)
 * @returns Complete financial model
 */
export declare function buildFinancialModel(inputs: FinancialInputs): BusinessTrackFinancialModel;
/**
 * Validate financial inputs (returns validation result)
 * @param inputs - Financial inputs to validate
 * @returns Validation success/error
 */
export declare function validateFinancialInputs(inputs: unknown): {
    success: boolean;
    data?: FinancialInputs;
    errors?: string[];
};
//# sourceMappingURL=finance.d.ts.map