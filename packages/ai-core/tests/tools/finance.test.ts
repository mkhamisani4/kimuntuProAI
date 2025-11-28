/**
 * Tests for Deterministic Finance Calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calcARPU,
  calcGrossMargin,
  calcCAC,
  calcLTV,
  calcPaybackMonths,
  buildFinancialModel,
  validateFinancialInputs,
} from '../../src/tools/finance.js';
import { buildFinanceToolSpec } from '../../src/tools/financeTool.js';
import type { FinancialInputs } from '@kimuntupro/shared';

describe('calcARPU', () => {
  it('should use arpuMonthly if provided', () => {
    const result = calcARPU({ arpuMonthly: 100 });
    expect(result.arpuMonthly).toBe(100);
    expect(result.notes).toContain('provided');
  });

  it('should calculate from ACV if no arpuMonthly', () => {
    const result = calcARPU({ acv: 1200 });
    expect(result.arpuMonthly).toBe(100); // 1200 / 12
    expect(result.notes).toContain('ACV');
  });

  it('should prefer arpuMonthly over ACV', () => {
    const result = calcARPU({ arpuMonthly: 150, acv: 1200 });
    expect(result.arpuMonthly).toBe(150);
  });

  it('should handle zero values', () => {
    const result = calcARPU({ arpuMonthly: 0, acv: 0 });
    expect(result.arpuMonthly).toBe(0);
  });

  it('should round to 2 decimals', () => {
    const result = calcARPU({ acv: 1234.567 });
    expect(result.arpuMonthly).toBe(102.88); // 1234.567 / 12 = 102.88...
  });
});

describe('calcGrossMargin', () => {
  it('should calculate GM% from COGS%', () => {
    const result = calcGrossMargin({
      arpuMonthly: 100,
      cogsPct: 0.25, // 25% COGS
    });
    expect(result.grossMarginPct).toBe(0.75); // 75% GM
  });

  it('should handle zero ARPU', () => {
    const result = calcGrossMargin({
      arpuMonthly: 0,
      cogsPct: 0.25,
    });
    expect(result.grossMarginPct).toBe(0);
  });

  it('should use variable cost if higher', () => {
    const result = calcGrossMargin({
      arpuMonthly: 100,
      cogsPct: 0.1, // 10% = $10
      variableCostPerUser: 30, // $30 > $10
    });
    // GM = (100 - 30) / 100 = 70%
    expect(result.grossMarginPct).toBe(0.7);
  });

  it('should ignore variable cost if lower', () => {
    const result = calcGrossMargin({
      arpuMonthly: 100,
      cogsPct: 0.4, // 40% = $40
      variableCostPerUser: 20, // $20 < $40
    });
    // GM = (100 - 40) / 100 = 60%
    expect(result.grossMarginPct).toBe(0.6);
  });

  it('should round to 4 decimals', () => {
    const result = calcGrossMargin({
      arpuMonthly: 123.45,
      cogsPct: 0.333333,
    });
    expect(result.grossMarginPct).toBeCloseTo(0.6667, 4);
  });
});

describe('calcCAC', () => {
  it('should use assumed CAC if provided', () => {
    const result = calcCAC({
      salesMarketingSpendMonthly: 10000,
      customersAcquiredPerMonth: 100,
      assumedCAC: 75,
    });
    expect(result.cac).toBe(75);
    expect(result.method).toBe('assumed');
  });

  it('should derive CAC from spend / customers', () => {
    const result = calcCAC({
      salesMarketingSpendMonthly: 10000,
      customersAcquiredPerMonth: 100,
    });
    expect(result.cac).toBe(100); // 10000 / 100
    expect(result.method).toBe('derived');
  });

  it('should return 0 if no customers acquired', () => {
    const result = calcCAC({
      salesMarketingSpendMonthly: 10000,
      customersAcquiredPerMonth: 0,
    });
    expect(result.cac).toBe(0);
    expect(result.method).toBe('derived');
  });

  it('should round to 2 decimals', () => {
    const result = calcCAC({
      salesMarketingSpendMonthly: 10000,
      customersAcquiredPerMonth: 123,
    });
    expect(result.cac).toBe(81.3); // 10000 / 123 = 81.30...
  });
});

describe('calcLTV', () => {
  it('should calculate LTV from ARPU * GM% / Churn', () => {
    const result = calcLTV({
      arpuMonthly: 100,
      grossMarginPct: 0.75, // 75%
      churnRateMonthly: 0.05, // 5%
    });
    // LTV = 100 * 0.75 / 0.05 = 1500
    expect(result.ltv).toBe(1500);
    // Months of life = 1 / 0.05 = 20
    expect(result.monthsOfLife).toBe(20);
  });

  it('should return Infinity for zero churn', () => {
    const result = calcLTV({
      arpuMonthly: 100,
      grossMarginPct: 0.75,
      churnRateMonthly: 0,
    });
    expect(result.ltv).toBe(Infinity);
    expect(result.monthsOfLife).toBe(Infinity);
  });

  it('should handle high churn', () => {
    const result = calcLTV({
      arpuMonthly: 100,
      grossMarginPct: 0.75,
      churnRateMonthly: 0.5, // 50% monthly churn
    });
    // LTV = 100 * 0.75 / 0.5 = 150
    expect(result.ltv).toBe(150);
    // Months of life = 1 / 0.5 = 2
    expect(result.monthsOfLife).toBe(2);
  });

  it('should round appropriately', () => {
    const result = calcLTV({
      arpuMonthly: 99.99,
      grossMarginPct: 0.6789,
      churnRateMonthly: 0.037,
    });
    // LTV = 99.99 * 0.6789 / 0.037 = 1834.68 (after rounding to 2 decimals)
    expect(result.ltv).toBeCloseTo(1834.68, 2);
    expect(result.monthsOfLife).toBeCloseTo(27.0, 1);
  });
});

describe('calcPaybackMonths', () => {
  it('should calculate payback from CAC / (ARPU * GM%)', () => {
    const result = calcPaybackMonths({
      cac: 600,
      arpuMonthly: 100,
      grossMarginPct: 0.75, // 75%
    });
    // Payback = 600 / (100 * 0.75) = 600 / 75 = 8 months
    expect(result.paybackMonths).toBe(8);
  });

  it('should return Infinity for zero gross profit', () => {
    const result = calcPaybackMonths({
      cac: 600,
      arpuMonthly: 100,
      grossMarginPct: 0, // No gross profit
    });
    expect(result.paybackMonths).toBe(Infinity);
  });

  it('should return Infinity for zero ARPU', () => {
    const result = calcPaybackMonths({
      cac: 600,
      arpuMonthly: 0,
      grossMarginPct: 0.75,
    });
    expect(result.paybackMonths).toBe(Infinity);
  });

  it('should round to 1 decimal', () => {
    const result = calcPaybackMonths({
      cac: 575,
      arpuMonthly: 99,
      grossMarginPct: 0.68,
    });
    // Payback = 575 / (99 * 0.68) = 575 / 67.32 = 8.54...
    expect(result.paybackMonths).toBeCloseTo(8.5, 1);
  });
});

describe('validateFinancialInputs', () => {
  it('should accept valid inputs', () => {
    const inputs = {
      arpuMonthly: 100,
      cogsPct: 0.25,
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 12,
    };

    const result = validateFinancialInputs(inputs);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject missing required fields', () => {
    const inputs = {
      arpuMonthly: 100,
      // missing cogsPct, startingCustomers, etc.
    };

    const result = validateFinancialInputs(inputs);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should reject invalid ranges', () => {
    const inputs = {
      arpuMonthly: 100,
      cogsPct: 1.5, // > 1
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 12,
    };

    const result = validateFinancialInputs(inputs);
    expect(result.success).toBe(false);
  });

  it('should reject negative values', () => {
    const inputs = {
      arpuMonthly: -100, // negative
      cogsPct: 0.25,
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 12,
    };

    const result = validateFinancialInputs(inputs);
    expect(result.success).toBe(false);
  });

  it('should clamp months to max 24', () => {
    const inputs = {
      arpuMonthly: 100,
      cogsPct: 0.25,
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 36, // > 24
    };

    const result = validateFinancialInputs(inputs);
    expect(result.success).toBe(false);
  });

  it('should require either arpuMonthly or acv', () => {
    const inputs = {
      // neither arpuMonthly nor acv provided
      cogsPct: 0.25,
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 12,
    };

    const result = validateFinancialInputs(inputs);
    expect(result.success).toBe(false);
  });
});

describe('buildFinancialModel', () => {
  const baseInputs: FinancialInputs = {
    arpuMonthly: 100,
    cogsPct: 0.25,
    startingCustomers: 100,
    newCustomersPerMonth: 10,
    churnRateMonthly: 0.05,
    salesMarketingSpendMonthly: 5000,
    months: 12,
  };

  it('should build complete model with unit economics and projections', () => {
    const model = buildFinancialModel(baseInputs);

    expect(model.unitEconomics).toBeDefined();
    expect(model.projections).toBeDefined();
    expect(model.assumptions).toBeDefined();

    expect(model.unitEconomics.arpuMonthly).toBe(100);
    expect(model.unitEconomics.grossMarginPct).toBe(0.75);
    expect(model.unitEconomics.cac).toBe(500); // 5000 / 10
    expect(model.unitEconomics.ltv).toBe(1500); // 100 * 0.75 / 0.05
    expect(model.unitEconomics.paybackMonths).toBe(6.7); // 500 / (100 * 0.75)

    expect(model.projections).toHaveLength(12);
    expect(model.projections[0].month).toBe(1);
  });

  it('should handle zero churn (customers grow monotonically)', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      churnRateMonthly: 0,
    };

    const model = buildFinancialModel(inputs);

    expect(model.unitEconomics.ltv).toBe(Infinity);
    expect(model.projections).toHaveLength(12);

    // Customers should grow every month
    for (let i = 1; i < model.projections.length; i++) {
      expect(model.projections[i].customersEnd).toBeGreaterThan(
        model.projections[i - 1].customersEnd
      );
    }
  });

  it('should handle high churn (customers decline)', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      churnRateMonthly: 0.2, // 20% monthly churn
      newCustomersPerMonth: 5, // Only 5 new per month
    };

    const model = buildFinancialModel(inputs);

    // With high churn and low new customers, total should decline
    const firstMonth = model.projections[0].customersEnd;
    const lastMonth = model.projections[11].customersEnd;

    expect(lastMonth).toBeLessThan(firstMonth);
  });

  it('should apply expansion only to retained customers', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      expansionPctMonthly: 0.1, // 10% expansion
      churnRateMonthly: 0.05,
    };

    const model = buildFinancialModel(inputs);

    // Month 1: 100 starting customers
    const month1 = model.projections[0];

    // Churned: 100 * 0.05 = 5
    expect(month1.churnedCustomers).toBe(5);

    // Retained: 100 - 5 = 95
    // New: 10
    // End: 95 + 10 = 105
    expect(month1.customersEnd).toBe(105);

    // Revenue should include:
    // - Base: 105 * 100 = 10,500
    // - Expansion on retained 95: 95 * 100 * 0.1 = 950
    // - Total: 11,450
    expect(month1.revenue).toBeCloseTo(11450, 2);
  });

  it('should use variable cost if higher than cogsPct', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      cogsPct: 0.1, // 10%
      variableCostPerUser: 30, // $30 per user
    };

    const model = buildFinancialModel(inputs);

    const month1 = model.projections[0];

    // Month 1 has 105 customers (100 - 5 churn + 10 new)
    // Revenue: 105 * 100 = 10,500
    // COGS from cogsPct: 10,500 * 0.1 = 1,050
    // COGS from variable: 105 * 30 = 3,150
    // Should use max: 3,150
    expect(month1.cogs).toBe(3150);
  });

  it('should calculate LTV:CAC ratio', () => {
    const model = buildFinancialModel(baseInputs);

    expect(model.unitEconomics.ltvCacRatio).toBeDefined();
    // LTV = 1500, CAC = 500 => ratio = 3
    expect(model.unitEconomics.ltvCacRatio).toBe(3);
  });

  it('should use ACV to calculate ARPU', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      arpuMonthly: undefined,
      acv: 1200, // $1200 annual = $100 monthly
    };

    const model = buildFinancialModel(inputs);

    expect(model.unitEconomics.arpuMonthly).toBe(100);
    expect(model.assumptions.acv).toBe(1200);
  });

  it('should use assumed CAC if provided', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      assumedCAC: 400,
    };

    const model = buildFinancialModel(inputs);

    expect(model.unitEconomics.cac).toBe(400);
    expect(model.assumptions.cacMethod).toBe('assumed');
  });

  it('should handle customersAcquiredPerMonth different from newCustomersPerMonth', () => {
    const inputs: FinancialInputs = {
      ...baseInputs,
      newCustomersPerMonth: 10,
      customersAcquiredPerMonth: 20, // Different for CAC calc
    };

    const model = buildFinancialModel(inputs);

    // CAC = 5000 / 20 = 250
    expect(model.unitEconomics.cac).toBe(250);

    // But projections should still add 10 new customers per month
    expect(model.projections[0].newCustomers).toBe(10);
  });

  it('should produce deterministic results (same inputs -> same outputs)', () => {
    const model1 = buildFinancialModel(baseInputs);
    const model2 = buildFinancialModel(baseInputs);

    expect(model1).toEqual(model2);
  });

  it('should snapshot 12-month example', () => {
    const model = buildFinancialModel(baseInputs);

    // Snapshot key metrics
    expect(model.unitEconomics).toMatchObject({
      arpuMonthly: 100,
      grossMarginPct: 0.75,
      cac: 500,
      ltv: 1500,
      paybackMonths: 6.7,
      ltvCacRatio: 3,
    });

    // Snapshot first month
    expect(model.projections[0]).toMatchObject({
      month: 1,
      customersEnd: 105, // 100 - 5 churn + 10 new
      newCustomers: 10,
      churnedCustomers: 5,
      revenue: 10500, // 105 * 100
      cogs: 2625, // 10500 * 0.25
      grossMargin: 7875, // 10500 - 2625
      grossMarginPct: 0.75,
      cac: 500,
    });

    // Snapshot last month
    const lastMonth = model.projections[11];
    expect(lastMonth.month).toBe(12);
    expect(lastMonth.customersEnd).toBeGreaterThan(100); // Should grow
  });
});

describe('buildFinanceToolSpec', () => {
  it('should return spec and handler', () => {
    const { spec, handler } = buildFinanceToolSpec();

    expect(spec.type).toBe('function');
    expect(spec.function.name).toBe('finance_calc');
    expect(spec.function.description).toContain('financial');
    expect(spec.function.parameters).toBeDefined();
    expect(handler).toBeInstanceOf(Function);
  });

  it('should invoke handler successfully with valid inputs', () => {
    const { handler } = buildFinanceToolSpec();

    const result = handler({
      arpuMonthly: 100,
      cogsPct: 0.25,
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 12,
    });

    expect(result).toHaveProperty('unitEconomics');
    expect(result).toHaveProperty('projections');
    expect(result).toHaveProperty('assumptions');
  });

  it('should return error for invalid inputs', () => {
    const { handler } = buildFinanceToolSpec();

    const result = handler({
      arpuMonthly: -100, // Invalid
      cogsPct: 0.25,
      startingCustomers: 100,
      newCustomersPerMonth: 10,
      churnRateMonthly: 0.05,
      salesMarketingSpendMonthly: 5000,
      months: 12,
    });

    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('errors');
  });

  it('should handle missing required fields', () => {
    const { handler } = buildFinanceToolSpec();

    const result = handler({
      arpuMonthly: 100,
      // Missing required fields
    });

    expect(result).toHaveProperty('error');
  });
});
