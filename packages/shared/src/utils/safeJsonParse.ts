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
export function safeJsonParse<T = unknown>(json: string): ParseResult<T> {
  try {
    const value = JSON.parse(json) as T;
    return { ok: true, value };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `JSON parse failed: ${message}` };
  }
}

/**
 * Safely stringify value to JSON with error handling
 * @param value - Value to stringify
 * @param pretty - Pretty print with indentation
 * @returns ParseResult with ok: true and value (JSON string), or ok: false and error
 */
export function safeJsonStringify(value: unknown, pretty = false): ParseResult<string> {
  try {
    const json = JSON.stringify(value, null, pretty ? 2 : 0);
    return { ok: true, value: json };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `JSON stringify failed: ${message}` };
  }
}
