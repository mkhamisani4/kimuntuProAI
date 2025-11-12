/**
 * Structured Output Helpers
 * Utilities for JSON schema response format and validation
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
/**
 * Convert Zod schema to OpenAI JSON schema response format
 * @param zodSchema - Zod schema to convert
 * @param name - Schema name (used by OpenAI)
 * @param description - Optional schema description
 * @returns OpenAI response format object
 */
export function asJsonSchema(zodSchema, name, description) {
    const jsonSchema = zodToJsonSchema(zodSchema, {
        name,
        $refStrategy: 'none', // Inline all refs for OpenAI
    });
    // Remove $schema property as OpenAI doesn't accept it
    const { $schema, ...schemaWithoutMeta } = jsonSchema;
    return {
        response_format: {
            type: 'json_schema',
            json_schema: {
                name,
                description,
                schema: schemaWithoutMeta,
                strict: true, // Enable strict mode for better reliability
            },
        },
    };
}
/**
 * Parse and validate structured output from LLM
 * @param rawOutput - Raw string or object from LLM
 * @param zodSchema - Zod schema for validation
 * @returns Validated typed data
 * @throws Error if parsing or validation fails
 */
export function parseStructured(rawOutput, zodSchema) {
    // Parse JSON if string
    let data;
    if (typeof rawOutput === 'string') {
        try {
            data = JSON.parse(rawOutput);
        }
        catch (error) {
            throw new Error(`Failed to parse JSON from LLM output: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    else {
        data = rawOutput;
    }
    // Validate with Zod
    try {
        return zodSchema.parse(data);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.errors
                .map((err) => `${err.path.join('.')}: ${err.message}`)
                .join('; ');
            throw new Error(`Structured output validation failed: ${issues}`);
        }
        throw error;
    }
}
/**
 * Safe parse structured output (doesn't throw)
 * @param rawOutput - Raw string or object from LLM
 * @param zodSchema - Zod schema for validation
 * @returns Success or error result
 */
export function safeParseStructured(rawOutput, zodSchema) {
    try {
        const data = parseStructured(rawOutput, zodSchema);
        return { success: true, data };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * Extract JSON from markdown code blocks
 * Handles cases where LLM wraps JSON in ```json ... ```
 * @param text - Text that might contain JSON in code blocks
 * @returns Extracted JSON string or original text
 */
export function extractJsonFromMarkdown(text) {
    // Try to extract from code block
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    // Return original text
    return text.trim();
}
/**
 * Create a simple JSON schema for OpenAI (without Zod)
 * Useful for simple schemas where Zod might be overkill
 * @param schema - JSON schema object
 * @param name - Schema name
 * @param description - Optional description
 * @returns OpenAI response format
 */
export function createJsonSchema(schema, name, description) {
    return {
        response_format: {
            type: 'json_schema',
            json_schema: {
                name,
                description,
                schema,
                strict: true,
            },
        },
    };
}
//# sourceMappingURL=structured.js.map