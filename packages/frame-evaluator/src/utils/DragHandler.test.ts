/**
 * DragHandler tests
 */

import { DragHandler, DragConfig } from './DragHandler';
import { GestureEvent } from '../platform/types';

describe('DragHandler', () => {
  let config: DragConfig;
  let onChange: jest.Mock;
  let onHaptic: jest.Mock;
  let handler: DragHandler;

  beforeEach(() => {
    config = {
      minValue: 0,
      maxValue: 100,
      step: 1,
      snapToGrid: true,
      snapPoints: [0, 25, 50, 75, 100],
      hapticFeedback: true,
      orientation: 'horizontal',
    };
    onChange = jest.fn();
    onHaptic = jest.fn();
    handler = new DragHandler(config, onChange, onHaptic);
    
    // Set container rect
    handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });
  });

  describe('handleDragStart', () => {
    it('should initialize drag state', () => {
      const event: GestureEvent = { x: 100, y: 25, timestamp: Date.now() };
      
      handler.handleDragStart(event, 50);
      
      expect(handler.isDragging()).toBe(true);
      const state = handler.getState();
      expect(state.startValue).toBe(50);
      expect(state.currentValue).toBe(50);
      expect(state.startPosition).toEqual({ x: 100, y: 25 });
    });
  });

  describe('handleDragUpdate - Horizontal', () => {
    beforeEach(() => {
      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);
    });

    it('should update value when dragging right', () => {
      const moveEvent: GestureEvent = { x: 180, y: 25, timestamp: Date.now() };
      
      handler.handleDragUpdate(moveEvent);
      
      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeGreaterThan(50);
    });

    it('should update value when dragging left', () => {
      const moveEvent: GestureEvent = { x: 120, y: 25, timestamp: Date.now() };
      
      handler.handleDragUpdate(moveEvent);
      
      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeLessThan(50);
    });

    it('should clamp value to min', () => {
      const moveEvent: GestureEvent = { x: -100, y: 25, timestamp: Date.now() };
      
      handler.handleDragUpdate(moveEvent);
      
      const newValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(newValue).toBeGreaterThanOrEqual(config.minValue);
    });

    it('should clamp value to max', () => {
      const moveEvent: GestureEvent = { x: 500, y: 25, timestamp: Date.now() };
      
      handler.handleDragUpdate(moveEvent);
      
      const newValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(newValue).toBeLessThanOrEqual(config.maxValue);
    });
  });

  describe('handleDragUpdate - Vertical', () => {
    beforeEach(() => {
      config.orientation = 'vertical';
      handler = new DragHandler(config, onChange, onHaptic);
      handler.setContainerRect({ x: 0, y: 0, width: 50, height: 300 });
      
      const startEvent: GestureEvent = { x: 25, y: 150, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);
    });

    it('should update value when dragging up', () => {
      const moveEvent: GestureEvent = { x: 25, y: 120, timestamp: Date.now() };
      
      handler.handleDragUpdate(moveEvent);
      
      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeGreaterThan(50);
    });

    it('should update value when dragging down', () => {
      const moveEvent: GestureEvent = { x: 25, y: 180, timestamp: Date.now() };
      
      handler.handleDragUpdate(moveEvent);
      
      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue).toBeLessThan(50);
    });
  });

  describe('Snap Points', () => {
    it('should snap to nearest point', () => {
      const startEvent: GestureEvent = { x: 75, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 25);
      
      // Move significantly to trigger snap
      const moveEvent: GestureEvent = { x: 140, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);
      
      const endEvent: GestureEvent = { x: 140, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);
      
      // Should have called onChange
      expect(onChange).toHaveBeenCalled();
      
      // The final value should be close to a snap point
      const finalValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      const snapPoints = config.snapPoints || [];
      const isNearSnapPoint = snapPoints.some(point => Math.abs(finalValue - point) <= 5);
      expect(isNearSnapPoint).toBe(true);
    });

    it('should trigger haptic feedback at snap points', () => {
      const startEvent: GestureEvent = { x: 75, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 25);
      
      // Move past 50 snap point
      const moveEvent: GestureEvent = { x: 155, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);
      
      expect(onHaptic).toHaveBeenCalled();
    });
  });

  describe('Step', () => {
    it('should apply step value', () => {
      config.step = 5;
      handler = new DragHandler(config, onChange, onHaptic);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });
      
      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);
      
      const moveEvent: GestureEvent = { x: 153, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);
      
      if (onChange.mock.calls.length > 0) {
        const newValue = onChange.mock.calls[0][0];
        expect(newValue % 5).toBe(0);
      }
    });
  });

  describe('handleDragEnd', () => {
    it('should set isDragging to false', () => {
      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);
      
      expect(handler.isDragging()).toBe(true);
      
      const endEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragEnd(endEvent);
      
      expect(handler.isDragging()).toBe(false);
    });
  });

  describe('Disabled snap points', () => {
    it('should work without snap points', () => {
      config.snapToGrid = false;
      config.snapPoints = undefined;
      handler = new DragHandler(config, onChange, onHaptic);
      handler.setContainerRect({ x: 0, y: 0, width: 300, height: 50 });
      
      const startEvent: GestureEvent = { x: 150, y: 25, timestamp: Date.now() };
      handler.handleDragStart(startEvent, 50);
      
      const moveEvent: GestureEvent = { x: 180, y: 25, timestamp: Date.now() };
      handler.handleDragUpdate(moveEvent);
      
      expect(onChange).toHaveBeenCalled();
    });
  });
});
