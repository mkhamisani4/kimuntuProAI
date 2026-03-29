/**
 * Finance Tool Spec for chatWithTools() Integration
 * Provides ToolSpec and handler for deterministic financial calculations
 */
import type { ToolSpec, ToolHandler } from '../llm/client.js';
/**
 * Build finance calculation ToolSpec for use with chatWithTools()
 * @returns ToolSpec and handler
 */
export declare function buildFinanceToolSpec(): {
    spec: ToolSpec;
    handler: ToolHandler;
};
/**
 * Build finance tool for use with OpenAI client
 * Convenience function that returns just the tool array
 * @returns Array with finance tool spec
 */
export declare function buildFinanceTools(): ToolSpec[];
/**
 * Get finance tool handler
 * @returns Handler function
 */
export declare function getFinanceToolHandler(): ToolHandler;
//# sourceMappingURL=financeTool.d.ts.map