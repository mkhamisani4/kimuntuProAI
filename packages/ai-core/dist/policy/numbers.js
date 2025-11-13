/**
 * Numeric Validation for Business Track Policy
 * Validates number grounding and sanity checks
 */
/**
 * Extract numbers from text
 * Finds currency, percentages, and plain numbers
 *
 * @param text - Text to search
 * @param section - Optional section name for context
 * @returns Array of extracted numbers
 */
export function extractNumbers(text, section) {
    const numbers = [];
    // Currency pattern: $1,234.56 or $1.23M/B/K
    const currencyRegex = /\$([0-9,]+(?:\.[0-9]+)?)([KMB])?/gi;
    let match;
    while ((match = currencyRegex.exec(text)) !== null) {
        const numText = match[1].replace(/,/g, '');
        let value = parseFloat(numText);
        // Apply multiplier
        const multiplier = match[2]?.toUpperCase();
        if (multiplier === 'K')
            value *= 1000;
        else if (multiplier === 'M')
            value *= 1000000;
        else if (multiplier === 'B')
            value *= 1000000000;
        if (!isNaN(value)) {
            const start = Math.max(0, match.index - 30);
            const end = Math.min(text.length, match.index + match[0].length + 30);
            const context = text.slice(start, end);
            numbers.push({
                value,
                text: match[0],
                context,
                section,
            });
        }
    }
    // Percentage pattern: 25% or 25.5%
    const percentRegex = /([0-9]+(?:\.[0-9]+)?)\s*%/g;
    while ((match = percentRegex.exec(text)) !== null) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
            const start = Math.max(0, match.index - 30);
            const end = Math.min(text.length, match.index + match[0].length + 30);
            const context = text.slice(start, end);
            numbers.push({
                value,
                text: match[0],
                context,
                section,
            });
        }
    }
    // Plain numbers (avoid duplicates from currency/percentage)
    const plainRegex = /\b([0-9]{2,}(?:,[0-9]{3})*(?:\.[0-9]+)?)\b/g;
    while ((match = plainRegex.exec(text)) !== null) {
        // Skip if already captured by currency/percentage
        const matchIndex = match.index;
        const alreadyCaptured = numbers.some((n) => Math.abs(matchIndex - text.indexOf(n.text)) < 5);
        if (!alreadyCaptured) {
            const numText = match[1].replace(/,/g, '');
            const value = parseFloat(numText);
            if (!isNaN(value) && value >= 100) {
                // Only care about significant numbers
                const start = Math.max(0, match.index - 30);
                const end = Math.min(text.length, match.index + match[0].length + 30);
                const context = text.slice(start, end);
                numbers.push({
                    value,
                    text: match[0],
                    context,
                    section,
                });
            }
        }
    }
    return numbers;
}
/**
 * Check if number is grounded in finance JSON
 * Allows tolerance windows
 *
 * @param value - Number to check
 * @param financeJson - Finance JSON object
 * @param tolerance - Tolerance settings
 * @returns True if grounded
 */
export function isNumberGrounded(value, financeJson, tolerance = {
    currencyPct: 0.02,
    percentagePp: 0.5,
    countPct: 0.01,
}) {
    if (!financeJson)
        return false;
    // Flatten finance JSON to extract all numeric values
    const allValues = extractAllNumbers(financeJson);
    // Check if value matches any with tolerance
    return allValues.some((candidate) => {
        // Determine tolerance based on magnitude
        let toleranceValue;
        if (candidate < 1) {
            // Percentage (0-1 range)
            toleranceValue = tolerance.percentagePp / 100;
        }
        else if (candidate < 100) {
            // Small counts - allow ±1
            toleranceValue = 1;
        }
        else if (candidate < 1000) {
            // Medium counts - percentage tolerance
            toleranceValue = candidate * tolerance.countPct;
        }
        else {
            // Currency - percentage tolerance
            toleranceValue = candidate * tolerance.currencyPct;
        }
        return Math.abs(value - candidate) <= toleranceValue;
    });
}
/**
 * Recursively extract all numbers from an object
 *
 * @param obj - Object to search
 * @returns Array of numbers
 */
function extractAllNumbers(obj) {
    const numbers = [];
    if (typeof obj === 'number' && !isNaN(obj)) {
        numbers.push(obj);
    }
    else if (Array.isArray(obj)) {
        for (const item of obj) {
            numbers.push(...extractAllNumbers(item));
        }
    }
    else if (typeof obj === 'object' && obj !== null) {
        for (const value of Object.values(obj)) {
            numbers.push(...extractAllNumbers(value));
        }
    }
    return numbers;
}
/**
 * Check if number magnitude is suspicious
 * Different rules for different contexts
 *
 * @param value - Number to check
 * @param context - Context text
 * @returns True if suspicious
 */
export function isSuspiciousMagnitude(value, context) {
    const lowerContext = context.toLowerCase();
    // Price checks
    if (lowerContext.includes('price') ||
        lowerContext.includes('cost') ||
        lowerContext.includes('arpu')) {
        // Prices should be reasonable: $0.01 to $1M
        if (value <= 0 || value >= 1000000) {
            return true;
        }
    }
    // Market size checks
    if (lowerContext.includes('market') ||
        lowerContext.includes('tam') ||
        lowerContext.includes('sam') ||
        lowerContext.includes('som')) {
        // Market sizes: $1K to $100T
        if (value < 1000 || value > 100000000000000) {
            return true;
        }
    }
    // Growth rate checks (percentages)
    if (lowerContext.includes('growth') ||
        lowerContext.includes('rate') ||
        lowerContext.includes('change')) {
        // Growth rates: -100% to 1000%
        if (value < -100 || value > 1000) {
            return true;
        }
    }
    // Margin checks (percentages)
    if (lowerContext.includes('margin') || lowerContext.includes('profit')) {
        // Margins: -50% to 100%
        if (value < -50 || value > 100) {
            return true;
        }
    }
    return false;
}
/**
 * Validate numbers for financial assistants (#109)
 * Requires strict grounding in finance JSON
 *
 * @param text - Complete response text
 * @param financeJson - Finance JSON object
 * @param strictMode - Enable strict validation
 * @returns Array of validation issues
 */
export function validateFinancialNumbers(text, financeJson, strictMode = true) {
    const issues = [];
    if (!strictMode || !financeJson) {
        return issues;
    }
    const numbers = extractNumbers(text);
    // Filter out very small numbers (likely not financial metrics)
    const significantNumbers = numbers.filter((n) => n.value >= 0.01);
    for (const num of significantNumbers) {
        if (!isNumberGrounded(num.value, financeJson)) {
            issues.push({
                code: 'UNGROUNDED_NUMBER',
                message: `Number ${num.text} in section ${num.section || 'unknown'} not found in finance calculations`,
                meta: {
                    value: num.value,
                    text: num.text,
                    context: num.context,
                    section: num.section,
                },
                severity: 'warning',
            });
        }
    }
    return issues;
}
/**
 * Validate numbers for non-financial assistants (#108, #110)
 * Applies sanity checks only
 *
 * @param text - Complete response text
 * @returns Array of validation issues
 */
export function validateGeneralNumbers(text) {
    const issues = [];
    const numbers = extractNumbers(text);
    for (const num of numbers) {
        if (isSuspiciousMagnitude(num.value, num.context)) {
            issues.push({
                code: 'SUSPICIOUS_MAGNITUDE',
                message: `Number ${num.text} has suspicious magnitude given context`,
                meta: {
                    value: num.value,
                    text: num.text,
                    context: num.context,
                    section: num.section,
                },
                severity: 'warning',
            });
        }
    }
    return issues;
}
/**
 * Validate numbers based on assistant type
 *
 * @param assistant - Assistant type
 * @param text - Complete response text
 * @param financeJson - Optional finance JSON
 * @param strictMode - Enable strict validation for #109
 * @returns Array of validation issues
 */
export function validateNumbers(assistant, text, financeJson, strictMode = true) {
    if (assistant === 'exec_summary' || assistant === 'financial_overview') {
        return validateFinancialNumbers(text, financeJson, strictMode);
    }
    else {
        return validateGeneralNumbers(text);
    }
}
//# sourceMappingURL=numbers.js.map