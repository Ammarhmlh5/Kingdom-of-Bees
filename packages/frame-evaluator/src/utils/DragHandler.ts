/**
 * Drag Handler
 * Handles drag gestures with snap points and haptic feedback
 */

import { GestureEvent } from '../platform/types';

export interface DragConfig {
  minValue: number;
  maxValue: number;
  step: number;
  snapToGrid: boolean;
  snapPoints?: number[];
  hapticFeedback: boolean;
  orientation: 'horizontal' | 'vertical';
}

export interface DragState {
  isDragging: boolean;
  startValue: number;
  currentValue: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
}

export type DragCallback = (value: number) => void;
export type HapticCallback = () => void;

export class DragHandler {
  private config: DragConfig;
  private state: DragState;
  private onChange: DragCallback;
  private onHaptic?: HapticCallback;
  private containerRect?: DOMRect | { x: number; y: number; width: number; height: number };
  private lastSnapValue?: number;

  constructor(
    config: DragConfig,
    onChange: DragCallback,
    onHaptic?: HapticCallback
  ) {
    this.config = config;
    this.onChange = onChange;
    this.onHaptic = onHaptic;
    this.state = {
      isDragging: false,
      startValue: config.minValue,
      currentValue: config.minValue,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
    };
  }

  /**
   * Set container bounds for calculating relative positions
   */
  setContainerRect(rect: DOMRect | { x: number; y: number; width: number; height: number }): void {
    this.containerRect = rect;
  }

  /**
   * Handle drag start
   */
  handleDragStart(event: GestureEvent, currentValue: number): void {
    this.state = {
      isDragging: true,
      startValue: currentValue,
      currentValue,
      startPosition: { x: event.x, y: event.y },
      currentPosition: { x: event.x, y: event.y },
    };
    this.lastSnapValue = currentValue;
  }

  /**
   * Handle drag update
   */
  handleDragUpdate(event: GestureEvent): void {
    if (!this.state.isDragging || !this.containerRect) {
      return;
    }

    this.state.currentPosition = { x: event.x, y: event.y };

    // Calculate delta based on orientation
    const delta = this.config.orientation === 'horizontal'
      ? event.x - this.state.startPosition.x
      : this.state.startPosition.y - event.y; // Inverted for vertical

    // Calculate size based on orientation
    const size = this.config.orientation === 'horizontal'
      ? this.containerRect.width
      : this.containerRect.height;

    // Calculate percentage change
    const percentageChange = (delta / size) * (this.config.maxValue - this.config.minValue);

    // Calculate new value
    let newValue = this.state.startValue + percentageChange;

    // Apply step
    if (this.config.step > 0) {
      newValue = Math.round(newValue / this.config.step) * this.config.step;
    }

    // Clamp value
    newValue = Math.max(this.config.minValue, Math.min(this.config.maxValue, newValue));

    // Apply snap points
    if (this.config.snapToGrid && this.config.snapPoints) {
      newValue = this.findNearestSnapPoint(newValue);
    }

    // Update value if changed
    if (newValue !== this.state.currentValue) {
      this.state.currentValue = newValue;
      this.onChange(newValue);

      // Trigger haptic feedback at snap points
      if (this.config.hapticFeedback && this.shouldTriggerHaptic(newValue)) {
        this.onHaptic?.();
        this.lastSnapValue = newValue;
      }
    }
  }

  /**
   * Handle drag end
   */
  handleDragEnd(event: GestureEvent): void {
    if (!this.state.isDragging) {
      return;
    }

    this.state.isDragging = false;
    this.state.currentPosition = { x: event.x, y: event.y };

    // Final snap if needed
    if (this.config.snapToGrid && this.config.snapPoints) {
      const snappedValue = this.findNearestSnapPoint(this.state.currentValue);
      if (snappedValue !== this.state.currentValue) {
        this.state.currentValue = snappedValue;
        this.onChange(snappedValue);
      }
    }
  }

  /**
   * Find nearest snap point
   */
  private findNearestSnapPoint(value: number): number {
    if (!this.config.snapPoints || this.config.snapPoints.length === 0) {
      return value;
    }

    let nearest = this.config.snapPoints[0];
    let minDistance = Math.abs(value - nearest);

    for (const snapPoint of this.config.snapPoints) {
      const distance = Math.abs(value - snapPoint);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = snapPoint;
      }
    }

    // Only snap if within threshold (5% of range)
    const threshold = (this.config.maxValue - this.config.minValue) * 0.05;
    if (minDistance <= threshold) {
      return nearest;
    }

    return value;
  }

  /**
   * Check if haptic feedback should be triggered
   */
  private shouldTriggerHaptic(value: number): boolean {
    if (!this.config.snapPoints) {
      return false;
    }

    // Trigger haptic when crossing a snap point
    for (const snapPoint of this.config.snapPoints) {
      if (
        this.lastSnapValue !== undefined &&
        ((this.lastSnapValue < snapPoint && value >= snapPoint) ||
          (this.lastSnapValue > snapPoint && value <= snapPoint))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get current state
   */
  getState(): DragState {
    return { ...this.state };
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.state.isDragging;
  }
}
