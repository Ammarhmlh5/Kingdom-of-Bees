/**
 * Validation utilities
 */

import { FrameData, ValidationRules, ValidationState } from '../types';
import { ValidationEngine } from './ValidationEngine';

/**
 * Get default validation rules
 */
export function getDefaultValidationRules(): ValidationRules {
  return {
    maxTotal: 100,
    minValue: 0,
    maxValue: 100,
    broodAgeRequired: true,
    lowResourcesThreshold: 20,
  };
}

/**
 * Validate frame data with default or custom rules
 */
export function validateFrameData(
  data: FrameData,
  rules?: ValidationRules
): ValidationState {
  const engine = new ValidationEngine(rules || getDefaultValidationRules());
  return engine.validate(data);
}

/**
 * Calculate empty percentage
 */
export function calculateEmpty(data: Pick<FrameData, 'honeyPercentage' | 'broodPercentage' | 'beeBreadPercentage'>): number {
  return Math.max(
    0,
    100 - (data.honeyPercentage + data.broodPercentage + data.beeBreadPercentage)
  );
}

/**
 * Get default frame data
 */
export function getDefaultFrameData(): FrameData {
  return {
    side: 'A',
    honeyPercentage: 0,
    broodPercentage: 0,
    beeBreadPercentage: 0,
    emptyPercentage: 100,
    isValid: true,
  };
}
