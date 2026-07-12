/**
 * Component-specific types
 */

import { BroodAge } from './index';

/**
 * Slider component base props
 */
export interface BaseSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  snapPoints?: number[];
  hapticFeedback?: boolean;
}

/**
 * Honey slider props
 */
export interface HoneySliderProps extends BaseSliderProps {
  color?: string;
}

/**
 * Brood slider props
 */
export interface BroodSliderProps extends BaseSliderProps {
  broodAge?: BroodAge;
  color?: string;
}

/**
 * Bee bread slider props
 */
export interface BeeBreadSliderProps extends BaseSliderProps {
  color?: string;
}

/**
 * Brood age selector props
 */
export interface BroodAgeSelectorProps {
  value: BroodAge;
  onChange: (age: BroodAge) => void;
  disabled?: boolean;
  visible?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Frame renderer props
 */
export interface FrameRendererProps {
  honeyPercentage: number;
  broodPercentage: number;
  broodAge?: BroodAge;
  beeBreadPercentage: number;
  width: number;
  height: number;
  animated?: boolean;
  animationDuration?: number;
  showGrid?: boolean;
  cellSize?: number;
}

/**
 * Validation display props
 */
export interface ValidationDisplayProps {
  total: number;
  maxTotal: number;
  errors: Array<{
    type: string;
    message: string;
    field?: string;
  }>;
  warnings: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: Array<{
    description: string;
    changes: Record<string, unknown>;
  }>;
  showSuggestions?: boolean;
  onApplySuggestion?: (suggestion: { description: string; changes: Record<string, unknown> }) => void;
}

/**
 * Drag configuration
 */
export interface DragConfig {
  minValue: number;
  maxValue: number;
  step: number;
  snapToGrid: boolean;
  hapticFeedback: boolean;
}

/**
 * Drag state
 */
export interface DragState {
  isDragging: boolean;
  startValue: number;
  currentValue: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
}
