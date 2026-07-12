/**
 * useDrag Hook
 * React hook for handling drag gestures
 */

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { DragHandler, DragConfig } from '../utils/DragHandler';
import { platformAdapter } from '../platform';

export interface UseDragOptions extends Partial<DragConfig> {
  value: number;
  onChange: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export interface UseDragResult {
  handlers: {
    onMouseDown?: (e: any) => void;
    onMouseMove?: (e: any) => void;
    onMouseUp?: (e: any) => void;
    onTouchStart?: (e: any) => void;
    onTouchMove?: (e: any) => void;
    onTouchEnd?: (e: any) => void;
  };
  isDragging: boolean;
  setContainerRef: (element: HTMLElement | null) => void;
}

/**
 * Default drag configuration
 */
const DEFAULT_CONFIG: DragConfig = {
  minValue: 0,
  maxValue: 100,
  step: 1,
  snapToGrid: true,
  snapPoints: [0, 25, 50, 75, 100],
  hapticFeedback: true,
  orientation: 'horizontal',
};

/**
 * useDrag hook
 */
export function useDrag(options: UseDragOptions): UseDragResult {
  const {
    value,
    onChange,
    onDragStart,
    onDragEnd,
    disabled = false,
    ...configOverrides
  } = options;

  // Merge config with defaults using useMemo
  const config: DragConfig = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...configOverrides,
    }),
    [configOverrides]
  );

  // Refs
  const dragHandlerRef = useRef<DragHandler | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const isDraggingRef = useRef(false);

  // Initialize drag handler
  useEffect(() => {
    const handleHaptic = () => {
      if (config.hapticFeedback) {
        platformAdapter.haptic.selection();
      }
    };

    dragHandlerRef.current = new DragHandler(config, onChange, handleHaptic);

    return () => {
      dragHandlerRef.current = null;
    };
  }, [config, onChange]);

  // Update container rect when container changes
  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
    if (element && dragHandlerRef.current) {
      const rect = element.getBoundingClientRect();
      dragHandlerRef.current.setContainerRect(rect);
    }
  }, []);

  // Create gesture handlers
  const gestureHandlers = platformAdapter.createGestureHandler({
    onStart: (event) => {
      if (disabled || !dragHandlerRef.current) return;

      // Update container rect
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dragHandlerRef.current.setContainerRect(rect);
      }

      dragHandlerRef.current.handleDragStart(event, value);
      isDraggingRef.current = true;
      onDragStart?.();
    },

    onMove: (event) => {
      if (disabled || !dragHandlerRef.current || !isDraggingRef.current) return;
      dragHandlerRef.current.handleDragUpdate(event);
    },

    onEnd: (event) => {
      if (disabled || !dragHandlerRef.current || !isDraggingRef.current) return;
      dragHandlerRef.current.handleDragEnd(event);
      isDraggingRef.current = false;
      onDragEnd?.();
    },
  });

  return {
    handlers: disabled ? {} : gestureHandlers,
    isDragging: isDraggingRef.current,
    setContainerRef,
  };
}
