/**
 * Validation utilities tests
 */

import {
  getDefaultValidationRules,
  validateFrameData,
  calculateEmpty,
  getDefaultFrameData,
} from './validation';
import { FrameData } from '../types';

describe('validation utilities', () => {
  describe('getDefaultValidationRules', () => {
    it('should return default rules', () => {
      const rules = getDefaultValidationRules();

      expect(rules.maxTotal).toBe(100);
      expect(rules.minValue).toBe(0);
      expect(rules.maxValue).toBe(100);
      expect(rules.broodAgeRequired).toBe(true);
      expect(rules.lowResourcesThreshold).toBe(20);
    });
  });

  describe('validateFrameData', () => {
    it('should validate with default rules', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 40,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 0,
        broodAge: 'CAPPED',
        isValid: true,
      };

      const result = validateFrameData(data);

      expect(result.isValid).toBe(true);
    });

    it('should validate with custom rules', () => {
      const data: FrameData = {
        side: 'A',
        honeyPercentage: 40,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 0,
        isValid: true,
      };

      const customRules = {
        ...getDefaultValidationRules(),
        broodAgeRequired: false,
      };

      const result = validateFrameData(data, customRules);

      expect(result.isValid).toBe(true);
    });
  });

  describe('calculateEmpty', () => {
    it('should calculate empty percentage correctly', () => {
      const data = {
        honeyPercentage: 40,
        broodPercentage: 30,
        beeBreadPercentage: 20,
      };

      const empty = calculateEmpty(data);

      expect(empty).toBe(10);
    });

    it('should return 0 when total is 100%', () => {
      const data = {
        honeyPercentage: 50,
        broodPercentage: 30,
        beeBreadPercentage: 20,
      };

      const empty = calculateEmpty(data);

      expect(empty).toBe(0);
    });

    it('should return 0 when total exceeds 100%', () => {
      const data = {
        honeyPercentage: 60,
        broodPercentage: 50,
        beeBreadPercentage: 20,
      };

      const empty = calculateEmpty(data);

      expect(empty).toBe(0);
    });
  });

  describe('getDefaultFrameData', () => {
    it('should return default frame data', () => {
      const data = getDefaultFrameData();

      expect(data.side).toBe('A');
      expect(data.honeyPercentage).toBe(0);
      expect(data.broodPercentage).toBe(0);
      expect(data.beeBreadPercentage).toBe(0);
      expect(data.emptyPercentage).toBe(100);
      expect(data.isValid).toBe(true);
    });
  });
});
