/**
 * اختبارات useFrameEvaluator hook
 */

import { renderHook, act } from '@testing-library/react';
import { useFrameEvaluator } from './useFrameEvaluator';
import { FrameData } from '../types';

describe('useFrameEvaluator', () => {
  describe('التهيئة الأولية', () => {
    it('يجب أن يبدأ بالبيانات الافتراضية', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      expect(result.current.data).toEqual({
        side: 'A',
        honeyPercentage: 0,
        broodPercentage: 0,
        beeBreadPercentage: 0,
        emptyPercentage: 100,
        broodAge: 'MIXED',
        isValid: true,
      });
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('يجب أن يبدأ بالبيانات الأولية المعطاة', () => {
      const initialData: Partial<FrameData> = {
        honeyPercentage: 30,
        broodPercentage: 40,
        beeBreadPercentage: 20,
      };

      const { result } = renderHook(() => useFrameEvaluator({ initialData }));

      expect(result.current.data.honeyPercentage).toBe(30);
      expect(result.current.data.broodPercentage).toBe(40);
      expect(result.current.data.beeBreadPercentage).toBe(20);
      expect(result.current.data.emptyPercentage).toBe(10);
    });
  });

  describe('تحديث البيانات', () => {
    it('يجب أن يحدث نسبة العسل', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(50);
      });

      expect(result.current.data.honeyPercentage).toBe(50);
      expect(result.current.data.emptyPercentage).toBe(50);
      expect(result.current.isDirty).toBe(true);
    });

    it('يجب أن يحدث نسبة الحضنة', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateBrood(60);
      });

      expect(result.current.data.broodPercentage).toBe(60);
      expect(result.current.data.emptyPercentage).toBe(40);
      expect(result.current.isDirty).toBe(true);
    });

    it('يجب أن يحدث نسبة خبز النحل', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateBeeBread(30);
      });

      expect(result.current.data.beeBreadPercentage).toBe(30);
      expect(result.current.data.emptyPercentage).toBe(70);
      expect(result.current.isDirty).toBe(true);
    });

    it('يجب أن يحدث عمر الحضنة', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateBroodAge('EGGS');
      });

      expect(result.current.data.broodAge).toBe('EGGS');
      expect(result.current.isDirty).toBe(true);
    });

    it('يجب أن يحدث جانب الإطار', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateSide('B');
      });

      expect(result.current.data.side).toBe('B');
      expect(result.current.isDirty).toBe(true);
    });

    it('يجب أن يحسب النسبة الفارغة تلقائياً', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(30);
      });
      act(() => {
        result.current.updateBrood(40);
      });
      act(() => {
        result.current.updateBeeBread(20);
      });

      expect(result.current.data.emptyPercentage).toBe(10);
    });

    it('يجب أن يقيد القيم بين 0 و 100', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(150);
      });

      expect(result.current.data.honeyPercentage).toBe(100);

      act(() => {
        result.current.updateBrood(-10);
      });

      expect(result.current.data.broodPercentage).toBe(0);
    });
  });

  describe('التحقق من البيانات', () => {
    it('يجب أن يتحقق من البيانات عند التحديث', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(30);
        result.current.updateBrood(40);
        result.current.updateBeeBread(20);
      });

      expect(result.current.validationState.isValid).toBe(true);
      expect(result.current.data.isValid).toBe(true);
    });

    it('يجب أن يكتشف المجموع المتجاوز', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(60);
      });
      
      act(() => {
        result.current.updateBrood(50);
      });

      expect(result.current.validationState.isValid).toBe(false);
      expect(result.current.validationState.errors.length).toBeGreaterThan(0);
    });

    it('يجب أن يستدعي onValidationError عند وجود أخطاء', () => {
      const onValidationError = jest.fn();
      const { result } = renderHook(() => 
        useFrameEvaluator({ onValidationError })
      );

      act(() => {
        result.current.updateHoney(60);
      });
      
      act(() => {
        result.current.updateBrood(50);
      });

      expect(onValidationError).toHaveBeenCalled();
    });
  });

  describe('Undo/Redo', () => {
    it('يجب أن يتراجع عن آخر تغيير', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(50);
      });

      expect(result.current.data.honeyPercentage).toBe(50);
      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.undo();
      });

      expect(result.current.data.honeyPercentage).toBe(0);
      expect(result.current.canUndo).toBe(false);
    });

    it('يجب أن يعيد آخر تغيير تم التراجع عنه', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(50);
      });
      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.redo();
      });

      expect(result.current.data.honeyPercentage).toBe(50);
      expect(result.current.canRedo).toBe(false);
    });

    it('يجب أن يحتفظ بتاريخ التغييرات', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(30);
      });
      act(() => {
        result.current.updateBrood(40);
      });
      act(() => {
        result.current.updateBeeBread(20);
      });

      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.undo();
      });
      expect(result.current.data.beeBreadPercentage).toBe(0);

      act(() => {
        result.current.undo();
      });
      expect(result.current.data.broodPercentage).toBe(0);

      act(() => {
        result.current.undo();
      });
      expect(result.current.data.honeyPercentage).toBe(0);
    });

    it('يجب أن يمسح تاريخ Redo عند إجراء تغيير جديد', () => {
      const { result } = renderHook(() => useFrameEvaluator());

      act(() => {
        result.current.updateHoney(50);
      });
      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.updateBrood(30);
      });

      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('الحفظ', () => {
    it('يجب أن يحفظ البيانات', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFrameEvaluator({ onSave }));

      act(() => {
        result.current.updateHoney(50);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(onSave).toHaveBeenCalledWith(result.current.data);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('يجب أن لا يحفظ البيانات غير الصحيحة', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFrameEvaluator({ onSave }));

      act(() => {
        result.current.updateHoney(60);
      });
      
      act(() => {
        result.current.updateBrood(50);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('يجب أن يعالج أخطاء الحفظ', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('خطأ في الحفظ'));
      const { result } = renderHook(() => useFrameEvaluator({ onSave }));

      act(() => {
        result.current.updateHoney(50);
      });

      await expect(
        act(async () => {
          await result.current.save();
        })
      ).rejects.toThrow('خطأ في الحفظ');

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('إعادة التعيين', () => {
    it('يجب أن يعيد البيانات إلى الحالة الأصلية', () => {
      const initialData: Partial<FrameData> = {
        honeyPercentage: 30,
        broodPercentage: 40,
      };
      const { result } = renderHook(() => useFrameEvaluator({ initialData }));

      act(() => {
        result.current.updateHoney(60);
      });
      
      act(() => {
        result.current.updateBrood(20);
      });

      expect(result.current.data.honeyPercentage).toBe(60);
      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data.honeyPercentage).toBe(30);
      expect(result.current.data.broodPercentage).toBe(40);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.canUndo).toBe(false);
    });
  });

  describe('onChange callback', () => {
    it('يجب أن يستدعي onChange عند التحديث', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFrameEvaluator({ onChange }));

      act(() => {
        result.current.updateHoney(50);
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          honeyPercentage: 50,
        })
      );
    });

    it('يجب أن يستدعي onChange عند Undo', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFrameEvaluator({ onChange }));

      act(() => {
        result.current.updateHoney(50);
      });

      onChange.mockClear();

      act(() => {
        result.current.undo();
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('الحفظ التلقائي', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('يجب أن يحفظ تلقائياً بعد الفترة المحددة', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => 
        useFrameEvaluator({ 
          onSave, 
          autoSave: true, 
          autoSaveInterval: 1000 
        })
      );

      act(() => {
        result.current.updateHoney(50);
      });

      expect(onSave).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(onSave).toHaveBeenCalled();
    });

    it('يجب أن لا يحفظ تلقائياً البيانات غير الصحيحة', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => 
        useFrameEvaluator({ 
          onSave, 
          autoSave: true, 
          autoSaveInterval: 1000 
        })
      );

      act(() => {
        result.current.updateHoney(60);
      });
      
      act(() => {
        result.current.updateBrood(50);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    jest.useRealTimers();
  });
});
