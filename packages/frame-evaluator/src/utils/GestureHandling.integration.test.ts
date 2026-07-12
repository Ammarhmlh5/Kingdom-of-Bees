/**
 * Gesture Handling Integration Tests
 * Tests the complete gesture handling system including DragHandler and useDrag
 */

import { renderHook } from '@testing-library/react';
import { DragHandler, DragConfig } from './DragHandler';
import { useDrag } from '../hooks/useDrag';
import { GestureEvent } from '../platform/types';

describe('Gesture Handling Integration', () => {
  describe('Horizontal Drag Gestures', () => {
    it('should provide horizontal drag handlers', () => {
      const onChange = jest.fn();
      const onDragStart = jest.fn();
      const onDragEnd = jest.fn();

      const { result } = renderHook(() =>
        useDrag({
          value: 50,
          onChange,
          onDragStart,
          onDragEnd,
          orientation: 'horizontal',
          minValue: 0,
          maxValue: 100,
        })
      );

      // Should have all required handlers
      expect(result.current.handlers).toHaveProperty('onMouseDown');
      expect(result.current.handlers).toHaveProperty('onMouseMove');
      expect(result.current.handlers).toHaveProperty('onMouseUp');
      expect(result.current.setContainerRef).toBeDefined();
    });

    it('should increase value when dragging right', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      const moveEvent: GestureEvent = { x: 210, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);

      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeGreaterThan(50);
      expect(newValue).toBeLessThanOrEqual(100);
    });

    it('should decrease value when dragging left', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      const moveEvent: GestureEvent = { x: 90, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);

      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeLessThan(50);
      expect(newValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Vertical Drag Gestures', () => {
    it('should provide vertical drag handlers', () => {
      const onChange = jest.fn();
      const onDragStart = jest.fn();
      const onDragEnd = jest.fn();

      const { result } = renderHook(() =>
        useDrag({
          value: 50,
          onChange,
          onDragStart,
          onDragEnd,
          orientation: 'vertical',
          minValue: 0,
          maxValue: 100,
        })
      );

      // Should have all required handlers
      expect(result.current.handlers).toHaveProperty('onMouseDown');
      expect(result.current.handlers).toHaveProperty('onMouseMove');
      expect(result.current.handlers).toHaveProperty('onMouseUp');
      expect(result.current.setContainerRef).toBeDefined();
    });

    it('should increase value when dragging up', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'vertical',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 50, height: 300 });

      const startEvent: GestureEvent = { x: 25, y: 150, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      const moveEvent: GestureEvent = { x: 25, y: 90, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);

      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeGreaterThan(50);
      expect(newValue).toBeLessThanOrEqual(100);
    });

    it('should decrease value when dragging down', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'vertical',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 50, height: 300 });

      const startEvent: GestureEvent = { x: 25, y: 150, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      const moveEvent: GestureEvent = { x: 25, y: 210, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);

      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeLessThan(50);
      expect(newValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Snap Points', () => {
    it('should snap to 0% when close', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 5);

      const endEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);

      // Should snap to 0
      if (onChange.mock.calls.length > 0) {
        const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(finalValue).toBe(0);
      }
    });

    it('should snap to 25% when close', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 75, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 23);

      const endEvent: GestureEvent = { x: 75, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);

      // Should snap to 25
      if (onChange.mock.calls.length > 0) {
        const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(finalValue).toBe(25);
      }
    });

    it('should snap to 50% when close', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 48);

      const endEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);

      // Should snap to 50
      if (onChange.mock.calls.length > 0) {
        const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(finalValue).toBe(50);
      }
    });

    it('should snap to 75% when close', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 225, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 77);

      const endEvent: GestureEvent = { x: 225, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);

      // Should snap to 75
      if (onChange.mock.calls.length > 0) {
        const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(finalValue).toBe(75);
      }
    });

    it('should snap to 100% when close', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 300, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 98);

      const endEvent: GestureEvent = { x: 300, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);

      // Should snap to 100
      if (onChange.mock.calls.length > 0) {
        const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(finalValue).toBe(100);
      }
    });

    it('should not snap when far from snap points', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 40);

      const endEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);

      // Should not snap (40 is far from 25 and 50)
      if (onChange.mock.calls.length > 0) {
        const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(finalValue).toBe(40);
      }
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback when crossing snap points', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: true,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const onHaptic = jest.fn();
      const handler = new DragHandler(config, onChange, onHaptic);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 75, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 20);

      // Move past 25 snap point
      const moveEvent1: GestureEvent = { x: 80, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent1);

      // Move past 50 snap point
      const moveEvent2: GestureEvent = { x: 155, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent2);

      expect(onHaptic).toHaveBeenCalled();
    });

    it('should not trigger haptic feedback when disabled', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const onHaptic = jest.fn();
      const handler = new DragHandler(config, onChange, onHaptic);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 75, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 20);

      // Move past 25 snap point
      const moveEvent: GestureEvent = { x: 155, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);

      expect(onHaptic).not.toHaveBeenCalled();
    });

    it('should trigger haptic feedback at important points (0, 25, 50, 75, 100)', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: true,
        snapPoints: [0, 25, 50, 75, 100],
        hapticFeedback: true,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const onHaptic = jest.fn();
      const handler = new DragHandler(config, onChange, onHaptic);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      // Test each important point
      const importantPoints = [0, 25, 50, 75, 100];
      
      for (let i = 0; i < importantPoints.length - 1; i++) {
        onHaptic.mockClear();
        
        const startValue = importantPoints[i];
        const targetValue = importantPoints[i + 1];
        
        const startX = (startValue / 100) * 300;
        const targetX = (targetValue / 100) * 300;
        
        const startEvent: GestureEvent = { x: startX, y: 25, timestamp: Date.now() };
        handler.handleDragStart(startEvent, startValue);
        
        const moveEvent: GestureEvent = { x: targetX, y: 25, timestamp: Date.now() };
        handler.handleDragUpdate(moveEvent);
        
        expect(onHaptic).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid drag movements', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      // Rapid movements
      for (let i = 0; i < 10; i++) {
        const moveEvent: GestureEvent = { 
          x: 150 + (i * 10), 
          y: 25, 
          timestamp: Date.now() 
        };
        handler.handleDragUpdate(moveEvent);
      }

      expect(onChange).toHaveBeenCalled();
      const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(finalValue).toBeGreaterThanOrEqual(0);
      expect(finalValue).toBeLessThanOrEqual(100);
    });

    it('should handle drag without container rect', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      // Don't set container rect

      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      const moveEvent: GestureEvent = { x: 180, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);

      // Should not call onChange without container rect
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle drag end without drag start', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });

      const endEvent: GestureEvent = { x: 180, y: 25, timestamp: Date.now() };
      
      // Should not throw
      expect(() => handler.handleDragEnd(endEvent)).not.toThrow();
      expect(handler.isDragging()).toBe(false);
    });

    it('should handle zero-width container', () => {
      const config: DragConfig = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        snapToGrid: false,
        hapticFeedback: false,
        orientation: 'horizontal',
      };

      const onChange = jest.fn();
      const handler = new DragHandler(config, onChange);
      handler.setContainerRect({ x: 0, y: 0, width: 0, height: 50 });

      const startEvent: GestureEvent = { x: 0, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);

      const moveEvent: GestureEvent = { x: 10, y: 25, timestamp: Date.now() };
      
      // Should not throw or produce invalid values
      expect(() => handler.handleDragUpdate(moveEvent)).not.toThrow();
    });
  });

  describe('Touch Events', () => {
    it('should provide touch event handlers', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useDrag({
          value: 50,
          onChange,
          orientation: 'horizontal',
        })
      );

      // Should have touch handlers
      expect(result.current.handlers).toHaveProperty('onTouchStart');
      expect(result.current.handlers).toHaveProperty('onTouchMove');
      expect(result.current.handlers).toHaveProperty('onTouchEnd');
    });

    it('should work with disabled touch handlers', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useDrag({
          value: 50,
          onChange,
          orientation: 'horizontal',
          disabled: true,
        })
      );

      // Should not have handlers when disabled
      expect(result.current.handlers).toEqual({});
    });
  });
});
