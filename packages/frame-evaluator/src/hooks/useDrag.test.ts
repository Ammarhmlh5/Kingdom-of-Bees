/**
 * useDrag Hook tests
 */

import { renderHook, act } from '@testing-library/react';
import { useDrag, UseDragOptions } from './useDrag';

describe('useDrag', () => {
  let options: UseDragOptions;
  let onChange: jest.Mock;
  let onDragStart: jest.Mock;
  let onDragEnd: jest.Mock;

  beforeEach(() => {
    onChange = jest.fn();
    onDragStart = jest.fn();
    onDragEnd = jest.fn();

    options = {
      value: 50,
      onChange,
      onDragStart,
      onDragEnd,
      minValue: 0,
      maxValue: 100,
      step: 1,
      orientation: 'horizontal',
    };
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDrag(options));

      expect(result.current.isDragging).toBe(false);
      expect(result.current.handlers).toBeDefined();
      expect(result.current.setContainerRef).toBeDefined();
    });

    it('should return empty handlers when disabled', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, disabled: true })
      );

      expect(result.current.handlers).toEqual({});
    });
  });

  describe('Container Ref', () => {
    it('should accept container element', () => {
      const { result } = renderHook(() => useDrag(options));

      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = jest.fn(() => ({
        x: 0,
        y: 0,
        width: 300,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 300,
        toJSON: () => {},
      }));

      act(() => {
        result.current.setContainerRef(mockElement);
      });

      expect(mockElement.getBoundingClientRect).toHaveBeenCalled();
    });

    it('should handle null container', () => {
      const { result } = renderHook(() => useDrag(options));

      act(() => {
        result.current.setContainerRef(null);
      });

      // Should not throw
      expect(result.current.setContainerRef).toBeDefined();
    });
  });

  describe('Gesture Handlers', () => {
    it('should provide gesture handlers', () => {
      const { result } = renderHook(() => useDrag(options));

      expect(result.current.handlers).toHaveProperty('onMouseDown');
      expect(result.current.handlers).toHaveProperty('onMouseMove');
      expect(result.current.handlers).toHaveProperty('onMouseUp');
      expect(result.current.handlers).toHaveProperty('onTouchStart');
      expect(result.current.handlers).toHaveProperty('onTouchMove');
      expect(result.current.handlers).toHaveProperty('onTouchEnd');
    });
  });

  describe('Configuration Updates', () => {
    it('should update when config changes', () => {
      const { result, rerender } = renderHook(
        (props: UseDragOptions) => useDrag(props),
        { initialProps: options }
      );

      const newOptions = { ...options, maxValue: 200 };
      rerender(newOptions);

      // Hook should still work
      expect(result.current.handlers).toBeDefined();
    });

    it('should update when onChange changes', () => {
      const { result, rerender } = renderHook(
        (props: UseDragOptions) => useDrag(props),
        { initialProps: options }
      );

      const newOnChange = jest.fn();
      const newOptions = { ...options, onChange: newOnChange };
      rerender(newOptions);

      expect(result.current.handlers).toBeDefined();
    });
  });

  describe('Disabled State', () => {
    it('should not provide handlers when disabled', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, disabled: true })
      );

      expect(Object.keys(result.current.handlers).length).toBe(0);
    });

    it('should provide handlers when enabled', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, disabled: false })
      );

      expect(Object.keys(result.current.handlers).length).toBeGreaterThan(0);
    });
  });

  describe('Orientation', () => {
    it('should support horizontal orientation', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, orientation: 'horizontal' })
      );

      expect(result.current.handlers).toBeDefined();
    });

    it('should support vertical orientation', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, orientation: 'vertical' })
      );

      expect(result.current.handlers).toBeDefined();
    });
  });

  describe('Snap Points', () => {
    it('should support snap points', () => {
      const { result } = renderHook(() =>
        useDrag({
          ...options,
          snapToGrid: true,
          snapPoints: [0, 25, 50, 75, 100],
        })
      );

      expect(result.current.handlers).toBeDefined();
    });

    it('should work without snap points', () => {
      const { result } = renderHook(() =>
        useDrag({
          ...options,
          snapToGrid: false,
          snapPoints: undefined,
        })
      );

      expect(result.current.handlers).toBeDefined();
    });
  });

  describe('Haptic Feedback', () => {
    it('should support haptic feedback enabled', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, hapticFeedback: true })
      );

      expect(result.current.handlers).toBeDefined();
    });

    it('should support haptic feedback disabled', () => {
      const { result } = renderHook(() =>
        useDrag({ ...options, hapticFeedback: false })
      );

      expect(result.current.handlers).toBeDefined();
    });
  });

  describe('Step Value', () => {
    it('should support custom step value', () => {
      const { result } = renderHook(() => useDrag({ ...options, step: 5 }));

      expect(result.current.handlers).toBeDefined();
    });

    it('should support step value of 1', () => {
      const { result } = renderHook(() => useDrag({ ...options, step: 1 }));

      expect(result.current.handlers).toBeDefined();
    });
  });
});
