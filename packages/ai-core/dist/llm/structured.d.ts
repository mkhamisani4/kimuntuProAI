/**
 * Structured Output Helpers
 * Utilities for JSON schema response format and validation
 */
import { z } from 'zod';
/**
 * OpenAI response format for structured outputs
 */
export interface StructuredOutputFormat {
    type: 'json_schema';
    json_schema: {
        name: string;
        description?: string;
        schema: Record<string, any>;
        strict?: boolean;
    };
}
/**
 * Convert Zod schema to OpenAI JSON schema response format
 * @param zodSchema - Zod schema to convert
 * @param name - Schema name (used by OpenAI)
 * @param description - Optional schema description
 * @returns OpenAI response format object
 */
export declare function asJsonSchema<T extends z.ZodType>(zodSchema: T, name: string, description?: string): {
    response_format: StructuredOutputFormat;
};
/**
 * Parse and validate structured output from LLM
 * @param rawOutput - Raw string or object from LLM
 * @param zodSchema - Zod schema for validation
 * @returns Validated typed data
 * @throws Error if parsing or validation fails
 */
export declare function parseStructured<T>(rawOutput: string | object, zodSchema: z.ZodType<T>): T;
/**
 * Safe parse structured output (doesn't throw)
 * @param rawOutput - Raw string or object from LLM
 * @param zodSchema - Zod schema for validation
 * @returns Success or error result
 */
export declare function safeParseStructured<T>(rawOutput: string | object, zodSchema: z.ZodType<T>): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};
/**
 * Extract JSON from markdown code blocks
 * Handles cases where LLM wraps JSON in ```json ... ```
 * @param text - Text that might contain JSON in code blocks
 * @returns Extracted JSON string or original text
 */
export declare function extractJsonFromMarkdown(text: string): string;
/**
 * Create a simple JSON schema for OpenAI (without Zod)
 * Useful for simple schemas where Zod might be overkill
 * @param schema - JSON schema object
 * @param name - Schema name
 * @param description - Optional description
 * @returns OpenAI response format
 */
export declare function createJsonSchema(schema: Record<string, any>, name: string, description?: string): {
    response_format: StructuredOutputFormat;
};
//# sourceMappingURL=structured.d.ts.map