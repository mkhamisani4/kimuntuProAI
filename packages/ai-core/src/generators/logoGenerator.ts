/**
 * AI Logo Generator
 * Uses Claude Sonnet 4.5 to generate logo design briefs and SVG specs
 * DECISIONS: System fonts only, simple paths, fixed 500x500 canvas
 */

import { ClaudeClient } from '../llm/claudeClient.js';
import type { LogoDesignBrief, LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';

/**
 * Calculate bounding box of all logo elements
 */
function calculateBoundingBox(spec: LogoSpec): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Calculate bounds from shapes
  spec.shapes.forEach((shape: LogoShape) => {
    switch (shape.type) {
      case 'rectangle':
        minX = Math.min(minX, shape.x);
        maxX = Math.max(maxX, shape.x + shape.width);
        minY = Math.min(minY, shape.y);
        maxY = Math.max(maxY, shape.y + shape.height);
        break;
      case 'circle':
        minX = Math.min(minX, shape.cx - shape.r);
        maxX = Math.max(maxX, shape.cx + shape.r);
        minY = Math.min(minY, shape.cy - shape.r);
        maxY = Math.max(maxY, shape.cy + shape.r);
        break;
      case 'ellipse':
        minX = Math.min(minX, shape.cx - shape.rx);
        maxX = Math.max(maxX, shape.cx + shape.rx);
        minY = Math.min(minY, shape.cy - shape.ry);
        maxY = Math.max(maxY, shape.cy + shape.ry);
        break;
      case 'line':
        minX = Math.min(minX, shape.x1, shape.x2);
        maxX = Math.max(maxX, shape.x1, shape.x2);
        minY = Math.min(minY, shape.y1, shape.y2);
        maxY = Math.max(maxY, shape.y1, shape.y2);
        break;
      case 'polygon':
        // Parse polygon points "x1,y1 x2,y2 x3,y3"
        const points = shape.points.split(/\s+/).map((p) => p.split(',').map(Number));
        points.forEach(([x, y]) => {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });
        break;
      case 'path':
        // Simplified: extract numeric values from path d attribute
        const numbers = shape.d.match(/-?\d+\.?\d*/g)?.map(Number) || [];
        for (let i = 0; i < numbers.length; i += 2) {
          if (numbers[i] !== undefined) minX = Math.min(minX, numbers[i]);
          if (numbers[i] !== undefined) maxX = Math.max(maxX, numbers[i]);
          if (numbers[i + 1] !== undefined) minY = Math.min(minY, numbers[i + 1]);
          if (numbers[i + 1] !== undefined) maxY = Math.max(maxY, numbers[i + 1]);
        }
        break;
    }
  });

  // Calculate bounds from text (approximate)
  spec.texts.forEach((text: LogoText) => {
    const estimatedWidth = text.content.length * text.fontSize * 0.6;
    const textX = text.textAnchor === 'middle' ? text.x - estimatedWidth / 2 : text.x;
    minX = Math.min(minX, textX);
    maxX = Math.max(maxX, textX + estimatedWidth);
    minY = Math.min(minY, text.y - text.fontSize);
    maxY = Math.max(maxY, text.y);
  });

  // Handle edge case where no elements exist
  if (!isFinite(minX)) minX = 0;
  if (!isFinite(maxX)) maxX = 500;
  if (!isFinite(minY)) minY = 0;
  if (!isFinite(maxY)) maxY = 500;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Scale logo to fill target percentage of canvas
 * Ensures logo never exceeds canvas bounds
 */
function scaleLogoToFillCanvas(spec: LogoSpec, targetFillPercentage: number = 0.90): LogoSpec {
  const bbox = calculateBoundingBox(spec);
  const canvasSize = spec.canvas.width; // Assuming square canvas
  const canvasCenter = canvasSize / 2;
  const minPadding = 10; // Minimum padding from canvas edges

  // Calculate how much to scale
  const targetSize = canvasSize * targetFillPercentage;
  const currentSize = Math.max(bbox.width, bbox.height);
  let scaleFactor = targetSize / currentSize;

  // Only scale up if logo is too small (< 50% of target)
  if (scaleFactor <= 1.5) {
    // Check if current logo exceeds bounds
    const maxAllowedSize = canvasSize - (2 * minPadding);
    if (currentSize > maxAllowedSize) {
      // Scale down to fit within bounds
      scaleFactor = maxAllowedSize / currentSize;
    } else {
      return spec; // Logo is already reasonably sized and within bounds
    }
  }

  // Scale and translate shapes
  const scaledShapes = spec.shapes.map((shape: LogoShape) => {
    switch (shape.type) {
      case 'rectangle':
        return {
          ...shape,
          x: (shape.x - bbox.centerX) * scaleFactor + canvasCenter,
          y: (shape.y - bbox.centerY) * scaleFactor + canvasCenter,
          width: shape.width * scaleFactor,
          height: shape.height * scaleFactor,
        };
      case 'circle':
        return {
          ...shape,
          cx: (shape.cx - bbox.centerX) * scaleFactor + canvasCenter,
          cy: (shape.cy - bbox.centerY) * scaleFactor + canvasCenter,
          r: shape.r * scaleFactor,
        };
      case 'ellipse':
        return {
          ...shape,
          cx: (shape.cx - bbox.centerX) * scaleFactor + canvasCenter,
          cy: (shape.cy - bbox.centerY) * scaleFactor + canvasCenter,
          rx: shape.rx * scaleFactor,
          ry: shape.ry * scaleFactor,
        };
      case 'line':
        return {
          ...shape,
          x1: (shape.x1 - bbox.centerX) * scaleFactor + canvasCenter,
          y1: (shape.y1 - bbox.centerY) * scaleFactor + canvasCenter,
          x2: (shape.x2 - bbox.centerX) * scaleFactor + canvasCenter,
          y2: (shape.y2 - bbox.centerY) * scaleFactor + canvasCenter,
          strokeWidth: (shape.strokeWidth || 1) * scaleFactor,
        };
      case 'polygon':
        const points = shape.points.split(/\s+/).map((p) => {
          const [x, y] = p.split(',').map(Number);
          const newX = (x - bbox.centerX) * scaleFactor + canvasCenter;
          const newY = (y - bbox.centerY) * scaleFactor + canvasCenter;
          return `${newX},${newY}`;
        });
        return {
          ...shape,
          points: points.join(' '),
        };
      case 'path':
        // Scale path by adjusting all numeric values
        const scaledD = shape.d.replace(/-?\d+\.?\d*/g, (match) => {
          const num = parseFloat(match);
          // This is simplified - proper path scaling would need to distinguish x from y coords
          return String((num - bbox.centerX) * scaleFactor + canvasCenter);
        });
        return {
          ...shape,
          d: scaledD,
          strokeWidth: shape.strokeWidth ? shape.strokeWidth * scaleFactor : undefined,
        };
      default:
        return shape;
    }
  });

  // Scale text
  const scaledTexts = spec.texts.map((text: LogoText) => ({
    ...text,
    x: (text.x - bbox.centerX) * scaleFactor + canvasCenter,
    y: (text.y - bbox.centerY) * scaleFactor + canvasCenter,
    fontSize: Math.round(text.fontSize * scaleFactor),
    letterSpacing: text.letterSpacing ? text.letterSpacing * scaleFactor : undefined,
  }));

  const scaledSpec = {
    ...spec,
    shapes: scaledShapes,
    texts: scaledTexts,
  };

  // Final bounds check - ensure nothing exceeds canvas
  const scaledBbox = calculateBoundingBox(scaledSpec);
  const maxAllowedSize = canvasSize - (2 * minPadding);

  if (scaledBbox.minX < minPadding || scaledBbox.maxX > (canvasSize - minPadding) ||
      scaledBbox.minY < minPadding || scaledBbox.maxY > (canvasSize - minPadding)) {
    console.warn('[LogoGenerator] Scaled logo exceeds bounds, applying corrective scaling');

    // Calculate how much we need to scale down to fit within bounds
    const widthRatio = maxAllowedSize / scaledBbox.width;
    const heightRatio = maxAllowedSize / scaledBbox.height;
    const correctionFactor = Math.min(widthRatio, heightRatio);

    // Apply correction factor recursively
    return scaleLogoToFillCanvas(scaledSpec, correctionFactor * 0.95); // 0.95 for safety margin
  }

  return scaledSpec;
}

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
- Text should be readable (fontSize 24+ for company names, 16+ for taglines)

SIZING GUIDELINES (IMPORTANT - Logos must be BOLD and fill the canvas):
- Logos should fill 85-95% of the 500x500 canvas - think "BILLBOARD" not "business card"
- Main icon/graphic elements: 300-420px in their largest dimension
- Company name text (wordmarks): 64-96pt font size
- Lettermarks: 350-450px tall, centered with 25-50px minimal padding from edges
- Icons in combination marks: 220-300px, positioned prominently
- Leave only 25-50px minimal padding from canvas edges
- Scale elements UP AGGRESSIVELY to be eye-catching, bold, and commanding
- Make logos LARGE and PROMINENT - fill the space!

CRITICAL BOUNDS REQUIREMENT:
- ALL elements MUST stay within the 500x500 canvas (0,0 to 500,500)
- NO element can have coordinates < 10 or > 490
- Text baselines must account for font size (y position + fontSize must be < 490)
- Check all shape coordinates, circle centers, path points - EVERYTHING must be inside bounds

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
  const concepts = parsed.concepts.map((c: any) => {
    const spec = {
      ...c,
      metadata: {
        ...c.metadata,
        generatedAt: new Date(c.metadata.generatedAt),
      },
    } as LogoSpec;

    // Apply auto-scaling to ensure logos fill canvas
    return scaleLogoToFillCanvas(spec, 0.90);
  });

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
- Logos should fill 85-95% of canvas (be BOLD, LARGE, and COMMANDING - not timid!)
- CRITICAL: ALL elements MUST stay within canvas bounds (10 < coordinates < 490)

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

  const concepts = parsed.concepts.map((c: any) => {
    const spec = {
      ...c,
      metadata: {
        ...c.metadata,
        generatedAt: new Date(c.metadata.generatedAt),
      },
    } as LogoSpec;

    // Apply auto-scaling to ensure logos fill canvas
    return scaleLogoToFillCanvas(spec, 0.90);
  });

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
- Logos should fill 85-95% of canvas (be BOLD, LARGE, and eye-catching!)
- CRITICAL: ALL elements MUST stay within canvas bounds (10 < coordinates < 490)

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

  const concepts = parsed.concepts.map((c: any) => {
    const spec = {
      ...c,
      metadata: {
        ...c.metadata,
        generatedAt: new Date(c.metadata.generatedAt),
      },
    } as LogoSpec;

    // Apply auto-scaling to ensure logos fill canvas
    return scaleLogoToFillCanvas(spec, 0.90);
  });

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
