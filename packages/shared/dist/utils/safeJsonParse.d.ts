/**
 * Safe JSON parsing with type-safe error handling
 */
export type ParseSuccess<T> = {
    ok: true;
    value: T;
};
export type ParseError = {
    ok: false;
    error: string;
};
export type ParseResult<T> = ParseSuccess<T> | ParseError;
/**
 * Safely parse JSON string with error handling
 * @param json - JSON string to parse
 * @returns ParseResult with ok: true and value, or ok: false and error
 */
export declare function safeJsonParse<T = unknown>(json: string): ParseResult<T>;
/**
 * Safely stringify value to JSON with error handling
 * @param value - Value to stringify
 * @param pretty - Pretty print with indentation
 * @returns ParseResult with ok: true and value (JSON string), or ok: false and error
 */
export declare function safeJsonStringify(value: unknown, pretty?: boolean): ParseResult<string>;
//# sourceMappingURL=safeJsonParse.d.ts.map