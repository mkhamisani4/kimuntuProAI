/**
 * Shared TypeScript Types for KimuntuPro AI
 * Used across ai-core, Business Track UI, and API routes
 */
/**
 * Quota error (thrown when quota exceeded)
 */
export class QuotaError extends Error {
    resetsAtISO;
    currentUsage;
    constructor(message, resetsAtISO, currentUsage) {
        super(message);
        this.resetsAtISO = resetsAtISO;
        this.currentUsage = currentUsage;
        this.name = 'QuotaError';
    }
}
/**
 * Error codes
 */
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
    ErrorCode["FEATURE_DISABLED"] = "FEATURE_DISABLED";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["LLM_ERROR"] = "LLM_ERROR";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=types.js.map