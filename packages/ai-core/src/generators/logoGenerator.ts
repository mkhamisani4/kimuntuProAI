/**
 * AI Logo Generator
 * Uses Claude Sonnet 4.5 to generate logo design briefs and SVG specs
 * DECISIONS: System fonts only, simple paths, fixed 500x500 canvas
 */

import { ClaudeClient } from '../llm/claudeClient.js';
import type { LogoDesignBrief, LogoSpec } from '@kimuntupro/shared';

interface GenerateBriefOptions {
  apiKey: string;
  companyName: string;
  businessContext?: string;
}

interface GenerateBriefResult {
  brief: LogoDesignBrief;
  metadata: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
  };
}

/**
 * Generate logo design brief from business context
 */
export async function generateLogoBrief(
  options: GenerateBriefOptions
): Promise<GenerateBriefResult> {
  const { apiKey, companyName, businessContext } = options;

  const systemPrompt = `You are a professional brand strategist and logo designer. Analyze the provided business information and create a comprehensive logo design brief.

CRITICAL: Return ONLY valid, parseable JSON. Use DOUBLE QUOTES for all property names and string values. No trailing commas.

Return JSON matching this exact schema:
{
  "brandAdjectives": ["adjective1", "adjective2", "adjective3"],
  "brandPersonality": "Brief description of brand personality",
  "logoType": "wordmark" | "lettermark" | "icon" | "combination",
  "iconConcepts": ["concept1", "concept2"],
  "colorPalette": {
    "primary": "#HEXCODE",
    "secondary": "#HEXCODE",
    "accent": "#HEXCODE",
    "text": "#HEXCODE"
  },
  "fontSuggestions": {
    "heading": "Arial" | "Times New Roman" | "Courier New" | "Helvetica" | "Georgia" | "Verdana" | "Tahoma" | "Trebuchet MS",
    "tagline": "Arial" | ... (optional)
  },
  "rationale": "Why these design choices fit the business"
}

IMPORTANT CONSTRAINTS:
- Use ONLY these system fonts: Arial, Times New Roman, Courier New, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- Choose 3-5 brand adjectives that capture the company's essence
- logoType must be one of: wordmark, lettermark, icon, combination
- Suggest 2-3 icon concepts if applicable (skip for pure wordmarks)
- All colors must be hex codes (#RRGGBB format)
- Keep rationale concise (1-2 sentences)

Guidelines:
- Wordmark: Company name as stylized text (e.g., Google, Coca-Cola)
- Lettermark: Initials/monogram (e.g., IBM, HP)
- Icon: Symbol/graphic (e.g., Apple, Twitter bird)
- Combination: Icon + text (e.g., Burger King, Adidas)`;

  const userPrompt = `Company Name: ${companyName}

Business Context: ${businessContext || 'No additional context provided. Infer from company name.'}

Generate a logo design brief for this company. Return ONLY the JSON object, no markdown or explanation.`;

  const claude = new ClaudeClient({
    apiKey,
    maxTokens: 2000,
    temperature: 0.7,
  });

  const response = await claude.complete({
    systemPrompt,
    userPrompt,
  });

  // Parse and validate brief (extract JSON from response)
  let jsonText = response.text.trim();

  // Remove markdown code fences if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Try to extract JSON if there's text before/after
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  // Attempt to parse JSON with better error handling
  let brief: LogoDesignBrief;
  try {
    brief = JSON.parse(jsonText) as LogoDesignBrief;
  } catch (parseError: any) {
    console.error('[Logo Brief] Raw Claude response:', response.text);
    console.error('[Logo Brief] Cleaned JSON text:', jsonText);
    console.error('[Logo Brief] Parse error:', parseError.message);

    // Try to fix common JSON issues
    try {
      let fixedJson = jsonText
        .replace(/'/g, '"')
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');

      brief = JSON.parse(fixedJson) as LogoDesignBrief;
      console.log('[Logo Brief] Successfully parsed after fixes');
    } catch (retryError) {
      throw new Error(
        `Failed to parse logo brief JSON: ${parseError.message}. Claude may have generated invalid JSON. Check server logs for raw response.`
      );
    }
  }

  return {
    brief,
    metadata: {
      model: response.model,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      tokensUsed: response.tokensIn + response.tokensOut,
      latencyMs: response.latencyMs,
      costCents: response.costCents,
    },
  };
}

interface GenerateConceptsOptions {
  apiKey: string;
  brief: LogoDesignBrief;
  companyName: string;
  numConcepts: number; // 1-3
}

interface GenerateConceptsResult {
  concepts: LogoSpec[];
  metadata: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
  };
}

/**
 * Generate 2-3 logo concepts from design brief
 * DECISION: Keep paths simple, fixed 500x500 canvas
 */
export async function generateLogoConcepts(
  options: GenerateConceptsOptions
): Promise<GenerateConceptsResult> {
  const { apiKey, brief, companyName, numConcepts } = options;

  const systemPrompt = `You are an expert logo designer. Create ${numConcepts} different logo concepts as SVG specifications using ONLY simple primitives.

ALLOWED PRIMITIVES:
- rectangle: { type: "rectangle", x, y, width, height, fill, rx? }
- circle: { type: "circle", cx, cy, r, fill }
- ellipse: { type: "ellipse", cx, cy, rx, ry, fill }
- line: { type: "line", x1, y1, x2, y2, stroke, strokeWidth }
- polygon: { type: "polygon", points: "x1,y1 x2,y2 x3,y3", fill }
- path: { type: "path", d: "M x y L x y ...", fill, stroke?, strokeWidth? } (KEEP SIMPLE - basic lines/curves only)
- text: { content, x, y, fontSize, fontFamily, fontWeight, fill, textAnchor?, letterSpacing? }

CONSTRAINTS:
- Canvas size: FIXED 500x500
- Fonts: ONLY Arial, Times New Roman, Courier New, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- Colors: Use the provided color palette
- Simplicity: 3-7 shapes max per concept (logos must be simple and scalable)
- Each concept must be visually distinct
- Position elements within 500x500 canvas (center logos for best appearance)
- Text should be readable (fontSize 24+ for company names, 16+ for taglines)

CRITICAL: Return ONLY valid, parseable JSON. Use DOUBLE QUOTES for all property names and string values.

Return JSON matching this exact schema:
{
  "concepts": [
    {
      "version": "1.0",
      "canvas": { "width": 500, "height": 500, "backgroundColor": "#FFFFFF" or "transparent" },
      "shapes": [ /* array of shape objects */ ],
      "texts": [ /* array of text objects */ ],
      "metadata": {
        "conceptName": "Concept 1: Descriptive Name",
        "description": "Brief description of this concept",
        "generatedAt": "2025-01-19T..." (use current ISO date)
      }
    },
    // ... ${numConcepts - 1} more concept(s)
  ]
}

Design Principles:
- Balance negative space
- Ensure legibility at small sizes (50x50)
- Use the color palette strategically (primary for main elements, accent sparingly)
- Align elements to create visual harmony
- Each concept should explore a different visual approach`;

  const userPrompt = `Company Name: ${companyName}

Logo Type: ${brief.logoType}
Brand Adjectives: ${brief.brandAdjectives.join(', ')}
Icon Concepts: ${brief.iconConcepts.join(', ')}
Color Palette:
  - Primary: ${brief.colorPalette.primary}
  - Secondary: ${brief.colorPalette.secondary}
  - Accent: ${brief.colorPalette.accent}
  - Text: ${brief.colorPalette.text}
Font Suggestions: ${brief.fontSuggestions.heading}${brief.fontSuggestions.tagline ? ` / ${brief.fontSuggestions.tagline}` : ''}

Create ${numConcepts} logo concept(s) as JSON LogoSpec objects. Return ONLY the JSON, no markdown.`;

  const claude = new ClaudeClient({
    apiKey,
    maxTokens: 8000, // Allow more tokens for multiple concepts
    temperature: 0.7,
  });

  const response = await claude.complete({
    systemPrompt,
    userPrompt,
  });

  // Parse and validate concepts (extract JSON from response)
  let jsonText = response.text.trim();

  // Remove markdown code fences if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Try to extract JSON if there's text before/after
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  // Attempt to parse JSON with better error handling
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (parseError: any) {
    console.error('[Logo Spec] Raw Claude response:', response.text);
    console.error('[Logo Spec] Cleaned JSON text:', jsonText);
    console.error('[Logo Spec] Parse error:', parseError.message);

    // Try to fix common JSON issues
    try {
      // Replace single quotes with double quotes (common LLM mistake)
      let fixedJson = jsonText
        .replace(/'/g, '"')
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' '); // Normalize whitespace

      parsed = JSON.parse(fixedJson);
      console.log('[Logo Spec] Successfully parsed after fixes');
    } catch (retryError) {
      throw new Error(
        `Failed to parse logo concepts JSON: ${parseError.message}. Claude may have generated invalid JSON. Check server logs for raw response.`
      );
    }
  }
  const concepts = parsed.concepts.map((c: any) => ({
    ...c,
    metadata: {
      ...c.metadata,
      generatedAt: new Date(c.metadata.generatedAt),
    },
  })) as LogoSpec[];

  return {
    concepts,
    metadata: {
      model: response.model,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      tokensUsed: response.tokensIn + response.tokensOut,
      latencyMs: response.latencyMs,
      costCents: response.costCents,
    },
  };
}

/**
 * Refine Logo with User Feedback
 * Takes current logo spec and user feedback to create an improved version
 */
export interface RefineLogoOptions {
  apiKey: string;
  currentSpec: LogoSpec;
  feedback: string;
  companyName: string;
}

export async function refineLogo(options: RefineLogoOptions): Promise<GenerateConceptsResult> {
  const { apiKey, currentSpec, feedback, companyName } = options;

  const systemPrompt = `You are an expert logo designer. Refine the provided logo based on user feedback.

ALLOWED PRIMITIVES:
- rectangle, circle, ellipse, line, polygon, path (simple paths only)
- text elements with system fonts only

CONSTRAINTS:
- Canvas size: FIXED 500x500
- Fonts: ONLY Arial, Times New Roman, Courier New, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- Keep the overall concept recognizable
- Apply user feedback thoughtfully
- Maintain visual balance

CRITICAL: Return ONLY valid, parseable JSON. Use DOUBLE QUOTES for all property names and string values.

Return JSON matching this exact schema:
{
  "concepts": [
    {
      "version": "1.0",
      "canvas": { "width": 500, "height": 500, "backgroundColor": "#FFFFFF" or "transparent" },
      "shapes": [ /* array of shape objects */ ],
      "texts": [ /* array of text objects */ ],
      "metadata": {
        "conceptName": "Refined Version",
        "description": "Brief description of changes made",
        "generatedAt": "2025-01-20T..." (use current ISO date)
      }
    }
  ]
}`;

  const userPrompt = `Company Name: ${companyName}

Current Logo Specification:
${JSON.stringify(currentSpec, null, 2)}

User Feedback: ${feedback}

Please refine this logo based on the feedback. Return ONLY the JSON with the refined logo.`;

  const claude = new ClaudeClient({
    apiKey,
    maxTokens: 6000,
    temperature: 0.7,
  });

  const response = await claude.complete({
    systemPrompt,
    userPrompt,
  });

  // Parse response (same logic as generateLogoConcepts)
  let jsonText = response.text.trim();

  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```\s*$/, '');
  }

  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (parseError: any) {
    console.error('[Logo Refinement] Raw Claude response:', response.text);
    console.error('[Logo Refinement] Cleaned JSON text:', jsonText);
    console.error('[Logo Refinement] Parse error:', parseError.message);

    try {
      let fixedJson = jsonText
        .replace(/'/g, '"')
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');

      parsed = JSON.parse(fixedJson);
      console.log('[Logo Refinement] Successfully parsed after fixes');
    } catch (retryError) {
      throw new Error(
        `Failed to parse refined logo JSON: ${parseError.message}. Claude may have generated invalid JSON. Check server logs for raw response.`
      );
    }
  }

  const concepts = parsed.concepts.map((c: any) => ({
    ...c,
    metadata: {
      ...c.metadata,
      generatedAt: new Date(c.metadata.generatedAt),
    },
  })) as LogoSpec[];

  return {
    concepts,
    metadata: {
      model: response.model,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      tokensUsed: response.tokensIn + response.tokensOut,
      latencyMs: response.latencyMs,
      costCents: response.costCents,
    },
  };
}

/**
 * Generate Logo Variations
 * Creates 2-3 variations of the current logo (color swaps, layout tweaks)
 */
export interface GenerateVariationsOptions {
  apiKey: string;
  currentSpec: LogoSpec;
  companyName: string;
  numVariations?: number;
}

export async function generateLogoVariations(
  options: GenerateVariationsOptions
): Promise<GenerateConceptsResult> {
  const { apiKey, currentSpec, companyName, numVariations = 3 } = options;

  const systemPrompt = `You are an expert logo designer. Create ${numVariations} variations of the provided logo.

Variations should explore:
- Different color schemes (complementary, analogous, monochrome)
- Slight layout adjustments (spacing, sizing, positioning)
- Typography variations (different fonts, weights, sizes)

Keep the core concept recognizable but offer fresh takes.

ALLOWED PRIMITIVES:
- rectangle, circle, ellipse, line, polygon, path (simple paths only)
- text elements with system fonts only

CONSTRAINTS:
- Canvas size: FIXED 500x500
- Fonts: ONLY Arial, Times New Roman, Courier New, Helvetica, Georgia, Verdana, Tahoma, Trebuchet MS
- Each variation must be visually distinct
- Maintain brand consistency

CRITICAL: Return ONLY valid, parseable JSON. Use DOUBLE QUOTES for all property names and string values.

Return JSON matching this exact schema:
{
  "concepts": [
    {
      "version": "1.0",
      "canvas": { "width": 500, "height": 500, "backgroundColor": "#FFFFFF" or "transparent" },
      "shapes": [ /* array of shape objects */ ],
      "texts": [ /* array of text objects */ ],
      "metadata": {
        "conceptName": "Variation 1: Color Scheme",
        "description": "Brief description of what changed",
        "generatedAt": "2025-01-20T..."
      }
    },
    // ... ${numVariations - 1} more variation(s)
  ]
}`;

  const userPrompt = `Company Name: ${companyName}

Original Logo Specification:
${JSON.stringify(currentSpec, null, 2)}

Create ${numVariations} variations of this logo. Return ONLY the JSON with the variations.`;

  const claude = new ClaudeClient({
    apiKey,
    maxTokens: 8000,
    temperature: 0.8, // Higher temperature for more creativity
  });

  const response = await claude.complete({
    systemPrompt,
    userPrompt,
  });

  // Parse response (same logic as generateLogoConcepts)
  let jsonText = response.text.trim();

  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```\s*$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```\s*$/, '');
  }

  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (parseError: any) {
    console.error('[Logo Variations] Raw Claude response:', response.text);
    console.error('[Logo Variations] Cleaned JSON text:', jsonText);
    console.error('[Logo Variations] Parse error:', parseError.message);

    try {
      let fixedJson = jsonText
        .replace(/'/g, '"')
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');

      parsed = JSON.parse(fixedJson);
      console.log('[Logo Variations] Successfully parsed after fixes');
    } catch (retryError) {
      throw new Error(
        `Failed to parse logo variations JSON: ${parseError.message}. Claude may have generated invalid JSON. Check server logs for raw response.`
      );
    }
  }

  const concepts = parsed.concepts.map((c: any) => ({
    ...c,
    metadata: {
      ...c.metadata,
      generatedAt: new Date(c.metadata.generatedAt),
    },
  })) as LogoSpec[];

  return {
    concepts,
    metadata: {
      model: response.model,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      tokensUsed: response.tokensIn + response.tokensOut,
      latencyMs: response.latencyMs,
      costCents: response.costCents,
    },
  };
}
