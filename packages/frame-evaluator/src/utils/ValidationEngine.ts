/**
 * Validation Engine
 * Validates frame data and generates suggestions
 */

import {
  FrameData,
  ValidationError,
  ValidationWarning,
  ValidationState,
  ValidationRules,
  Suggestion,
} from '../types';

export class ValidationEngine {
  private rules: ValidationRules;

  constructor(rules: ValidationRules) {
    this.rules = rules;
  }

  /**
   * Validate frame data
   */
  validate(data: FrameData): ValidationState {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: Suggestion[] = [];

    // Validate total percentage
    const total = data.honeyPercentage + data.broodPercentage + data.beeBreadPercentage;
    if (total > this.rules.maxTotal) {
      errors.push({
        type: 'TOTAL_EXCEEDED',
        message: `المجموع ${total}% يتجاوز الحد الأقصى ${this.rules.maxTotal}%`,
        field: 'total',
      });

      // Generate suggestions
      suggestions.push(...this.generateSuggestions(data, total));
    }

    // Validate ranges
    if (data.honeyPercentage < this.rules.minValue || data.honeyPercentage > this.rules.maxValue) {
      errors.push({
        type: 'INVALID_RANGE',
        message: `نسبة العسل يجب أن تكون بين ${this.rules.minValue}% و ${this.rules.maxValue}%`,
        field: 'honeyPercentage',
      });
    }

    if (data.broodPercentage < this.rules.minValue || data.broodPercentage > this.rules.maxValue) {
      errors.push({
        type: 'INVALID_RANGE',
        message: `نسبة الحضنة يجب أن تكون بين ${this.rules.minValue}% و ${this.rules.maxValue}%`,
        field: 'broodPercentage',
      });
    }

    if (
      data.beeBreadPercentage < this.rules.minValue ||
      data.beeBreadPercentage > this.rules.maxValue
    ) {
      errors.push({
        type: 'INVALID_RANGE',
        message: `نسبة خبز النحل يجب أن تكون بين ${this.rules.minValue}% و ${this.rules.maxValue}%`,
        field: 'beeBreadPercentage',
      });
    }

    // Validate brood age requirement
    if (this.rules.broodAgeRequired && data.broodPercentage > 0 && !data.broodAge) {
      errors.push({
        type: 'MISSING_BROOD_AGE',
        message: 'يجب تحديد عمر الحضنة عندما تكون نسبة الحضنة أكبر من 0%',
        field: 'broodAge',
      });
    }

    // Check for low resources
    const resources = data.honeyPercentage + data.beeBreadPercentage;
    if (resources < this.rules.lowResourcesThreshold) {
      warnings.push({
        type: 'LOW_RESOURCES',
        message: `الموارد منخفضة (${resources}%). قد تحتاج الخلية للتغذية.`,
        severity: resources < 10 ? 'high' : 'medium',
      });
    }

    // Check for unusual distribution
    if (data.broodPercentage > 80) {
      warnings.push({
        type: 'UNUSUAL_DISTRIBUTION',
        message: 'نسبة الحضنة عالية جداً (> 80%). تأكد من وجود مساحة كافية للعسل.',
        severity: 'medium',
      });
    }

    // Custom validators
    if (this.rules.customValidators) {
      for (const validator of this.rules.customValidators) {
        const error = validator(data);
        if (error) errors.push(error);
      }
    }

    // Custom warnings
    if (this.rules.customWarnings) {
      for (const warningFn of this.rules.customWarnings) {
        const warning = warningFn(data);
        if (warning) warnings.push(warning);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Generate suggestions to fix validation errors
   */
  private generateSuggestions(data: FrameData, total: number): Suggestion[] {
    const excess = total - this.rules.maxTotal;
    const suggestions: Suggestion[] = [];

    // Suggestion 1: Reduce honey
    if (data.honeyPercentage >= excess) {
      suggestions.push({
        description: `تقليل العسل بمقدار ${excess}%`,
        changes: {
          honeyPercentage: data.honeyPercentage - excess,
        },
      });
    }

    // Suggestion 2: Reduce brood
    if (data.broodPercentage >= excess) {
      suggestions.push({
        description: `تقليل الحضنة بمقدار ${excess}%`,
        changes: {
          broodPercentage: data.broodPercentage - excess,
        },
      });
    }

    // Suggestion 3: Reduce bee bread
    if (data.beeBreadPercentage >= excess) {
      suggestions.push({
        description: `تقليل خبز النحل بمقدار ${excess}%`,
        changes: {
          beeBreadPercentage: data.beeBreadPercentage - excess,
        },
      });
    }

    // Suggestion 4: Distribute reduction evenly
    const reduction = excess / 3;
    suggestions.push({
      description: `توزيع التقليل بالتساوي على الثلاثة`,
      changes: {
        honeyPercentage: Math.max(0, data.honeyPercentage - reduction),
        broodPercentage: Math.max(0, data.broodPercentage - reduction),
        beeBreadPercentage: Math.max(0, data.beeBreadPercentage - reduction),
      },
    });

    return suggestions;
  }
}
