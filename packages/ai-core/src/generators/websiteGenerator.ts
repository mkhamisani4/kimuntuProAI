/**
 * AI Website Generator
 * Uses Claude Sonnet 4.5 to generate complete HTML websites
 */

import { ClaudeClient, type ClaudeResponse } from '../llm/claudeClient.js';
import type { WizardInput, SiteSpec } from '@kimuntupro/shared';

/**
 * Website generation result
 */
export interface WebsiteGenerationResult {
  siteSpec: SiteSpec;
  siteCode: string;
  metadata: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    tokensUsed: number;
    latencyMs: number;
    costCents: number;
    generatedAt: Date;
  };
}

/**
 * Build system prompt for website generation
 */
function buildSystemPrompt(): string {
  return `You are an expert web designer and developer specializing in creating beautiful, modern, responsive business websites.

Your task is to generate a complete, production-ready HTML website based on the user's specifications. The website should be:

1. **Pure HTML/CSS/JavaScript** - Single self-contained HTML file with inline CSS and minimal vanilla JavaScript
2. **Modern & Professional** - Clean design following current web design trends
3. **Fully Responsive** - Mobile-first design that works perfectly on all screen sizes
4. **Accessible** - Proper semantic HTML, ARIA labels, keyboard navigation
5. **Performance Optimized** - Minimal dependencies, fast loading
6. **SEO-Friendly** - Proper meta tags, semantic structure, meaningful content

**Design Guidelines:**
- Use modern CSS with flexbox/grid layouts
- Implement smooth animations and transitions
- Include a sticky navigation bar
- Add hover effects and visual feedback
- Use web-safe fonts or system fonts
- Ensure high contrast for readability
- Include proper spacing and visual hierarchy

**Content Guidelines:**
- Generate realistic, professional business content
- Use the provided brand voice and style
- Make CTAs prominent and action-oriented
- Include all requested sections
- Ensure consistency across all sections

**Technical Requirements:**
- No external dependencies (no CDNs, no frameworks)
- Inline all CSS in a <style> tag in the <head>
- Use minimal vanilla JavaScript only if necessary
- Include proper DOCTYPE, meta tags, and structure
- Add comments explaining major sections

Generate ONLY the complete HTML code. Do not include any explanations, markdown formatting, or code fences. Start directly with <!DOCTYPE html>.`;
}

/**
 * Build user prompt from wizard input (with optional business plan)
 */
function buildUserPrompt(input: WizardInput, businessPlan?: any): string {
  const hasPlan = !!businessPlan;
  const sections: string[] = [];

  // Add business plan context if available
  if (hasPlan) {
    const firstSection = businessPlan.sections ? Object.values(businessPlan.sections)[0] : null;
    console.log('[WebsiteGenerator] Business plan received:', {
      hasSections: !!businessPlan.sections,
      sectionKeys: businessPlan.sections ? Object.keys(businessPlan.sections) : [],
      sampleContent: (typeof firstSection === 'string') ? firstSection.substring(0, 200) : 'none'
    });
  }

  if (hasPlan && businessPlan.sections) {
    sections.push(`## Business Plan Context`);
    sections.push(`Use the following business plan information to intelligently fill any missing details in the wizard inputs below:`);
    sections.push(`\`\`\``);

    // Extract all sections from business plan
    const planText = Object.entries(businessPlan.sections)
      .map(([title, content]) => `${title}:\n${content}`)
      .join('\n\n');

    console.log('[WebsiteGenerator] Including business plan in prompt:', {
      planTextLength: planText.length,
      preview: planText.substring(0, 300)
    });

    // Limit size to avoid token overflow
    sections.push(planText.substring(0, 4000));
    sections.push(`\`\`\``);
    sections.push(`\nIMPORTANT: If any wizard field below is missing or marked as "ai_choose", intelligently fill it using relevant information from the business plan above. Generate realistic, professional content that aligns with the business plan.\n`);
  } else if (hasPlan) {
    console.warn('[WebsiteGenerator] Business plan provided but no sections found!', businessPlan);
  }

  // Brand Information
  sections.push(`## Brand Information`);
  if (input.companyName === 'ai_choose') {
    sections.push(`Company Name: AI CHOOSE - Extract the company/business name from the business plan`);
  } else {
    sections.push(`Company Name: ${input.companyName || 'My Business'}`);
  }
  if (input.tagline) sections.push(`Tagline: ${input.tagline}`);
  if (input.brandVoice) sections.push(`Brand Voice: ${input.brandVoice}`);
  if (input.logoUrl) sections.push(`Logo: Include logo image at URL ${input.logoUrl}`);

  // Business Overview
  if (input.shortDescription || input.aboutUs || input.industry) {
    sections.push(`\n## Business Overview`);
    if (input.shortDescription === 'ai_fill') {
      sections.push(`Short Description: AI FILL - Generate a short description from the business plan`);
    } else if (input.shortDescription) {
      sections.push(`Short Description: ${input.shortDescription}`);
    }

    if (input.industry === 'ai_fill') {
      sections.push(`Industry: AI FILL - Identify the industry from the business plan`);
    } else if (input.industry) {
      sections.push(`Industry: ${input.industry}`);
    }

    if (input.aboutUs === 'ai_fill') {
      sections.push(`About Us: AI FILL - Generate an About Us section from the business plan`);
    } else if (input.aboutUs) {
      sections.push(`About Us: ${input.aboutUs}`);
    }
  }

  // Services
  if (input.keyServices && input.keyServices.length > 0) {
    sections.push(`\n## Key Services`);
    input.keyServices.forEach((service, i) => {
      sections.push(`${i + 1}. ${service}`);
    });
  }

  // Hero Section
  if (input.heroHeadline || input.heroSubheadline || input.primaryCtaText) {
    sections.push(`\n## Hero Section`);

    if (input.heroHeadline === 'ai_fill') {
      sections.push(`Headline: AI FILL - Generate a compelling hero headline from the business plan`);
    } else if (input.heroHeadline) {
      sections.push(`Headline: ${input.heroHeadline}`);
    }

    if (input.heroSubheadline === 'ai_fill') {
      sections.push(`Subheadline: AI FILL - Generate a supporting subheadline from the business plan`);
    } else if (input.heroSubheadline) {
      sections.push(`Subheadline: ${input.heroSubheadline}`);
    }

    if (input.primaryCtaText === 'ai_fill') {
      sections.push(`Primary CTA: AI FILL - Generate an action-oriented CTA button text from the business plan`);
    } else if (input.primaryCtaText) {
      sections.push(`Primary CTA: ${input.primaryCtaText}`);
    }

    if (input.mainGoal) {
      const goalDescriptions = {
        consult: 'Book a consultation',
        buy: 'Purchase product/service',
        signup: 'Sign up or register',
        contact: 'Contact us',
        learn_more: 'Learn more about the offering',
      };
      sections.push(`Main Goal: ${goalDescriptions[input.mainGoal]}`);
    }
  }

  // Sections to Include
  sections.push(`\n## Sections to Include`);
  const enabledSections = Object.entries(input.enabledSections)
    .filter(([_, enabled]) => enabled)
    .map(([section]) => section);

  if (enabledSections.length > 0) {
    enabledSections.forEach((section) => {
      const sectionNames: Record<string, string> = {
        features: 'Features/Benefits section',
        services: 'Services section (detailed)',
        about: 'About Us section',
        testimonials: 'Customer Testimonials section',
        pricing: 'Pricing section',
        faq: 'FAQ section',
        contact: 'Contact section with form',
      };
      sections.push(`- ${sectionNames[section] || section}`);
    });
  }

  // Layout Style
  if (input.layoutStyle) {
    sections.push(`\n## Layout Style`);
    const styleDescriptions = {
      minimal: 'Minimal - Clean, spacious, lots of whitespace',
      modern: 'Modern - Balanced, professional, grid-based',
      bold: 'Bold - Eye-catching, vibrant, impactful',
      playful: 'Playful - Fun, creative, unique shapes',
    };
    sections.push(styleDescriptions[input.layoutStyle] || input.layoutStyle);
  }

  // Contact Information
  if (input.contactEmail || input.contactPhone || input.location) {
    sections.push(`\n## Contact Information`);

    if (input.contactEmail === 'ai_fill') {
      sections.push(`Email: AI FILL - Generate a professional business email from the business plan`);
    } else if (input.contactEmail) {
      sections.push(`Email: ${input.contactEmail}`);
    }

    if (input.contactPhone === 'ai_fill') {
      sections.push(`Phone: AI FILL - Generate a business phone number from the business plan`);
    } else if (input.contactPhone) {
      sections.push(`Phone: ${input.contactPhone}`);
    }

    if (input.location === 'ai_fill') {
      sections.push(`Location: AI FILL - Generate a business location from the business plan`);
    } else if (input.location) {
      sections.push(`Location: ${input.location}`);
    }
  }

  // Social Media
  if (input.socialLinks) {
    const socialPlatforms = Object.entries(input.socialLinks).filter(([_, url]) => url);
    if (socialPlatforms.length > 0) {
      sections.push(`\n## Social Media`);
      socialPlatforms.forEach(([platform, url]) => {
        sections.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`);
      });
    }
  }

  // Visual Style
  if (input.colorTheme || input.fontStyle) {
    sections.push(`\n## Visual Style`);
    if (input.colorTheme) {
      if (input.colorTheme === 'ai_choose') {
        sections.push(`Color Theme: AI CHOOSE - Select colors that best match the business type and brand from the business plan`);
      } else {
        const themeDescriptions: Record<string, string> = {
          ocean: 'Ocean Blue - Blues and teals (#0EA5E9, #06B6D4)',
          forest: 'Forest Green - Greens (#10B981, #059669)',
          sunset: 'Sunset Orange - Oranges and reds (#F59E0B, #EF4444)',
          lavender: 'Lavender Purple - Purples (#A78BFA, #8B5CF6)',
          rose: 'Rose Pink - Pinks (#F472B6, #EC4899)',
          slate: 'Slate Gray - Grays (#64748B, #475569)',
        };
        sections.push(`Color Theme: ${themeDescriptions[input.colorTheme] || input.colorTheme}`);
      }
    }

    if (input.fontStyle) {
      if (input.fontStyle === 'ai_choose') {
        sections.push(`Font Style: AI CHOOSE - Select fonts that best match the business type and brand from the business plan`);
      } else {
        const fontDescriptions: Record<string, string> = {
          modern: 'Modern Sans - Inter, Helvetica, sans-serif',
          classic: 'Classic Serif - Georgia, Times New Roman, serif',
          tech: 'Tech Mono - Courier New, monospace',
          friendly: 'Friendly Rounded - system-ui, -apple-system, sans-serif',
        };
        sections.push(`Font Style: ${fontDescriptions[input.fontStyle] || input.fontStyle}`);
      }
    }
  }

  sections.push(`\n## Instructions`);
  sections.push(`Generate a complete, production-ready HTML website that incorporates all the above information. Make it visually stunning and professional.`);

  return sections.join('\n');
}

/**
 * Extract site spec from generated HTML
 * Creates a simplified SiteSpec for storage
 */
function extractSiteSpec(input: WizardInput): SiteSpec {
  // Parse basic metadata from input
  const spec: SiteSpec = {
    meta: {
      title: `${input.companyName || 'Business'} Website`,
      description: input.shortDescription || `Professional website for ${input.companyName || 'our business'}`,
    },
    branding: {
      companyName: input.companyName || 'My Business',
      tagline: input.tagline || '',
      logoUrl: input.logoUrl || null,
      brandVoice: input.brandVoice || 'professional',
    },
    hero: {
      headline: input.heroHeadline || `Welcome to ${input.companyName || 'Our Business'}`,
      subheadline: input.heroSubheadline || '',
      ctaText: input.primaryCtaText || 'Get Started',
      ctaAction: input.mainGoal || 'contact',
    },
    sections: [],
    contact: {
      email: input.contactEmail,
      phone: input.contactPhone,
      location: input.location,
    },
    social: input.socialLinks || {},
    styling: {
      colorPalette: {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      fontFamily: {
        heading: 'system-ui, -apple-system, sans-serif',
        body: 'system-ui, -apple-system, sans-serif',
      },
    },
  };

  // Add enabled sections
  let order = 0;
  Object.entries(input.enabledSections).forEach(([key, enabled]) => {
    if (enabled) {
      spec.sections.push({
        id: `section-${key}`,
        title: key.charAt(0).toUpperCase() + key.slice(1),
        content: {},
        order: order++,
      });
    }
  });

  return spec;
}

/**
 * Generate website with Claude
 */
export async function generateWebsite(
  wizardInput: WizardInput,
  options: {
    apiKey?: string;
    maxTokens?: number;
    businessPlan?: any;
  } = {}
): Promise<WebsiteGenerationResult> {
  const hasPlan = !!options.businessPlan;
  console.log('[WebsiteGenerator] Starting generation for:', wizardInput.companyName, hasPlan ? '(with business plan)' : '');

  // Initialize Claude client
  const claude = new ClaudeClient({
    apiKey: options.apiKey,
    maxTokens: options.maxTokens || 8000,
    temperature: 0.7,
  });

  // Build prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(wizardInput, options.businessPlan);

  console.log('[WebsiteGenerator] Calling Claude Sonnet 4.5...');

  // Generate website
  const response: ClaudeResponse = await claude.complete({
    systemPrompt,
    userPrompt,
  });

  console.log('[WebsiteGenerator] Generation complete');

  // Extract HTML
  let siteCode = response.text.trim();

  // Remove markdown code fences if present
  if (siteCode.startsWith('```html')) {
    siteCode = siteCode.replace(/^```html\n/, '').replace(/\n```$/, '');
  } else if (siteCode.startsWith('```')) {
    siteCode = siteCode.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  // Ensure DOCTYPE is present
  if (!siteCode.toLowerCase().includes('<!doctype html>')) {
    siteCode = '<!DOCTYPE html>\n' + siteCode;
  }

  // Create site spec
  const siteSpec = extractSiteSpec(wizardInput);

  return {
    siteSpec,
    siteCode,
    metadata: {
      model: response.model,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      tokensUsed: response.tokensIn + response.tokensOut,
      latencyMs: response.latencyMs,
      costCents: response.costCents,
      generatedAt: new Date(),
    },
  };
}
