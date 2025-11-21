/**
 * LogoCanvas Component
 * Phase 1: View-only display
 * Phase 2: Interactive editing with element selection
 */

import type { LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';
import { renderLogoSpec } from '../utils/svgRenderer';

interface LogoCanvasProps {
  spec: LogoSpec;
  className?: string;
  style?: React.CSSProperties;

  // Phase 2: Interactive editing props
  interactive?: boolean;
  selectedElementId?: string | null;
  onElementSelect?: (elementId: string | null) => void;

  // Phase 3: Grid display
  showGrid?: boolean;
  gridSize?: number;
}

/**
 * Render a shape with optional interactivity and selection highlight
 */
function renderInteractiveShape(
  shape: LogoShape,
  index: number,
  isSelected: boolean,
  onSelect?: (e: React.MouseEvent) => void
): JSX.Element {
  const key = `shape-${index}`;
  const commonProps = {
    cursor: onSelect ? 'pointer' : undefined,
    onClick: onSelect,
    // Highlight selected element with blue outline
    stroke: isSelected ? '#3B82F6' : shape.type === 'line' ? shape.stroke : undefined,
    strokeWidth: isSelected ? 3 : shape.type === 'line' ? shape.strokeWidth : undefined,
  };

  switch (shape.type) {
    case 'rectangle':
      return (
        <rect
          key={key}
          {...commonProps}
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
          key={key}
          {...commonProps}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={shape.fill}
        />
      );

    case 'ellipse':
      return (
        <ellipse
          key={key}
          {...commonProps}
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
          key={key}
          {...commonProps}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
        />
      );

    case 'polygon':
      return (
        <polygon
          key={key}
          {...commonProps}
          points={shape.points}
          fill={shape.fill}
        />
      );

    case 'path':
      return (
        <path
          key={key}
          {...commonProps}
          d={shape.d}
          fill={shape.fill}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? 3 : shape.strokeWidth}
        />
      );

    default:
      console.warn('[LogoCanvas] Unknown shape type:', (shape as any).type);
      return <g key={`shape-${index}`} />;
  }
}

/**
 * Render a text element with optional interactivity and selection highlight
 */
function renderInteractiveText(
  text: LogoText,
  index: number,
  isSelected: boolean,
  onSelect?: (e: React.MouseEvent) => void
): JSX.Element {
  return (
    <g key={`text-${index}`}>
      {/* Selection highlight background */}
      {isSelected && (
        <rect
          x={text.x - 5}
          y={text.y - text.fontSize}
          width={text.content.length * text.fontSize * 0.6 + 10}
          height={text.fontSize + 10}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}

      <text
        x={text.x}
        y={text.y}
        fontSize={text.fontSize}
        fontFamily={text.fontFamily}
        fontWeight={text.fontWeight}
        fill={text.fill}
        textAnchor={text.textAnchor}
        letterSpacing={text.letterSpacing}
        cursor={onSelect ? 'pointer' : undefined}
        onClick={onSelect}
      >
        {text.content}
      </text>
    </g>
  );
}

export default function LogoCanvas({
  spec,
  className,
  style,
  interactive = false,
  selectedElementId = null,
  onElementSelect,
  showGrid = false,
  gridSize = 25,
}: LogoCanvasProps) {
  // Phase 1: View-only mode (backwards compatible)
  if (!interactive) {
    return (
      <div className={className} style={style}>
        {renderLogoSpec(spec, 'w-full h-full')}
      </div>
    );
  }

  // Phase 2: Interactive editing mode
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If clicking on canvas background (not an element), deselect
    if (e.target === e.currentTarget && onElementSelect) {
      onElementSelect(null);
    }
  };

  return (
    <div className={className} style={style}>
      <svg
        width={spec.canvas.width}
        height={spec.canvas.height}
        viewBox={`0 0 ${spec.canvas.width} ${spec.canvas.height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ backgroundColor: spec.canvas.backgroundColor }}
        onClick={handleCanvasClick}
      >
        {/* Grid pattern definition */}
        {showGrid && (
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="rgba(100,100,100,0.2)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
        )}

        {/* Grid overlay */}
        {showGrid && <rect width="500" height="500" fill="url(#grid)" />}

        {/* Render shapes */}
        {spec.shapes.map((shape, index) => {
          const elementId = `shape-${index}`;
          const isSelected = selectedElementId === elementId;
          const handleSelect = onElementSelect
            ? (e: React.MouseEvent) => {
                e.stopPropagation();
                onElementSelect(elementId);
              }
            : undefined;

          return renderInteractiveShape(shape, index, isSelected, handleSelect);
        })}

        {/* Render text */}
        {spec.texts.map((text, index) => {
          const elementId = `text-${index}`;
          const isSelected = selectedElementId === elementId;
          const handleSelect = onElementSelect
            ? (e: React.MouseEvent) => {
                e.stopPropagation();
                onElementSelect(elementId);
              }
            : undefined;

          return renderInteractiveText(text, index, isSelected, handleSelect);
        })}
      </svg>
    </div>
  );
}
