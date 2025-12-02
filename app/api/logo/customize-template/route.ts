/**
 * POST /api/logo/customize-template
 * Customizes a logo template with company name and brand colors using AI
 * Phase 3: Feature 3 - Templates
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import type { LogoSpec } from '@kimuntupro/shared';

interface CustomizeTemplateRequest {
  tenantId: string;
  userId: string;
  templateSpec: LogoSpec;
  companyName: string;
  brandColors?: string[]; // Optional brand colors to apply
}

async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CustomizeTemplateRequest = await req.json();
    const { tenantId, userId, templateSpec, companyName, brandColors } = body;

    // Validation
    if (!tenantId || !userId || !templateSpec || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, userId, templateSpec, companyName' },
        { status: 400 }
      );
    }

    // Get API key from server environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[Customize Template] ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error: API key not set' },
        { status: 500 }
      );
    }

    console.log('[Customize Template] Customizing template for company:', companyName);

    const anthropic = new Anthropic({ apiKey });

    // Build the customization prompt
    const prompt = `You are a logo design AI. Customize this logo template for the company "${companyName}".

**Template Spec (JSON):**
${JSON.stringify(templateSpec, null, 2)}

**Instructions:**
1. Replace any placeholder text (like "COMPANY", "Company", "C") with "${companyName}" or appropriate initials
2. ${brandColors && brandColors.length > 0 ? `Use these brand colors: ${brandColors.join(', ')}. Replace existing colors in the template with these brand colors in a tasteful way.` : 'Adjust colors to create a professional color scheme that fits the company name and industry.'}
3. Maintain the overall design structure and composition
4. Ensure text fits well (adjust font size if company name is very long)
5. Keep the design balanced and professional

**Output Format:**
Return ONLY a valid JSON object with this structure:
{
  "customizedSpec": <LogoSpec object>,
  "changes": "Brief description of what was customized"
}

Do not include any markdown formatting, code blocks, or explanatory text. Return only the raw JSON object.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Customize Template] Raw AI response:', responseText.substring(0, 200));

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('[Customize Template] Failed to parse AI response:', parseError);
      console.error('[Customize Template] Response was:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI customization response' },
        { status: 500 }
      );
    }

    const { customizedSpec, changes } = parsedResponse;

    if (!customizedSpec) {
      console.error('[Customize Template] No customizedSpec in response');
      return NextResponse.json(
        { error: 'Invalid customization response from AI' },
        { status: 500 }
      );
    }

    console.log('[Customize Template] Customization complete:', changes);

    // Calculate usage metrics
    const tokensIn = message.usage.input_tokens;
    const tokensOut = message.usage.output_tokens;
    // Claude Sonnet 4.5 pricing: $3/MTok input, $15/MTok output
    const costCents = Math.round(
      (tokensIn * 3 / 1_000_000 + tokensOut * 15 / 1_000_000) * 100
    );

    // Record usage to database
    await logRequestUsage({
      tenantId,
      userId,
      assistant: null,
      model: 'claude-sonnet-4-5-20250929',
      tokensIn,
      tokensOut,
      costCents,
      latencyMs: 0,
      toolInvocations: {},
    });

    return NextResponse.json({
      success: true,
      customizedSpec,
      changes,
      metadata: {
        originalTemplate: templateSpec.metadata.conceptName,
        customizedFor: companyName,
        timestamp: new Date().toISOString(),
        tokensUsed: tokensIn + tokensOut,
        costCents,
      },
    });
  } catch (error: any) {
    console.error('[Customize Template] Error:', error);
    return NextResponse.json(
      { error: 'customization_failed', message: error.message },
      { status: 500 }
    );
  }
}

// Apply quota guard: use executor quota (same as other logo operations)
export const POST = withQuotaGuard(handler, { for: 'executor' });
