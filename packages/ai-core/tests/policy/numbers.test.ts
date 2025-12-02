/**
 * Tests for Number Validation and Grounding
 */

import { describe, it, expect } from 'vitest';
import {
  extractNumbers,
  isNumberGrounded,
  isSuspiciousMagnitude,
  validateFinancialNumbers,
  validateGeneralNumbers,
  validateNumbers,
  type ExtractedNumber,
} from '../../src/policy/numbers.js';

describe('extractNumbers', () => {
  it('should extract currency with dollar sign', () => {
    const text = 'The price is $1,234.56 per month.';
    const numbers = extractNumbers(text);

    expect(numbers).toHaveLength(1);
    expect(numbers[0].value).toBe(1234.56);
    expect(numbers[0].text).toBe('$1,234.56');
  });

  it('should extract currency with multipliers', () => {
    const text = 'Market size is $5M and revenue is $250K.';
    const numbers = extractNumbers(text);

    expect(numbers).toHaveLength(2);
    expect(numbers[0].value).toBe(5000000);
    expect(numbers[0].text).toBe('$5M');
    expect(numbers[1].value).toBe(250000);
    expect(numbers[1].text).toBe('$250K');
  });

  it('should extract percentages', () => {
    const text = 'Growth rate is 25% and margin is 15.5%.';
    const numbers = extractNumbers(text);

    expect(numbers.some((n) => n.value === 25 && n.text === '25%')).toBe(true);
    expect(numbers.some((n) => n.value === 15.5 && n.text === '15.5%')).toBe(true);
  });

  it('should extract plain numbers (>=100)', () => {
    const text = 'We have 150 customers and 1000 users.';
    const numbers = extractNumbers(text);

    expect(numbers.some((n) => n.value === 150)).toBe(true);
    expect(numbers.some((n) => n.value === 1000)).toBe(true);
  });

  it('should ignore small plain numbers (<100)', () => {
    const text = 'There are 5 steps and 12 months.';
    const numbers = extractNumbers(text);

    // Small numbers < 100 should be ignored
    expect(numbers.some((n) => n.value === 5)).toBe(false);
    expect(numbers.some((n) => n.value === 12)).toBe(false);
  });

  it('should extract numbers with commas', () => {
    const text = 'Revenue reached $1,234,567 last year.';
    const numbers = extractNumbers(text);

    expect(numbers.some((n) => n.value === 1234567)).toBe(true);
  });

  it('should include context (30 chars each side)', () => {
    const text = 'The average revenue per user is $125.50 which is good.';
    const numbers = extractNumbers(text);

    expect(numbers[0].context).toContain('revenue per user');
    expect(numbers[0].context).toContain('which is good');
  });

  it('should handle multiple numbers of different types', () => {
    const text = 'The market is $50M with 25% growth and 1500 customers.';
    const numbers = extractNumbers(text);

    expect(numbers.length).toBeGreaterThanOrEqual(3);
    expect(numbers.some((n) => n.value === 50000000)).toBe(true);
    expect(numbers.some((n) => n.value === 25)).toBe(true);
    expect(numbers.some((n) => n.value === 1500)).toBe(true);
  });

  it('should avoid duplicates from currency/percentage', () => {
    const text = 'Price is $100 and growth is 25%.';
    const numbers = extractNumbers(text);

    // Should have $100 (currency) and 25% (percentage), not plain 100 and 25
    expect(numbers.filter((n) => n.value === 100)).toHaveLength(1);
    expect(numbers.filter((n) => n.value === 25)).toHaveLength(1);
  });
});

describe('isNumberGrounded', () => {
  const financeJson = {
    unitEconomics: {
      arpuMonthly: 100,
      cac: 500,
      ltv: 1500,
      grossMarginPct: 0.75,
      paybackMonths: 6.7,
    },
    projections: [
      { month: 1, revenue: 10500, customersEnd: 105 },
      { month: 2, revenue: 11000, customersEnd: 110 },
    ],
  };

  it('should find exact match', () => {
    expect(isNumberGrounded(100, financeJson)).toBe(true);
    expect(isNumberGrounded(500, financeJson)).toBe(true);
    expect(isNumberGrounded(1500, financeJson)).toBe(true);
  });

  it('should find match within currency tolerance (1%)', () => {
    // 500 ± 1% = 495-505
    expect(isNumberGrounded(495, financeJson)).toBe(true);
    expect(isNumberGrounded(505, financeJson)).toBe(true);
    expect(isNumberGrounded(490, financeJson)).toBe(false);
    expect(isNumberGrounded(510, financeJson)).toBe(false);
  });

  it('should find match within percentage tolerance (0.5pp)', () => {
    // 0.75 ± 0.005 = 0.745-0.755
    expect(isNumberGrounded(0.75, financeJson)).toBe(true);
    expect(isNumberGrounded(0.745, financeJson)).toBe(true);
    expect(isNumberGrounded(0.755, financeJson)).toBe(true);
    expect(isNumberGrounded(0.74, financeJson)).toBe(false);
  });

  it('should return false for non-existent number', () => {
    expect(isNumberGrounded(999, financeJson)).toBe(false);
    expect(isNumberGrounded(12345, financeJson)).toBe(false);
  });

  it('should return false when no finance JSON', () => {
    expect(isNumberGrounded(100, null)).toBe(false);
    expect(isNumberGrounded(100, undefined)).toBe(false);
  });

  it('should handle small counts with ±1 tolerance', () => {
    const json = { counts: { users: 50 } };
    // 50 ± 1 = 49-51
    expect(isNumberGrounded(50, json)).toBe(true);
    expect(isNumberGrounded(49, json)).toBe(true);
    expect(isNumberGrounded(51, json)).toBe(true);
    expect(isNumberGrounded(48, json)).toBe(false);
  });
});

describe('isSuspiciousMagnitude', () => {
  it('should flag unrealistic prices', () => {
    expect(isSuspiciousMagnitude(0, 'The price is')).toBe(true);
    expect(isSuspiciousMagnitude(-10, 'The cost is')).toBe(true);
    expect(isSuspiciousMagnitude(2000000, 'ARPU is')).toBe(true);
  });

  it('should accept reasonable prices', () => {
    expect(isSuspiciousMagnitude(10, 'The price is')).toBe(false);
    expect(isSuspiciousMagnitude(99.99, 'The cost is')).toBe(false);
    expect(isSuspiciousMagnitude(500, 'ARPU is')).toBe(false);
  });

  it('should flag unrealistic market sizes', () => {
    expect(isSuspiciousMagnitude(500, 'The market size is')).toBe(true); // Too small
    expect(isSuspiciousMagnitude(1e15, 'TAM is')).toBe(true); // Too large
  });

  it('should accept reasonable market sizes', () => {
    expect(isSuspiciousMagnitude(5000000, 'The market is')).toBe(false); // $5M
    expect(isSuspiciousMagnitude(50000000000, 'TAM is')).toBe(false); // $50B
  });

  it('should flag unrealistic growth rates', () => {
    expect(isSuspiciousMagnitude(-150, 'The growth rate is')).toBe(true);
    expect(isSuspiciousMagnitude(2000, 'The growth rate is')).toBe(true);
  });

  it('should accept reasonable growth rates', () => {
    expect(isSuspiciousMagnitude(25, 'The growth rate is')).toBe(false);
    expect(isSuspiciousMagnitude(100, 'The growth rate is')).toBe(false);
    expect(isSuspiciousMagnitude(-20, 'The growth rate is')).toBe(false);
  });

  it('should flag unrealistic margins', () => {
    expect(isSuspiciousMagnitude(-60, 'The margin is')).toBe(true);
    expect(isSuspiciousMagnitude(150, 'The profit margin is')).toBe(true);
  });

  it('should accept reasonable margins', () => {
    expect(isSuspiciousMagnitude(25, 'The margin is')).toBe(false);
    expect(isSuspiciousMagnitude(75, 'The profit margin is')).toBe(false);
    expect(isSuspiciousMagnitude(-10, 'The margin is')).toBe(false);
  });

  it('should be context-aware', () => {
    // Same value, different contexts
    const value = 2000000;
    expect(isSuspiciousMagnitude(value, 'The price is')).toBe(true); // Too high for price
    expect(isSuspiciousMagnitude(value, 'The market size is')).toBe(false); // OK for market
  });
});

describe('validateFinancialNumbers', () => {
  const financeJson = {
    unitEconomics: {
      arpuMonthly: 100,
      cac: 500,
      ltv: 1500,
      grossMarginPct: 0.75,
    },
  };

  it('should pass when all numbers are grounded', () => {
    const text = 'ARPU is $100, CAC is $500, and LTV is $1,500.';
    const issues = validateFinancialNumbers(text, financeJson, true);

    expect(issues).toHaveLength(0);
  });

  it('should error when number not found in finance JSON', () => {
    const text = 'ARPU is $100 and CAC is $999.';
    const issues = validateFinancialNumbers(text, financeJson, true);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNGROUNDED_NUMBER');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].meta?.text).toBe('$999');
  });

  it('should pass numbers within tolerance', () => {
    const text = 'ARPU is $100 and CAC is $495.'; // 495 is within 1% of 500
    const issues = validateFinancialNumbers(text, financeJson, true);

    expect(issues).toHaveLength(0);
  });

  it('should error numbers outside tolerance', () => {
    const text = 'ARPU is $100 and CAC is $550.'; // 550 is outside 1% of 500
    const issues = validateFinancialNumbers(text, financeJson, true);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNGROUNDED_NUMBER');
    expect(issues[0].meta?.text).toBe('$550');
  });

  it('should pass when strict mode is false', () => {
    const text = 'ARPU is $100 and CAC is $999.';
    const issues = validateFinancialNumbers(text, financeJson, false);

    expect(issues).toHaveLength(0);
  });

  it('should pass when no finance JSON provided', () => {
    const text = 'ARPU is $100 and CAC is $999.';
    const issues = validateFinancialNumbers(text, null, true);

    expect(issues).toHaveLength(0);
  });

  it('should ignore very small numbers', () => {
    const text = 'There are 3 steps. ARPU is $100.';
    const issues = validateFinancialNumbers(text, financeJson, true);

    // Should only validate $100 (grounded), not 3 (too small)
    expect(issues).toHaveLength(0);
  });

  it('should validate percentages', () => {
    const text = 'Gross margin is 75% and CAC is $500.'; // 75% = 0.75 in JSON
    const issues = validateFinancialNumbers(text, financeJson, true);

    expect(issues).toHaveLength(0);
  });
});

describe('validateGeneralNumbers', () => {
  it('should pass when numbers have reasonable magnitudes', () => {
    const text = 'The market is $50M with 25% growth and price of $99.';
    const issues = validateGeneralNumbers(text);

    expect(issues).toHaveLength(0);
  });

  it('should warn on suspicious price magnitudes', () => {
    const text = 'The price is $5M per user.';
    const issues = validateGeneralNumbers(text);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('SUSPICIOUS_MAGNITUDE');
    expect(issues[0].severity).toBe('warning');
  });

  it('should warn on suspicious market sizes', () => {
    const text = 'The TAM is $500 total.';
    const issues = validateGeneralNumbers(text);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('SUSPICIOUS_MAGNITUDE');
  });

  it('should warn on suspicious growth rates', () => {
    const text = 'The growth rate is 5000% per year.';
    const issues = validateGeneralNumbers(text);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('SUSPICIOUS_MAGNITUDE');
  });

  it('should handle multiple suspicious numbers', () => {
    const text = 'The price is $10M and the growth is 10000%.';
    const issues = validateGeneralNumbers(text);

    expect(issues.length).toBeGreaterThanOrEqual(2);
    expect(issues.every((i) => i.code === 'SUSPICIOUS_MAGNITUDE')).toBe(true);
  });
});

describe('validateNumbers', () => {
  const financeJson = {
    unitEconomics: {
      arpuMonthly: 100,
      cac: 500,
    },
  };

  it('should use financial validation for exec_summary', () => {
    const text = 'ARPU is $100 and CAC is $999.'; // 999 not in financeJson
    const issues = validateNumbers('exec_summary', text, financeJson, true);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNGROUNDED_NUMBER');
  });

  it('should use financial validation for financial_overview', () => {
    const text = 'ARPU is $100 and CAC is $999.';
    const issues = validateNumbers('financial_overview', text, financeJson, true);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNGROUNDED_NUMBER');
  });

  it('should use general validation for streamlined_plan', () => {
    const text = 'The price is $10M per user.'; // Suspicious magnitude
    const issues = validateNumbers('streamlined_plan', text);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('SUSPICIOUS_MAGNITUDE');
  });

  it('should use general validation for market_analysis', () => {
    const text = 'The TAM is $100 total.'; // Suspicious market size
    const issues = validateNumbers('market_analysis', text);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('SUSPICIOUS_MAGNITUDE');
  });

  it('should pass when strict mode is false for financial assistants', () => {
    const text = 'ARPU is $100 and CAC is $999.';
    const issues = validateNumbers('exec_summary', text, financeJson, false);

    expect(issues).toHaveLength(0);
  });
});
