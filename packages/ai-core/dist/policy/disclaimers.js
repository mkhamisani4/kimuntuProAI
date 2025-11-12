/**
 * Disclaimer Generation for Business Track Policy
 * Builds appropriate disclaimers based on assistant type and validation issues
 */
/**
 * Build disclaimer for assistant response
 *
 * @param assistant - Assistant type
 * @param issues - Validation issues
 * @param context - Additional context
 * @returns Disclaimer text or empty string
 */
export function buildDisclaimer(assistant, issues, context = {}) {
    const parts = [];
    // Task-specific disclaimers
    if (assistant === 'exec_summary' || assistant === 'financial_overview') {
        parts.push(buildFinancialDisclaimer(context.hasFinanceData || false));
    }
    else if (assistant === 'market_analysis') {
        parts.push(buildMarketDisclaimer(context.webSources || []));
    }
    // Issue-based warnings
    if (issues.length > 0) {
        parts.push(buildIssueWarning(issues));
    }
    return parts.filter((p) => p.length > 0).join('\n\n');
}
/**
 * Build financial disclaimer for #109 assistants
 *
 * @param hasFinanceData - Whether finance calculations were provided
 * @returns Disclaimer text
 */
function buildFinancialDisclaimer(hasFinanceData) {
    const disclaimer = `**Financial Disclaimer**

This document contains forward-looking financial projections and estimates${hasFinanceData ? ' based on provided assumptions' : ''}. Actual results may vary significantly. This analysis is for informational purposes only and does not constitute financial, investment, or legal advice.

Key limitations:
- Projections are based on assumptions that may not materialize
- Market conditions, competition, and execution risks may differ from expectations
- Past performance and industry benchmarks do not guarantee future results

Consult qualified financial, legal, and accounting professionals before making business decisions.`;
    return disclaimer;
}
/**
 * Build market research disclaimer for #110 assistants
 *
 * @param webSources - Web sources used
 * @returns Disclaimer text
 */
function buildMarketDisclaimer(webSources) {
    // Find most recent source
    const latestDate = findLatestSourceDate(webSources);
    const freshnessNote = latestDate
        ? ` Market data current as of ${formatDate(latestDate)}.`
        : ' Market data freshness varies by source.';
    const disclaimer = `**Market Research Disclaimer**

This market analysis is based on publicly available information and third-party research.${freshnessNote}

Key limitations:
- Market sizes and growth rates are estimates subject to uncertainty
- Competitive landscape evolves rapidly; information may become outdated
- Sources may have varying methodologies and definitions
- Geographic and segment-specific dynamics may differ from aggregated data

Verify critical figures with primary research and industry experts before making strategic decisions.`;
    return disclaimer;
}
/**
 * Build warning message based on validation issues
 *
 * @param issues - Validation issues
 * @returns Warning text
 */
function buildIssueWarning(issues) {
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    if (errorCount === 0 && warningCount === 0) {
        return '';
    }
    const parts = ['**Quality Notice**'];
    if (errorCount > 0) {
        parts.push(`This response has ${errorCount} error${errorCount > 1 ? 's' : ''} that should be addressed:`);
    }
    if (warningCount > 0) {
        parts.push(`${errorCount > 0 ? 'Additionally, there are' : 'There are'} ${warningCount} warning${warningCount > 1 ? 's' : ''}:`);
    }
    // Group issues by code
    const grouped = groupIssuesByCode(issues);
    for (const [code, codeIssues] of Object.entries(grouped)) {
        const count = codeIssues.length;
        parts.push(`- ${getIssueSummary(code, count)}`);
    }
    parts.push('\nPlease review and verify information before use.');
    return parts.join('\n');
}
/**
 * Get summary for issue code
 *
 * @param code - Issue code
 * @param count - Number of occurrences
 * @returns Summary text
 */
function getIssueSummary(code, count) {
    const plural = count > 1 ? 's' : '';
    switch (code) {
        case 'NO_SOURCES_SECTION':
            return 'Missing Sources section';
        case 'UNMAPPED_CITATION_MARKER':
            return `${count} citation${plural} reference non-existent sources`;
        case 'UNGROUNDED_NUMBER':
            return `${count} number${plural} not found in provided calculations`;
        case 'SUSPICIOUS_MAGNITUDE':
            return `${count} number${plural} with unusual magnitudes`;
        case 'PROMPT_INJECTION_DETECTED':
            return `${count} source${plural} contain potential prompt injection`;
        case 'UNSUPPORTED_RECENCY':
            return 'Current claims without recent sources';
        case 'PII_LEAKAGE':
            return `Potential PII detected in ${count} location${plural}`;
        case 'EMPTY_REQUIRED_SECTION':
            return `${count} required section${plural} missing or empty`;
        default:
            return `${count} ${code} issue${plural}`;
    }
}
/**
 * Group issues by code
 *
 * @param issues - Validation issues
 * @returns Issues grouped by code
 */
function groupIssuesByCode(issues) {
    const grouped = {};
    for (const issue of issues) {
        if (!grouped[issue.code]) {
            grouped[issue.code] = [];
        }
        grouped[issue.code].push(issue);
    }
    return grouped;
}
/**
 * Find latest date from web sources
 *
 * @param webSources - Web sources
 * @returns Latest date or null
 */
function findLatestSourceDate(webSources) {
    let latest = null;
    for (const _source of webSources) {
        // Try to extract date from source
        // For now, we don't have publishedAt in AssistantSource type
        // This is a placeholder for future enhancement
    }
    return latest;
}
/**
 * Format date for display
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Build data freshness note
 *
 * @param webSources - Web sources used
 * @param recencyMonths - Recency requirement in months
 * @returns Freshness note or empty string
 */
export function buildFreshnessNote(webSources, recencyMonths = 9) {
    if (webSources.length === 0) {
        return '';
    }
    const latest = findLatestSourceDate(webSources);
    if (!latest) {
        return '**Data Freshness**: Source dates vary; verify currency of market data.';
    }
    const monthsAgo = getMonthsAgo(latest);
    if (monthsAgo > recencyMonths) {
        return `**Data Freshness**: Latest source is ${monthsAgo} months old. Market conditions may have changed.`;
    }
    return `**Data Freshness**: Market data current as of ${formatDate(latest)}.`;
}
/**
 * Get months ago from date
 *
 * @param date - Date to compare
 * @returns Months ago
 */
function getMonthsAgo(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
    return Math.floor(diffMonths);
}
//# sourceMappingURL=disclaimers.js.map