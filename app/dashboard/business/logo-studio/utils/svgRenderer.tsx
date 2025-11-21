/**
 * SVG Renderer Utility
 * Converts LogoSpec JSON to React SVG elements
 */

import type { LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';

/**
 * Render a single shape element
 */
function renderShape(shape: LogoShape, index: number): JSX.Element {
  switch (shape.type) {
    case 'rectangle':
      return (
        <rect
          key={`shape-${index}`}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          rx={shape.rx}
        />
      );

    case 'circle':
      return (
        <circle
          key={`shape-${index}`}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={shape.fill}
        />
      );

    case 'ellipse':
      return (
        <ellipse
          key={`shape-${index}`}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={shape.fill}
        />
      );

    case 'line':
      return (
        <line
          key={`shape-${index}`}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );

    case 'polygon':
      return (
        <polygon
          key={`shape-${index}`}
          points={shape.points}
          fill={shape.fill}
        />
      );

    case 'path':
      return (
        <path
          key={`shape-${index}`}
          d={shape.d}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );

    default:
      console.warn('[SVG Renderer] Unknown shape type:', (shape as any).type);
      return <g key={`shape-${index}`} />;
  }
}

/**
 * Render a single text element
 */
function renderText(text: LogoText, index: number): JSX.Element {
  return (
    <text
      key={`text-${index}`}
      x={text.x}
      y={text.y}
      fontSize={text.fontSize}
      fontFamily={text.fontFamily}
      fontWeight={text.fontWeight}
      fill={text.fill}
      textAnchor={text.textAnchor}
      letterSpacing={text.letterSpacing}
    >
      {text.content}
    </text>
  );
}

/**
 * Render a complete LogoSpec as an SVG element
 * @param spec - The logo specification
 * @param className - Optional CSS class for the SVG element
 * @returns JSX.Element (SVG)
 */
export function renderLogoSpec(spec: LogoSpec, className?: string): JSX.Element {
  return (
    <svg
      width={spec.canvas.width}
      height={spec.canvas.height}
      viewBox={`0 0 ${spec.canvas.width} ${spec.canvas.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ backgroundColor: spec.canvas.backgroundColor }}
    >
      {/* Render shapes */}
      {spec.shapes.map((shape, index) => renderShape(shape, index))}

      {/* Render text */}
      {spec.texts.map((text, index) => renderText(text, index))}
    </svg>
  );
}

/**
 * Convert LogoSpec to SVG string (for saving as file)
 */
export function logoSpecToSVGString(spec: LogoSpec): string {
  const shapesHTML = spec.shapes
    .map((shape, index) => {
      switch (shape.type) {
        case 'rectangle':
          return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}"${shape.rx ? ` rx="${shape.rx}"` : ''} />`;
        case 'circle':
          return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}" />`;
        case 'ellipse':
          return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" />`;
        case 'line':
          return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />`;
        case 'polygon':
          return `<polygon points="${shape.points}" fill="${shape.fill}" />`;
        case 'path':
          return `<path d="${shape.d}" fill="${shape.fill}"${shape.stroke ? ` stroke="${shape.stroke}"` : ''}${shape.strokeWidth ? ` stroke-width="${shape.strokeWidth}"` : ''} />`;
        default:
          return '';
      }
    })
    .join('\n  ');

  const textsHTML = spec.texts
    .map(
      (text) =>
        `<text x="${text.x}" y="${text.y}" font-size="${text.fontSize}" font-family="${text.fontFamily}" font-weight="${text.fontWeight}" fill="${text.fill}"${text.textAnchor ? ` text-anchor="${text.textAnchor}"` : ''}${text.letterSpacing ? ` letter-spacing="${text.letterSpacing}"` : ''}>${text.content}</text>`
    )
    .join('\n  ');

  return `<svg width="${spec.canvas.width}" height="${spec.canvas.height}" viewBox="0 0 ${spec.canvas.width} ${spec.canvas.height}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${spec.canvas.backgroundColor}">
  ${shapesHTML}
  ${textsHTML}
</svg>`;
}
