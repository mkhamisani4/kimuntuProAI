/**
 * ID generation utilities
 * Uses timestamp + random for request IDs
 */
/**
 * Generate a unique request ID
 * Format: req_<timestamp>_<random>
 */
export declare function generateRequestId(): string;
/**
 * Generate a unique session ID
 * Format: sess_<timestamp>_<random>
 */
export declare function generateSessionId(): string;
/**
 * Generate a short random ID
 * @param length - Length of random string (default: 8)
 */
export declare function generateShortId(length?: number): string;
/**
 * Validate request ID format
 */
export declare function isValidRequestId(id: string): boolean;
/**
 * Validate session ID format
 */
export declare function isValidSessionId(id: string): boolean;
//# sourceMappingURL=id.d.ts.map