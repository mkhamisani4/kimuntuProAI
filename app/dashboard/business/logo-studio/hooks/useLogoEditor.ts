'use client';

/**
 * useLogoEditor Hook
 * State management for logo editing with undo/redo support
 * Phase 2: Editing & Export
 */

import { useState, useCallback } from 'react';
import type { LogoSpec, LogoShape, LogoText } from '@kimuntupro/shared';

/**
 * Element ID format: "shape-0", "shape-1", "text-0", "text-1", etc.
 */
export type ElementId = string | null;

export interface UseLogoEditorReturn {
  // State
  currentSpec: LogoSpec | null;
  selectedElementId: ElementId;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  loadSpec: (spec: LogoSpec) => void;
  updateShape: (index: number, updates: Partial<LogoShape>) => void;
  updateText: (index: number, updates: Partial<LogoText>) => void;
  updateCanvas: (updates: Partial<LogoSpec['canvas']>) => void;
  deleteElement: (type: 'shape' | 'text', index: number) => void;
  setSelectedElementId: (id: ElementId) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;

  // Layer Management
  bringToFront: (type: 'shape' | 'text', index: number) => void;
  sendToBack: (type: 'shape' | 'text', index: number) => void;

  // Alignment
  alignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

const MAX_HISTORY_SIZE = 50;

/**
 * Logo editor hook with undo/redo support
 */
export function useLogoEditor(): UseLogoEditorReturn {
  const [currentSpec, setCurrentSpec] = useState<LogoSpec | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<ElementId>(null);

  // History stack for undo/redo
  const [history, setHistory] = useState<LogoSpec[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  /**
   * Add current spec to history and update spec
   */
  const updateWithHistory = useCallback(
    (newSpec: LogoSpec) => {
      setCurrentSpec(newSpec);

      // Add to history, removing any future states if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newSpec);

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      } else {
        setHistoryIndex((prev) => prev + 1);
      }

      setHistory(newHistory);
    },
    [history, historyIndex]
  );

  /**
   * Load a logo spec into the editor
   */
  const loadSpec = useCallback(
    (spec: LogoSpec) => {
      setCurrentSpec(spec);
      setSelectedElementId(null);
      setHistory([spec]);
      setHistoryIndex(0);
    },
    []
  );

  /**
   * Update a shape by index
   */
  const updateShape = useCallback(
    (index: number, updates: Partial<LogoShape>) => {
      if (!currentSpec) return;

      const newShapes = [...currentSpec.shapes];
      if (index < 0 || index >= newShapes.length) return;

      // Merge updates with existing shape
      newShapes[index] = { ...newShapes[index], ...updates } as LogoShape;

      updateWithHistory({
        ...currentSpec,
        shapes: newShapes,
      });
    },
    [currentSpec, updateWithHistory]
  );

  /**
   * Update a text element by index
   */
  const updateText = useCallback(
    (index: number, updates: Partial<LogoText>) => {
      if (!currentSpec) return;

      const newTexts = [...currentSpec.texts];
      if (index < 0 || index >= newTexts.length) return;

      // Merge updates with existing text
      newTexts[index] = { ...newTexts[index], ...updates };

      updateWithHistory({
        ...currentSpec,
        texts: newTexts,
      });
    },
    [currentSpec, updateWithHistory]
  );

  /**
   * Update canvas properties (e.g., background color)
   */
  const updateCanvas = useCallback(
    (updates: Partial<LogoSpec['canvas']>) => {
      if (!currentSpec) return;

      updateWithHistory({
        ...currentSpec,
        canvas: { ...currentSpec.canvas, ...updates },
      });
    },
    [currentSpec, updateWithHistory]
  );

  /**
   * Delete an element (shape or text)
   */
  const deleteElement = useCallback(
    (type: 'shape' | 'text', index: number) => {
      if (!currentSpec) return;

      if (type === 'shape') {
        const newShapes = currentSpec.shapes.filter((_, i) => i !== index);
        updateWithHistory({
          ...currentSpec,
          shapes: newShapes,
        });

        // Clear selection if deleted element was selected
        if (selectedElementId === `shape-${index}`) {
          setSelectedElementId(null);
        }
      } else {
        const newTexts = currentSpec.texts.filter((_, i) => i !== index);
        updateWithHistory({
          ...currentSpec,
          texts: newTexts,
        });

        // Clear selection if deleted element was selected
        if (selectedElementId === `text-${index}`) {
          setSelectedElementId(null);
        }
      }
    },
    [currentSpec, selectedElementId, updateWithHistory]
  );

  /**
   * Undo last change
   */
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCurrentSpec(history[newIndex]);
    setSelectedElementId(null); // Clear selection on undo
  }, [history, historyIndex]);

  /**
   * Redo last undone change
   */
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCurrentSpec(history[newIndex]);
    setSelectedElementId(null); // Clear selection on redo
  }, [history, historyIndex]);

  /**
   * Reset editor state
   */
  const reset = useCallback(() => {
    setCurrentSpec(null);
    setSelectedElementId(null);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  /**
   * Bring element to front (last in array = top)
   */
  const bringToFront = useCallback(
    (type: 'shape' | 'text', index: number) => {
      if (!currentSpec) return;

      if (type === 'shape') {
        if (index < 0 || index >= currentSpec.shapes.length) return;
        const newShapes = [...currentSpec.shapes];
        const [element] = newShapes.splice(index, 1);
        newShapes.push(element);

        updateWithHistory({
          ...currentSpec,
          shapes: newShapes,
        });

        // Update selection to new index (last position)
        setSelectedElementId(`shape-${newShapes.length - 1}`);
      } else {
        if (index < 0 || index >= currentSpec.texts.length) return;
        const newTexts = [...currentSpec.texts];
        const [element] = newTexts.splice(index, 1);
        newTexts.push(element);

        updateWithHistory({
          ...currentSpec,
          texts: newTexts,
        });

        // Update selection to new index (last position)
        setSelectedElementId(`text-${newTexts.length - 1}`);
      }
    },
    [currentSpec, updateWithHistory]
  );

  /**
   * Send element to back (first in array = bottom)
   */
  const sendToBack = useCallback(
    (type: 'shape' | 'text', index: number) => {
      if (!currentSpec) return;

      if (type === 'shape') {
        if (index < 0 || index >= currentSpec.shapes.length) return;
        const newShapes = [...currentSpec.shapes];
        const [element] = newShapes.splice(index, 1);
        newShapes.unshift(element);

        updateWithHistory({
          ...currentSpec,
          shapes: newShapes,
        });

        // Update selection to new index (first position)
        setSelectedElementId(`shape-0`);
      } else {
        if (index < 0 || index >= currentSpec.texts.length) return;
        const newTexts = [...currentSpec.texts];
        const [element] = newTexts.splice(index, 1);
        newTexts.unshift(element);

        updateWithHistory({
          ...currentSpec,
          texts: newTexts,
        });

        // Update selection to new index (first position)
        setSelectedElementId(`text-0`);
      }
    },
    [currentSpec, updateWithHistory]
  );

  /**
   * Align element to canvas
   */
  const alignElement = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (!currentSpec || !selectedElementId) return;

      const [type, indexStr] = selectedElementId.split('-');
      const index = parseInt(indexStr, 10);

      if (type === 'shape') {
        const shape = currentSpec.shapes[index];
        if (!shape) return;

        const updates: any = {};

        // Horizontal alignment
        if (alignment === 'center') {
          if ('x' in shape && 'width' in shape) {
            updates.x = 250 - shape.width / 2;
          }
          if ('cx' in shape) {
            updates.cx = 250;
          }
        } else if (alignment === 'left') {
          if ('x' in shape) {
            updates.x = 0;
          }
          if ('cx' in shape && 'r' in shape) {
            updates.cx = shape.r;
          }
          if ('cx' in shape && 'rx' in shape) {
            updates.cx = shape.rx;
          }
        } else if (alignment === 'right') {
          if ('x' in shape && 'width' in shape) {
            updates.x = 500 - shape.width;
          }
          if ('cx' in shape && 'r' in shape) {
            updates.cx = 500 - shape.r;
          }
          if ('cx' in shape && 'rx' in shape) {
            updates.cx = 500 - shape.rx;
          }
        }

        // Vertical alignment
        if (alignment === 'middle') {
          if ('y' in shape && 'height' in shape) {
            updates.y = 250 - shape.height / 2;
          }
          if ('cy' in shape) {
            updates.cy = 250;
          }
        } else if (alignment === 'top') {
          if ('y' in shape) {
            updates.y = 0;
          }
          if ('cy' in shape && 'r' in shape) {
            updates.cy = shape.r;
          }
          if ('cy' in shape && 'ry' in shape) {
            updates.cy = shape.ry;
          }
        } else if (alignment === 'bottom') {
          if ('y' in shape && 'height' in shape) {
            updates.y = 500 - shape.height;
          }
          if ('cy' in shape && 'r' in shape) {
            updates.cy = 500 - shape.r;
          }
          if ('cy' in shape && 'ry' in shape) {
            updates.cy = 500 - shape.ry;
          }
        }

        updateShape(index, updates);
      } else if (type === 'text') {
        const text = currentSpec.texts[index];
        if (!text) return;

        const updates: Partial<LogoText> = {};

        // Horizontal alignment
        if (alignment === 'center') {
          updates.x = 250;
          updates.textAnchor = 'middle';
        } else if (alignment === 'left') {
          updates.x = 0;
          updates.textAnchor = 'start';
        } else if (alignment === 'right') {
          updates.x = 500;
          updates.textAnchor = 'end';
        }

        // Vertical alignment
        if (alignment === 'middle') {
          updates.y = 250;
        } else if (alignment === 'top') {
          updates.y = text.fontSize;
        } else if (alignment === 'bottom') {
          updates.y = 500;
        }

        updateText(index, updates);
      }
    },
    [currentSpec, selectedElementId, updateShape, updateText]
  );

  return {
    // State
    currentSpec,
    selectedElementId,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    // Actions
    loadSpec,
    updateShape,
    updateText,
    updateCanvas,
    deleteElement,
    setSelectedElementId,
    undo,
    redo,
    reset,

    // Layer Management
    bringToFront,
    sendToBack,

    // Alignment
    alignElement,
  };
}
