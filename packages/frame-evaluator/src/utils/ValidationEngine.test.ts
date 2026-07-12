/**
 * ValidationEngine tests
 */

import { ValidationEngine } from './ValidationEngine';
import { FrameData, ValidationRules } from '../types';
import { getDefaultValidationRules } from './validation';

describe('ValidationEngine', () => {
  let engine: ValidationEngine;
  let rules: ValidationRules;

  beforeEach(() => {
    rules = getDefaultValidationRules();
    engine = new ValidationEngine(rules);
  });

  describe('validate', () => {
    it('should validate correct data', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 40,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 0,
        broodAge: 'CAPPED',
        isValid: true,
      };

      const result = engine.validate(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect total exceeded', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 60,
        broodPercentage: 50,
        beeBreadPercentage: 20,
        broodAge: 'MIXED', // إضافة عمر الحضنة
        emptyPercentage: 0,
        isValid: false,
      };

      const result = engine.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
      expect(result.errors.some(e => e.type === 'TOTAL_EXCEEDED')).toBe(true);
      const totalError = result.errors.find(e => e.type === 'TOTAL_EXCEEDED');
      expect(totalError?.field).toBe('total');
    });

    it('should detect invalid range for honey', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 150,
        broodPercentage: 0,
        beeBreadPercentage: 0,
        emptyPercentage: 0,
        isValid: false,
      };

      const result = engine.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'honeyPercentage')).toBe(true);
    });

    it('should detect missing brood age', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 40,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 0,
        // broodAge is missing
        isValid: false,
      };

      const result = engine.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.type === 'MISSING_BROOD_AGE')).toBe(true);
    });

    it('should warn about low resources', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 5,
        broodPercentage: 80,
        beeBreadPercentage: 5,
        emptyPercentage: 10,
        broodAge: 'CAPPED',
        isValid: true,
      };

      const result = engine.validate(data);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('LOW_RESOURCES');
      expect(result.warnings[0].severity).toBe('medium');
    });

    it('should warn about unusual distribution', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 10,
        broodPercentage: 85,
        beeBreadPercentage: 5,
        emptyPercentage: 0,
        broodAge: 'CAPPED',
        isValid: true,
      };

      const result = engine.validate(data);

      expect(result.warnings.some((w) => w.type === 'UNUSUAL_DISTRIBUTION')).toBe(true);
    });

    it('should generate suggestions for total exceeded', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 60,
        broodPercentage: 50,
        beeBreadPercentage: 20,
        emptyPercentage: 0,
        isValid: false,
      };

      const result = engine.validate(data);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].description).toContain('تقليل');
    });

    it('should apply custom validators', () => {
      const customRules: ValidationRules = {
        ...rules,
        customValidators: [
          (data) => {
            if (data.honeyPercentage > 90) {
              return {
                type: 'INVALID_RANGE',
                message: 'Too much honey',
                field: 'honeyPercentage',
              };
            }
            return null;
          },
        ],
      };

      const customEngine = new ValidationEngine(customRules);
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 95,
        broodPercentage: 0,
        beeBreadPercentage: 0,
        emptyPercentage: 5,
        isValid: false,
      };

      const result = customEngine.validate(data);

      expect(result.errors.some((e) => e.message === 'Too much honey')).toBe(true);
    });
  });
});
