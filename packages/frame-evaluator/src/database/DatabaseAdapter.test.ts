/**
 * اختبارات محولات قاعدة البيانات
 * 
 * اختبارات شاملة لجميع محولات قاعدة البيانات
 */

import { DatabaseHelpers, FrameEvaluationRecord } from './DatabaseAdapter';
import { FrameData } from '../types';

describe('DatabaseHelpers', () => {
  describe('frameDataToRecord', () => {
    it('should convert FrameData to database record', () => {
      const frameData: FrameData = {
        side: 'A',
        honeyPercentage: 30,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 10,
        broodAge: 'MIXED',
        isValid: true,
      };

      const metadata = {
        hiveId: 'hive_1',
        frameId: 'frame_1',
        userId: 'user_1',
        notes: 'Test note',
        images: ['image1.jpg', 'image2.jpg'],
      };

      const record = DatabaseHelpers.frameDataToRecord(frameData, metadata);

      expect(record.side).toBe('A');
      expect(record.honeyPercentage).toBe(30);
      expect(record.broodPercentage).toBe(50);
      expect(record.beeBreadPercentage).toBe(10);
      expect(record.emptyPercentage).toBe(10);
      expect(record.broodAge).toBe('MIXED');
      expect(record.isValid).toBe(true);
      expect(record.hiveId).toBe('hive_1');
      expect(record.frameId).toBe('frame_1');
      expect(record.userId).toBe('user_1');
      expect(record.notes).toBe('Test note');
      expect(record.images).toEqual(['image1.jpg', 'image2.jpg']);
      expect(record.id).toBeDefined();
    });

    it('should generate unique IDs', () => {
      const frameData: FrameData = {
        side: 'A',
        honeyPercentage: 30,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 10,
        broodAge: 'MIXED',
        isValid: true,
      };

      const record1 = DatabaseHelpers.frameDataToRecord(frameData);
      const record2 = DatabaseHelpers.frameDataToRecord(frameData);

      expect(record1.id).not.toBe(record2.id);
    });

    it('should use provided ID if given', () => {
      const frameData: FrameData = {
        side: 'A',
        honeyPercentage: 30,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 10,
        broodAge: 'MIXED',
        isValid: true,
      };

      const record = DatabaseHelpers.frameDataToRecord(frameData, { id: 'custom_id' });

      expect(record.id).toBe('custom_id');
    });
  });

  describe('recordToFrameData', () => {
    it('should convert database record to FrameData', () => {
      const record: FrameEvaluationRecord = {
        id: 'eval_1',
        hiveId: 'hive_1',
        frameId: 'frame_1',
        userId: 'user_1',
        side: 'A',
        honeyPercentage: 30,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: 10,
        broodAge: 'MIXED',
        isValid: true,
        notes: 'Test note',
        images: ['image1.jpg'],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const frameData = DatabaseHelpers.recordToFrameData(record);

      expect(frameData.side).toBe('A');
      expect(frameData.honeyPercentage).toBe(30);
      expect(frameData.broodPercentage).toBe(50);
      expect(frameData.beeBreadPercentage).toBe(10);
      expect(frameData.emptyPercentage).toBe(10);
      expect(frameData.broodAge).toBe('MIXED');
      expect(frameData.isValid).toBe(true);
    });
  });

  describe('generateId', () => {
    it('should generate ID with correct prefix', () => {
      const id = DatabaseHelpers.generateId();
      expect(id).toMatch(/^eval_\d+_[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(DatabaseHelpers.generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('buildWhereClause', () => {
    it('should build WHERE clause with single filter', () => {
      const filters = { hiveId: 'hive_1' };
      const { clause, params } = DatabaseHelpers.buildWhereClause(filters as Partial<FrameEvaluationRecord>, '$');

      expect(clause).toBe('WHERE hiveId = $1');
      expect(params).toEqual(['hive_1']);
    });

    it('should build WHERE clause with multiple filters', () => {
      const filters = {
        hiveId: 'hive_1',
        frameId: 'frame_1',
        userId: 'user_1',
      };
      const { clause, params } = DatabaseHelpers.buildWhereClause(filters as Partial<FrameEvaluationRecord>, '$');

      expect(clause).toContain('WHERE');
      expect(clause).toContain('hiveId = $1');
      expect(clause).toContain('frameId = $2');
      expect(clause).toContain('userId = $3');
      expect(clause).toContain('AND');
      expect(params).toEqual(['hive_1', 'frame_1', 'user_1']);
    });

    it('should return empty clause for no filters', () => {
      const { clause, params } = DatabaseHelpers.buildWhereClause(undefined, '$');

      expect(clause).toBe('');
      expect(params).toEqual([]);
    });

    it('should skip undefined and null values', () => {
      const filters = {
        hiveId: 'hive_1',
        frameId: undefined,
        userId: undefined,
      };
      const { clause, params } = DatabaseHelpers.buildWhereClause(filters as Partial<FrameEvaluationRecord>, '$');

      expect(clause).toBe('WHERE hiveId = $1');
      expect(params).toEqual(['hive_1']);
    });
  });

  describe('buildOrderByClause', () => {
    it('should build ORDER BY clause with ascending order', () => {
      const orderBy = { field: 'createdAt' as const, direction: 'asc' as const };
      const clause = DatabaseHelpers.buildOrderByClause(orderBy);

      expect(clause).toBe('ORDER BY createdAt ASC');
    });

    it('should build ORDER BY clause with descending order', () => {
      const orderBy = { field: 'honeyPercentage' as const, direction: 'desc' as const };
      const clause = DatabaseHelpers.buildOrderByClause(orderBy);

      expect(clause).toBe('ORDER BY honeyPercentage DESC');
    });

    it('should use default order when no orderBy provided', () => {
      const clause = DatabaseHelpers.buildOrderByClause(undefined);

      expect(clause).toBe('ORDER BY createdAt DESC');
    });
  });

  describe('buildLimitOffsetClause', () => {
    it('should build LIMIT clause', () => {
      const options = { limit: 10 };
      const clause = DatabaseHelpers.buildLimitOffsetClause(options);

      expect(clause).toBe('LIMIT 10');
    });

    it('should build OFFSET clause', () => {
      const options = { offset: 20 };
      const clause = DatabaseHelpers.buildLimitOffsetClause(options);

      expect(clause).toBe('OFFSET 20');
    });

    it('should build LIMIT and OFFSET clause', () => {
      const options = { limit: 10, offset: 20 };
      const clause = DatabaseHelpers.buildLimitOffsetClause(options);

      expect(clause).toBe('LIMIT 10 OFFSET 20');
    });

    it('should return empty string when no options provided', () => {
      const clause = DatabaseHelpers.buildLimitOffsetClause(undefined);

      expect(clause).toBe('');
    });
  });
});
