/**
 * Logo Templates Library
 * Pre-built logo templates organized by category
 * Phase 3: Feature 3 - Templates
 */

import type { LogoSpec } from '@kimuntupro/shared';

export interface LogoTemplate {
  id: string;
  name: string;
  category: 'wordmark' | 'lettermark' | 'icon' | 'combination';
  description: string;
  spec: LogoSpec;
}

/**
 * All available logo templates
 */
export const LOGO_TEMPLATES: LogoTemplate[] = [
  // ===== WORDMARK TEMPLATES =====
  {
    id: 'modern-wordmark',
    name: 'Modern Wordmark',
    category: 'wordmark',
    description: 'Clean, bold typography with letter spacing',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [],
      texts: [
        {
          content: 'COMPANY',
          x: 250,
          y: 260,
          fontSize: 48,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'middle',
          letterSpacing: 8,
        },
      ],
      metadata: {
        conceptName: 'Modern Wordmark',
        description: 'Clean, bold typography',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'serif-elegant',
    name: 'Serif Elegant',
    category: 'wordmark',
    description: 'Sophisticated serif typography',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [],
      texts: [
        {
          content: 'Company',
          x: 250,
          y: 260,
          fontSize: 56,
          fontFamily: 'Georgia',
          fontWeight: 'bold',
          fill: '#1a1a1a',
          textAnchor: 'middle',
          letterSpacing: 2,
        },
      ],
      metadata: {
        conceptName: 'Serif Elegant',
        description: 'Sophisticated serif typography',
        generatedAt: new Date(),
      },
    },
  },

  // ===== LETTERMARK TEMPLATES =====
  {
    id: 'circle-monogram',
    name: 'Circle Monogram',
    category: 'lettermark',
    description: 'Letter in circular badge',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'circle',
          cx: 250,
          cy: 250,
          r: 120,
          fill: '#000000',
        },
      ],
      texts: [
        {
          content: 'C',
          x: 250,
          y: 290,
          fontSize: 120,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          textAnchor: 'middle',
        },
      ],
      metadata: {
        conceptName: 'Circle Monogram',
        description: 'Letter in circle badge',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'square-initial',
    name: 'Square Initial',
    category: 'lettermark',
    description: 'Letter in rounded square',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'rectangle',
          x: 130,
          y: 130,
          width: 240,
          height: 240,
          rx: 30,
          fill: '#2563eb',
        },
      ],
      texts: [
        {
          content: 'C',
          x: 250,
          y: 300,
          fontSize: 140,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          textAnchor: 'middle',
        },
      ],
      metadata: {
        conceptName: 'Square Initial',
        description: 'Letter in rounded square',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'hexagon-letter',
    name: 'Hexagon Letter',
    category: 'lettermark',
    description: 'Letter in hexagonal shape',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'polygon',
          points: '250,100 370,175 370,325 250,400 130,325 130,175',
          fill: '#10b981',
        },
      ],
      texts: [
        {
          content: 'C',
          x: 250,
          y: 290,
          fontSize: 120,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          textAnchor: 'middle',
        },
      ],
      metadata: {
        conceptName: 'Hexagon Letter',
        description: 'Letter in hexagonal shape',
        generatedAt: new Date(),
      },
    },
  },

  // ===== ICON TEMPLATES =====
  {
    id: 'abstract-circles',
    name: 'Abstract Circles',
    category: 'icon',
    description: 'Overlapping circles design',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'circle',
          cx: 200,
          cy: 250,
          r: 80,
          fill: '#3b82f6',
        },
        {
          type: 'circle',
          cx: 300,
          cy: 250,
          r: 80,
          fill: '#8b5cf6',
        },
      ],
      texts: [],
      metadata: {
        conceptName: 'Abstract Circles',
        description: 'Overlapping circles design',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'geometric-triangle',
    name: 'Geometric Triangle',
    category: 'icon',
    description: 'Modern triangle composition',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'polygon',
          points: '250,120 380,350 120,350',
          fill: '#f59e0b',
        },
        {
          type: 'polygon',
          points: '250,180 320,320 180,320',
          fill: '#FFFFFF',
        },
      ],
      texts: [],
      metadata: {
        conceptName: 'Geometric Triangle',
        description: 'Modern triangle composition',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'minimal-square',
    name: 'Minimal Square',
    category: 'icon',
    description: 'Minimalist square with accent',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'rectangle',
          x: 150,
          y: 150,
          width: 200,
          height: 200,
          rx: 20,
          fill: '#000000',
        },
        {
          type: 'rectangle',
          x: 320,
          y: 150,
          width: 30,
          height: 200,
          rx: 5,
          fill: '#ef4444',
        },
      ],
      texts: [],
      metadata: {
        conceptName: 'Minimal Square',
        description: 'Minimalist square with accent',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'arc-design',
    name: 'Arc Design',
    category: 'icon',
    description: 'Curved arc element',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'path',
          d: 'M 150 250 Q 250 100 350 250',
          fill: 'none',
          stroke: '#06b6d4',
          strokeWidth: 30,
        },
        {
          type: 'circle',
          cx: 350,
          cy: 250,
          r: 20,
          fill: '#06b6d4',
        },
      ],
      texts: [],
      metadata: {
        conceptName: 'Arc Design',
        description: 'Curved arc element',
        generatedAt: new Date(),
      },
    },
  },

  // ===== COMBINATION TEMPLATES =====
  {
    id: 'icon-text-horizontal',
    name: 'Icon + Text (Horizontal)',
    category: 'combination',
    description: 'Icon with text beside it',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'circle',
          cx: 160,
          cy: 250,
          r: 50,
          fill: '#8b5cf6',
        },
      ],
      texts: [
        {
          content: 'COMPANY',
          x: 250,
          y: 265,
          fontSize: 40,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'start',
          letterSpacing: 4,
        },
      ],
      metadata: {
        conceptName: 'Icon + Text (Horizontal)',
        description: 'Icon with text beside it',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'icon-text-stacked',
    name: 'Icon + Text (Stacked)',
    category: 'combination',
    description: 'Icon above company name',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'polygon',
          points: '250,150 300,200 250,250 200,200',
          fill: '#10b981',
        },
      ],
      texts: [
        {
          content: 'COMPANY',
          x: 250,
          y: 330,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'middle',
          letterSpacing: 6,
        },
      ],
      metadata: {
        conceptName: 'Icon + Text (Stacked)',
        description: 'Icon above company name',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'badge-style',
    name: 'Badge Style',
    category: 'combination',
    description: 'Badge with text and border',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'path',
          d: 'M 250 120 A 130 130 0 1 1 249.99 120',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 4,
        },
        {
          type: 'path',
          d: 'M 250 140 A 110 110 0 1 1 249.99 140',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 2,
        },
      ],
      texts: [
        {
          content: 'COMPANY',
          x: 250,
          y: 260,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'middle',
          letterSpacing: 4,
        },
      ],
      metadata: {
        conceptName: 'Badge Style',
        description: 'Badge with text and border',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'underline-accent',
    name: 'Underline Accent',
    category: 'combination',
    description: 'Text with decorative underline',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'rectangle',
          x: 140,
          y: 280,
          width: 220,
          height: 8,
          rx: 4,
          fill: '#f59e0b',
        },
      ],
      texts: [
        {
          content: 'COMPANY',
          x: 250,
          y: 265,
          fontSize: 44,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'middle',
          letterSpacing: 5,
        },
      ],
      metadata: {
        conceptName: 'Underline Accent',
        description: 'Text with decorative underline',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'split-design',
    name: 'Split Design',
    category: 'combination',
    description: 'Half color, half text',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'rectangle',
          x: 100,
          y: 180,
          width: 140,
          height: 140,
          rx: 15,
          fill: '#ec4899',
        },
      ],
      texts: [
        {
          content: 'COMPANY',
          x: 280,
          y: 265,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'start',
          letterSpacing: 3,
        },
      ],
      metadata: {
        conceptName: 'Split Design',
        description: 'Half color, half text',
        generatedAt: new Date(),
      },
    },
  },
  {
    id: 'layered-shapes',
    name: 'Layered Shapes',
    category: 'combination',
    description: 'Overlapping shapes with text',
    spec: {
      version: '1.0',
      canvas: { width: 500, height: 500, backgroundColor: '#FFFFFF' },
      shapes: [
        {
          type: 'rectangle',
          x: 120,
          y: 200,
          width: 100,
          height: 100,
          rx: 10,
          fill: '#3b82f6',
        },
        {
          type: 'rectangle',
          x: 150,
          y: 230,
          width: 100,
          height: 100,
          rx: 10,
          fill: '#8b5cf6',
        },
      ],
      texts: [
        {
          content: 'COMPANY',
          x: 280,
          y: 270,
          fontSize: 38,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#000000',
          textAnchor: 'start',
          letterSpacing: 4,
        },
      ],
      metadata: {
        conceptName: 'Layered Shapes',
        description: 'Overlapping shapes with text',
        generatedAt: new Date(),
      },
    },
  },
];

/**
 * Template categories with metadata
 */
export const TEMPLATE_CATEGORIES = {
  wordmark: {
    name: 'Wordmark',
    description: 'Text-only logos focused on typography',
    templates: LOGO_TEMPLATES.filter((t) => t.category === 'wordmark'),
  },
  lettermark: {
    name: 'Lettermark',
    description: 'Single letter or initials in a shape',
    templates: LOGO_TEMPLATES.filter((t) => t.category === 'lettermark'),
  },
  icon: {
    name: 'Icon',
    description: 'Symbol or graphic mark without text',
    templates: LOGO_TEMPLATES.filter((t) => t.category === 'icon'),
  },
  combination: {
    name: 'Combination',
    description: 'Icon and text combined together',
    templates: LOGO_TEMPLATES.filter((t) => t.category === 'combination'),
  },
};

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): LogoTemplate | undefined {
  return LOGO_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: 'wordmark' | 'lettermark' | 'icon' | 'combination'
): LogoTemplate[] {
  return LOGO_TEMPLATES.filter((t) => t.category === category);
}
