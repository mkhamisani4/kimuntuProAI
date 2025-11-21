'use client';

/**
 * PropertiesPanel Component
 * Sidebar for editing logo elements
 * Phase 2: Editing & Export
 */

import { useState } from 'react';
import {
  Trash2,
  Square,
  Circle,
  Type,
  Palette,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react';
import type { LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';

interface PropertiesPanelProps {
  spec: LogoSpec | null;
  selectedElementId: string | null;
  onSelectElement: (elementId: string | null) => void;
  onUpdateShape: (index: number, updates: Partial<LogoShape>) => void;
  onUpdateText: (index: number, updates: Partial<LogoText>) => void;
  onUpdateCanvas: (updates: Partial<LogoSpec['canvas']>) => void;
  onDeleteElement: (type: 'shape' | 'text', index: number) => void;
  onBringToFront: (type: 'shape' | 'text', index: number) => void;
  onSendToBack: (type: 'shape' | 'text', index: number) => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export default function PropertiesPanel({
  spec,
  selectedElementId,
  onSelectElement,
  onUpdateShape,
  onUpdateText,
  onUpdateCanvas,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
  onAlign,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'canvas'>('elements');

  if (!spec) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-800 p-6">
        <p className="text-gray-500 text-sm">No logo loaded</p>
      </div>
    );
  }

  // Parse selected element
  const selectedType = selectedElementId?.startsWith('shape-')
    ? 'shape'
    : selectedElementId?.startsWith('text-')
    ? 'text'
    : null;
  const selectedIndex = selectedElementId
    ? parseInt(selectedElementId.split('-')[1], 10)
    : -1;

  const selectedShape =
    selectedType === 'shape' && selectedIndex >= 0 ? spec.shapes[selectedIndex] : null;
  const selectedText =
    selectedType === 'text' && selectedIndex >= 0 ? spec.texts[selectedIndex] : null;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'elements'
              ? 'text-white bg-gray-800 border-b-2 border-emerald-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'canvas'
              ? 'text-white bg-gray-800 border-b-2 border-emerald-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Canvas
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'elements' ? (
          <>
            {/* Element List */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Shapes ({spec.shapes.length})
              </h3>
              {spec.shapes.map((shape, index) => {
                // Get color from shape (fill for most shapes, stroke for lines)
                const shapeColor =
                  'fill' in shape
                    ? shape.fill
                    : 'stroke' in shape
                    ? shape.stroke
                    : '#000';

                return (
                  <button
                    key={`shape-${index}`}
                    onClick={() => onSelectElement(`shape-${index}`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedElementId === `shape-${index}`
                        ? 'bg-emerald-500/20 border border-emerald-500'
                        : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                    }`}
                  >
                    <Square className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white capitalize">{shape.type}</span>
                    <div
                      className="ml-auto w-6 h-6 rounded border border-gray-600"
                      style={{ backgroundColor: shapeColor }}
                    />
                  </button>
                );
              })}

              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">
                Text ({spec.texts.length})
              </h3>
              {spec.texts.map((text, index) => (
                <button
                  key={`text-${index}`}
                  onClick={() => onSelectElement(`text-${index}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedElementId === `text-${index}`
                      ? 'bg-emerald-500/20 border border-emerald-500'
                      : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                  }`}
                >
                  <Type className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white truncate">
                    {text.content.substring(0, 20)}
                  </span>
                </button>
              ))}

              {spec.shapes.length === 0 && spec.texts.length === 0 && (
                <p className="text-gray-500 text-sm">No elements</p>
              )}
            </div>

            {/* Element Properties */}
            {selectedShape && (
              <ShapeProperties
                shape={selectedShape}
                index={selectedIndex}
                onUpdate={onUpdateShape}
                onDelete={() => onDeleteElement('shape', selectedIndex)}
                onBringToFront={() => onBringToFront('shape', selectedIndex)}
                onSendToBack={() => onSendToBack('shape', selectedIndex)}
                onAlign={onAlign}
              />
            )}

            {selectedText && (
              <TextProperties
                text={selectedText}
                index={selectedIndex}
                onUpdate={onUpdateText}
                onDelete={() => onDeleteElement('text', selectedIndex)}
                onBringToFront={() => onBringToFront('text', selectedIndex)}
                onSendToBack={() => onSendToBack('text', selectedIndex)}
                onAlign={onAlign}
              />
            )}

            {!selectedShape && !selectedText && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">Select an element to edit</p>
              </div>
            )}
          </>
        ) : (
          <CanvasProperties canvas={spec.canvas} onUpdate={onUpdateCanvas} />
        )}
      </div>
    </div>
  );
}

/**
 * Shape Properties Editor
 */
interface ShapePropertiesProps {
  shape: LogoShape;
  index: number;
  onUpdate: (index: number, updates: Partial<LogoShape>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

function ShapeProperties({ shape, index, onUpdate, onDelete, onBringToFront, onSendToBack, onAlign }: ShapePropertiesProps) {
  return (
    <div className="space-y-4 border-t border-gray-800 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white capitalize">{shape.type} Properties</h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Delete shape"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Management */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Layer
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onBringToFront}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            title="Bring to front"
          >
            <ChevronUp className="w-4 h-4" />
            Front
          </button>
          <button
            onClick={onSendToBack}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            title="Send to back"
          >
            <ChevronDown className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Alignment
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAlign('left')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align left"
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('center')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align center"
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('right')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align right"
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('top')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align top"
          >
            <AlignVerticalJustifyStart className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('middle')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align middle"
          >
            <AlignVerticalJustifyCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('bottom')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align bottom"
          >
            <AlignVerticalJustifyEnd className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Common Properties */}
      {('fill' in shape) && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Fill Color</label>
          <input
            type="color"
            value={shape.fill}
            onChange={(e) => onUpdate(index, { fill: e.target.value } as any)}
            className="w-full h-10 rounded border border-gray-700 bg-gray-800 cursor-pointer"
          />
        </div>
      )}

      {/* Rectangle */}
      {shape.type === 'rectangle' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">X</label>
              <input
                type="number"
                value={shape.x}
                onChange={(e) =>
                  onUpdate(index, { x: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Y</label>
              <input
                type="number"
                value={shape.y}
                onChange={(e) =>
                  onUpdate(index, { y: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={shape.width}
                onChange={(e) =>
                  onUpdate(index, { width: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={shape.height}
                onChange={(e) =>
                  onUpdate(index, { height: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Border Radius
            </label>
            <input
              type="number"
              value={shape.rx || 0}
              onChange={(e) =>
                onUpdate(index, { rx: parseFloat(e.target.value) } as any)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
          </div>
        </>
      )}

      {/* Circle */}
      {shape.type === 'circle' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">CX</label>
              <input
                type="number"
                value={shape.cx}
                onChange={(e) =>
                  onUpdate(index, { cx: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">CY</label>
              <input
                type="number"
                value={shape.cy}
                onChange={(e) =>
                  onUpdate(index, { cy: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Radius</label>
            <input
              type="number"
              value={shape.r}
              onChange={(e) =>
                onUpdate(index, { r: parseFloat(e.target.value) } as any)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
          </div>
        </>
      )}

      {/* Ellipse */}
      {shape.type === 'ellipse' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">CX</label>
              <input
                type="number"
                value={shape.cx}
                onChange={(e) =>
                  onUpdate(index, { cx: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">CY</label>
              <input
                type="number"
                value={shape.cy}
                onChange={(e) =>
                  onUpdate(index, { cy: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">RX</label>
              <input
                type="number"
                value={shape.rx}
                onChange={(e) =>
                  onUpdate(index, { rx: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">RY</label>
              <input
                type="number"
                value={shape.ry}
                onChange={(e) =>
                  onUpdate(index, { ry: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
        </>
      )}

      {/* Line */}
      {shape.type === 'line' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">X1</label>
              <input
                type="number"
                value={shape.x1}
                onChange={(e) =>
                  onUpdate(index, { x1: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Y1</label>
              <input
                type="number"
                value={shape.y1}
                onChange={(e) =>
                  onUpdate(index, { y1: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">X2</label>
              <input
                type="number"
                value={shape.x2}
                onChange={(e) =>
                  onUpdate(index, { x2: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Y2</label>
              <input
                type="number"
                value={shape.y2}
                onChange={(e) =>
                  onUpdate(index, { y2: parseFloat(e.target.value) } as any)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Stroke Color</label>
            <input
              type="color"
              value={shape.stroke}
              onChange={(e) => onUpdate(index, { stroke: e.target.value } as any)}
              className="w-full h-10 rounded border border-gray-700 bg-gray-800 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Stroke Width
            </label>
            <input
              type="number"
              value={shape.strokeWidth}
              onChange={(e) =>
                onUpdate(index, { strokeWidth: parseFloat(e.target.value) } as any)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Text Properties Editor
 */
interface TextPropertiesProps {
  text: LogoText;
  index: number;
  onUpdate: (index: number, updates: Partial<LogoText>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

function TextProperties({ text, index, onUpdate, onDelete, onBringToFront, onSendToBack, onAlign }: TextPropertiesProps) {
  return (
    <div className="space-y-4 border-t border-gray-800 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Text Properties</h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Delete text"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Management */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Layer
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onBringToFront}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            title="Bring to front"
          >
            <ChevronUp className="w-4 h-4" />
            Front
          </button>
          <button
            onClick={onSendToBack}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            title="Send to back"
          >
            <ChevronDown className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Alignment
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAlign('left')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align left"
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('center')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align center"
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('right')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align right"
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('top')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align top"
          >
            <AlignVerticalJustifyStart className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('middle')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align middle"
          >
            <AlignVerticalJustifyCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onAlign('bottom')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            title="Align bottom"
          >
            <AlignVerticalJustifyEnd className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Content</label>
        <input
          type="text"
          value={text.content}
          onChange={(e) => onUpdate(index, { content: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">X</label>
          <input
            type="number"
            value={text.x}
            onChange={(e) => onUpdate(index, { x: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Y</label>
          <input
            type="number"
            value={text.y}
            onChange={(e) => onUpdate(index, { y: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Font Size</label>
        <input
          type="number"
          value={text.fontSize}
          onChange={(e) => onUpdate(index, { fontSize: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Font Family</label>
        <select
          value={text.fontFamily}
          onChange={(e) =>
            onUpdate(index, {
              fontFamily: e.target.value as LogoText['fontFamily'],
            })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Font Weight</label>
        <select
          value={text.fontWeight}
          onChange={(e) =>
            onUpdate(index, {
              fontWeight: e.target.value as LogoText['fontWeight'],
            })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="400">400</option>
          <option value="700">700</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Fill Color</label>
        <input
          type="color"
          value={text.fill}
          onChange={(e) => onUpdate(index, { fill: e.target.value })}
          className="w-full h-10 rounded border border-gray-700 bg-gray-800 cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Text Anchor</label>
        <select
          value={text.textAnchor || 'start'}
          onChange={(e) =>
            onUpdate(index, {
              textAnchor: e.target.value as LogoText['textAnchor'],
            })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          <option value="start">Start</option>
          <option value="middle">Middle</option>
          <option value="end">End</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Canvas Properties Editor
 */
interface CanvasPropertiesProps {
  canvas: LogoSpec['canvas'];
  onUpdate: (updates: Partial<LogoSpec['canvas']>) => void;
}

function CanvasProperties({ canvas, onUpdate }: CanvasPropertiesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Canvas Settings</h3>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Background Color
        </label>
        <input
          type="color"
          value={canvas.backgroundColor}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="w-full h-12 rounded border border-gray-700 bg-gray-800 cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">{canvas.backgroundColor}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Width</label>
          <input
            type="number"
            value={canvas.width}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-500 text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Height</label>
          <input
            type="number"
            value={canvas.height}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-500 text-sm cursor-not-allowed"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">Canvas size is fixed at 500×500px</p>
    </div>
  );
}
