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
2. **Modern & Professional** - Clean design following current web design trends (think Apple, Stripe, Linear)
3. **Fully Responsive** - Mobile-first design that works perfectly on all screen sizes
4. **Accessible** - Proper semantic HTML, ARIA labels, keyboard navigation
5. **Performance Optimized** - Minimal dependencies, fast loading
6. **SEO-Friendly** - Proper meta tags, semantic structure, meaningful content

**Design Guidelines:**
- Use modern CSS with flexbox/grid layouts and clean spacing
- Implement smooth animations and transitions (fade-ins on scroll, hover effects)
- Include a sticky navigation bar with smooth scroll behavior
- Use a professional color scheme (1-2 primary colors + neutrals)
- Add subtle hover effects and visual feedback on interactive elements
- Use web-safe fonts or system fonts (e.g., -apple-system, BlinkMacSystemFont)
- Ensure high contrast for readability (WCAG AA minimum)
- Include generous whitespace and clear visual hierarchy
- Add tasteful gradients or background patterns where appropriate

**Content Guidelines:**
- Generate realistic, professional business content (avoid generic Lorem Ipsum)
- Use the provided brand voice and style consistently
- Make CTAs prominent, action-oriented, and specific (e.g., "Start Your Free Trial" not just "Submit")
- Include all requested sections with meaningful, relevant content
- Ensure consistency in tone, terminology, and messaging across sections
- For testimonials: Create 3-4 realistic testimonials with names, titles, and companies
- For FAQs: Generate 4-6 common questions with detailed, helpful answers
- For features/services: Highlight benefits (not just features), use icons/emojis for visual appeal

**Technical Requirements:**
- No external dependencies (no CDNs, no frameworks, no external fonts)
- Inline all CSS in a <style> tag in the <head>
- Use minimal vanilla JavaScript only for smooth scrolling and mobile menu toggle
- Include proper DOCTYPE, meta viewport, and meta description
- Add semantic HTML5 tags (header, nav, main, section, article, footer)
- Add comments explaining major sections
- Use CSS custom properties (variables) for colors and spacing
- Implement a mobile-friendly hamburger menu if navigation has >4 items

**Section-Specific Best Practices:**
- Hero: Large headline, supporting text, prominent CTA, optional background image/gradient
- Features/Services: Grid layout (2-3 columns), icons/emojis, benefit-focused copy
- About: Company story, mission/vision, team photo placeholder or gradient
- Testimonials: Cards with quotes, names, titles, 5-star ratings
- FAQs: Accordion-style with smooth expand/collapse animations
- Contact: Form with validation, contact details, optional map placeholder
- Footer: Links, social icons, copyright, privacy/terms links

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

    // Prioritize most relevant sections for website generation
    const prioritySections = [
      'Executive Summary',
      'Value Proposition',
      'Market Analysis',
      'Products & Services',
      'Marketing Strategy',
      'Company Overview',
      'Mission & Vision'
    ];

    // Extract prioritized sections
    const relevantSections: string[] = [];
    for (const sectionName of prioritySections) {
      const content = businessPlan.sections[sectionName];
      if (content && typeof content === 'string') {
        // Limit each section to 800 chars to fit more relevant content
        relevantSections.push(`${sectionName}:\n${content.substring(0, 800)}`);
      }
    }

    // If no priority sections found, fall back to first sections
    if (relevantSections.length === 0) {
      const allEntries = Object.entries(businessPlan.sections);
      relevantSections.push(
        ...allEntries.slice(0, 3).map(([title, content]) =>
          `${title}:\n${typeof content === 'string' ? content.substring(0, 800) : String(content).substring(0, 800)}`
        )
      );
    }

    const planText = relevantSections.join('\n\n');

    console.log('[WebsiteGenerator] Including business plan in prompt:', {
      totalSections: Object.keys(businessPlan.sections).length,
      includedSections: relevantSections.length,
      planTextLength: planText.length,
      preview: planText.substring(0, 300)
    });

    // Limit total size to 3500 chars for better token efficiency
    sections.push(planText.substring(0, 3500));
    sections.push(`\`\`\``);
    sections.push(`\nIMPORTANT: If any wizard field below is missing or marked as "ai_choose" or "ai_fill", intelligently fill it using relevant information from the business plan above. Generate realistic, professional content that aligns with the business plan's tone, industry, and value proposition.\n`);
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

  if (input.tagline) {
    if (input.tagline === 'ai_fill') {
      sections.push(`Tagline: AI FILL - Generate a compelling tagline from the business plan`);
    } else {
      sections.push(`Tagline: ${input.tagline}`);
    }
  }

  if (input.brandVoice) {
    if (input.brandVoice === 'ai_choose') {
      sections.push(`Brand Voice: AI CHOOSE - Select appropriate brand voice from the business plan`);
    } else {
      sections.push(`Brand Voice: ${input.brandVoice}`);
    }
  }
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
  if (input.keyServices) {
    if (input.keyServices === 'ai_fill') {
      sections.push(`\n## Key Services`);
      sections.push(`AI FILL - Generate 3-6 key services from the business plan`);
    } else if (Array.isArray(input.keyServices) && input.keyServices.length > 0) {
      sections.push(`\n## Key Services`);
      input.keyServices.forEach((service, i) => {
        sections.push(`${i + 1}. ${service}`);
      });
    }
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
      if (input.mainGoal === 'ai_choose') {
        sections.push(`Main Goal: [AI will choose based on business plan]`);
      } else {
        sections.push(`Main Goal: ${goalDescriptions[input.mainGoal]}`);
      }
    }
  }

  // Sections to Include
  sections.push(`\n## Sections to Include`);

  if (input.sectionsMode === 'ai_choose') {
    sections.push(`[AI CHOOSE SECTIONS] - Intelligently select the most appropriate sections based on the business plan. Available options: Features, Services, About Us, Testimonials, Pricing, FAQ, Contact. Choose 3-5 sections that best showcase this business. Consider:`);
    sections.push(`- Business type and industry (e.g., SaaS may need Pricing, service businesses may need Testimonials)`);
    sections.push(`- Main goal (e.g., if goal is "buy", include Pricing; if "contact", include Contact form)`);
    sections.push(`- Target audience and value proposition from the business plan`);
    sections.push(`- Create a logical flow that guides visitors toward the main conversion goal`);
  } else {
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
    } else {
      sections.push(`- No specific sections requested. Include basic sections: About, Services, Contact`);
    }
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
    if (input.layoutStyle === 'ai_choose') {
      sections.push('[AI will choose based on business plan]');
    } else {
      sections.push(styleDescriptions[input.layoutStyle] || input.layoutStyle);
    }
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

  sections.push(`\n## CRITICAL REQUIREMENTS - MUST FOLLOW`);
  sections.push(`1. **Completeness**: Generate COMPLETE, THOROUGH content for EVERY section listed above. Do NOT create partial or placeholder content.`);
  sections.push(`2. **AI FILL/CHOOSE Fields**: When a field says "AI FILL" or "AI CHOOSE", generate FULL, DETAILED, PROFESSIONAL content for that field. Do NOT skip or abbreviate.`);
  sections.push(`3. **Section Requirements**:`);
  sections.push(`   - Hero: Minimum 40 words headline + subheadline combined`);
  sections.push(`   - Features: Minimum 3-6 feature items, each with 30+ words description`);
  sections.push(`   - Services: Minimum 3-6 services, each with 40+ words description`);
  sections.push(`   - About: Minimum 150 words of company story and mission`);
  sections.push(`   - Testimonials: Exactly 3-4 testimonials, each 30-50 words`);
  sections.push(`   - FAQ: Minimum 5-6 Q&A pairs, each answer 30-60 words`);
  sections.push(`   - Contact: Full form with email, phone, location details`);
  sections.push(`   - Footer: Complete footer with copyright and navigation links`);
  sections.push(`4. **Content Quality**: All content must be realistic, professional, and specific to the business. NO generic placeholders.`);
  sections.push(`5. **HTML Completeness**: The HTML must be a COMPLETE, SELF-CONTAINED website with all sections fully implemented.`);
  sections.push(`6. **MANDATORY COMPLETION**: You MUST generate the complete closing tags for ALL sections including About, Testimonials, FAQ, Contact, and Footer. The HTML must end with proper </body></html> tags after all content is complete.`);
  sections.push(`\nDo NOT generate partial content. Do NOT skip sections. Do NOT stop early. Every enabled section above MUST be thoroughly completed in the HTML output with all opening and closing tags properly matched.`);

  return sections.join('\n');
}

/**
 * Extract company name from generated HTML
 * Parses title tag or logo text to get AI-chosen company name
 */
function extractCompanyNameFromHTML(html: string, originalInput: string): string {
  // If original input wasn't 'ai_choose', return it
  if (originalInput !== 'ai_choose') {
    return originalInput || 'My Business';
  }

  // Try to extract from title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    // Remove common suffixes like " - Website", " Website", " | Home" etc.
    const cleanTitle = titleMatch[1]
      .replace(/\s*(-|–|—|\|)\s*(Website|Home|Official Site).*$/i, '')
      .trim();
    if (cleanTitle && cleanTitle !== 'My Business') {
      return cleanTitle;
    }
  }

  // Try to extract from logo/nav (look for class="logo")
  const logoMatch = html.match(/<[^>]*class="logo"[^>]*>([^<]+)</i);
  if (logoMatch && logoMatch[1]) {
    const cleanLogo = logoMatch[1].trim();
    if (cleanLogo && cleanLogo !== 'My Business') {
      return cleanLogo;
    }
  }

  // Fallback
  return 'My Business';
}

/**
 * Extract site spec from generated HTML
 * Creates a simplified SiteSpec for storage
 */
function extractSiteSpec(input: WizardInput, generatedHTML?: string): SiteSpec {
  // Extract actual company name from generated HTML if ai_choose was used
  const actualCompanyName = generatedHTML
    ? extractCompanyNameFromHTML(generatedHTML, input.companyName || '')
    : (input.companyName || 'My Business');

  // Parse basic metadata from input
  const spec: SiteSpec = {
    meta: {
      title: `${actualCompanyName} Website`,
      description: input.shortDescription || `Professional website for ${actualCompanyName}`,
    },
    branding: {
      companyName: actualCompanyName,
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

  // Initialize Claude client with maximum token limit for complete websites
  const claude = new ClaudeClient({
    apiKey: options.apiKey,
    maxTokens: options.maxTokens || 64000, // Set to 64K (absolute maximum for Claude Sonnet 4.5) to prevent any truncation
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

  // Create site spec (pass generated HTML to extract AI-chosen company name)
  const siteSpec = extractSiteSpec(wizardInput, siteCode);

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

/**
 * Build system prompt for website editing
 */
function buildEditSystemPrompt(): string {
  return `You are an expert web designer and developer specializing in editing and improving existing websites.

Your task is to apply specific edits to an existing HTML website while preserving everything not mentioned in the instruction.

**Editing Guidelines:**
1. **Precision** - Only change what's explicitly requested in the instruction
2. **Preservation** - Keep all existing styles, structure, and content unless modification is requested
3. **Consistency** - Match the existing design language, color scheme, and typography
4. **Quality** - Maintain or improve code quality, accessibility, and responsiveness
5. **Completeness** - Return the ENTIRE updated HTML file, not just the changed parts

**Important:**
- If asked to change text, only update that specific text
- If asked to change colors, update the color scheme consistently throughout
- If asked to add a section, place it logically and style it to match existing sections
- If asked to remove something, cleanly remove it without breaking the layout
- Preserve all meta tags, scripts, and structural elements unless specifically asked to change them

Generate ONLY the complete updated HTML code. Do not include any explanations, markdown formatting, or code fences. Start directly with <!DOCTYPE html>.`;
}

/**
 * Build user prompt for website editing
 */
function buildEditUserPrompt(instruction: string, currentSiteCode: string, currentSiteSpec: SiteSpec): string {
  const sections: string[] = [];

  sections.push(`# Website Editing Instruction\n`);
  sections.push(`**User Request:** ${instruction}\n`);

  sections.push(`## Current Website Information`);
  sections.push(`Company: ${currentSiteSpec.branding.companyName}`);
  sections.push(`Tagline: ${currentSiteSpec.branding.tagline || 'None'}`);
  sections.push(`Brand Voice: ${currentSiteSpec.branding.brandVoice}`);

  sections.push(`\n## Current HTML Code`);
  sections.push('```html');
  sections.push(currentSiteCode);
  sections.push('```');

  sections.push(`\n## Instructions`);
  sections.push(`Apply the requested changes to the website above. Return the complete updated HTML file.`);

  return sections.join('\n');
}

/**
 * Edit existing website with Claude
 */
export async function editWebsite(
  instruction: string,
  currentSiteCode: string,
  currentSiteSpec: SiteSpec,
  options: {
    apiKey?: string;
    maxTokens?: number;
  } = {}
): Promise<WebsiteGenerationResult> {
  console.log('[WebsiteEditor] Starting edit with instruction:', instruction.substring(0, 100));

  // Initialize Claude client
  const claude = new ClaudeClient({
    apiKey: options.apiKey,
    maxTokens: options.maxTokens || 8000,
    temperature: 0.3, // Lower temperature for more precise edits
  });

  // Build prompts
  const systemPrompt = buildEditSystemPrompt();
  const userPrompt = buildEditUserPrompt(instruction, currentSiteCode, currentSiteSpec);

  console.log('[WebsiteEditor] Calling Claude Sonnet 4.5...');

  // Generate edited website
  const response: ClaudeResponse = await claude.complete({
    systemPrompt,
    userPrompt,
  });

  console.log('[WebsiteEditor] Edit complete');

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

  // Keep the same siteSpec (editing doesn't change metadata structure)
  return {
    siteSpec: currentSiteSpec,
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
