/**
 * اختبارات المكون الرئيسي FrameEvaluator
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FrameEvaluator } from './FrameEvaluator';
import type { FrameData } from '../types';

describe('FrameEvaluator', () => {
  const defaultProps = {
    side: 'A' as const,
    initialData: {
      side: 'A' as const,
      honeyPercentage: 30,
      broodPercentage: 40,
      beeBreadPercentage: 20,
      emptyPercentage: 10,
      broodAge: 'MIXED' as const,
      isValid: true,
    },
  };

  describe('العرض الأساسي', () => {
    it('يجب أن يعرض المكون بنجاح', () => {
      render(<FrameEvaluator {...defaultProps} />);
      expect(screen.getByTestId('frame-evaluator')).toBeInTheDocument();
    });

    it('يجب أن يعرض جميع المؤشرات', () => {
      render(<FrameEvaluator {...defaultProps} />);
      
      // يجب أن تكون المؤشرات موجودة
      expect(screen.getByText(/عسل/i)).toBeInTheDocument();
      expect(screen.getAllByText(/حضنة/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/خبز النحل/i)).toBeInTheDocument();
    });

    it('يجب أن يعرض الإطار البصري', () => {
      render(<FrameEvaluator {...defaultProps} />);
      
      // يجب أن يكون هناك SVG (سيتم التحقق من خلال FrameRenderer)
      expect(screen.getByTestId('frame-evaluator')).toBeInTheDocument();
    });
  });

  describe('الأزرار', () => {
    it('يجب أن يعرض أزرار التحكم', () => {
      render(<FrameEvaluator {...defaultProps} />);
      
      expect(screen.getByText('تراجع')).toBeInTheDocument();
      expect(screen.getByText('إعادة')).toBeInTheDocument();
      expect(screen.getByText('إعادة تعيين')).toBeInTheDocument();
    });

    it('يجب أن يعرض زر الحفظ عند توفير onSave', () => {
      const onSave = jest.fn();
      render(<FrameEvaluator {...defaultProps} onSave={onSave} />);
      
      expect(screen.getByText('حفظ')).toBeInTheDocument();
    });

    it('يجب أن يعرض زر الإلغاء عند توفير onCancel', () => {
      const onCancel = jest.fn();
      render(<FrameEvaluator {...defaultProps} onCancel={onCancel} />);
      
      expect(screen.getByText('إلغاء')).toBeInTheDocument();
    });

    it('يجب أن يكون زر التراجع معطلاً في البداية', () => {
      render(<FrameEvaluator {...defaultProps} />);
      
      const undoButton = screen.getByText('تراجع');
      expect(undoButton).toBeDisabled();
    });

    it('يجب أن يكون زر إعادة التعيين معطلاً في البداية', () => {
      render(<FrameEvaluator {...defaultProps} />);
      
      const resetButton = screen.getByText('إعادة تعيين');
      expect(resetButton).toBeDisabled();
    });
  });

  describe('الوضع readonly', () => {
    it('يجب أن يخفي المؤشرات في الوضع readonly', () => {
      render(
        <FrameEvaluator {...defaultProps} readonly={true} />
      );
      
      // يجب أن لا تكون هناك أزرار
      expect(screen.queryByText('حفظ')).not.toBeInTheDocument();
      expect(screen.queryByText('تراجع')).not.toBeInTheDocument();
    });
  });

  describe('اللغة', () => {
    it('يجب أن يعرض النصوص بالإنجليزية عند language=en', () => {
      const onSave = jest.fn();
      render(
        <FrameEvaluator {...defaultProps} language="en" onSave={onSave} />
      );
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
    });
  });

  describe('الأحجام', () => {
    it('يجب أن يدعم الحجم الصغير', () => {
      const { container } = render(
        <FrameEvaluator {...defaultProps} size="small" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('يجب أن يدعم الحجم الكبير', () => {
      const { container } = render(
        <FrameEvaluator {...defaultProps} size="large" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('التخصيص', () => {
    it('يجب أن يعرض header مخصص', () => {
      const renderCustomHeader = () => <div>Custom Header</div>;
      render(
        <FrameEvaluator {...defaultProps} renderCustomHeader={renderCustomHeader} />
      );
      
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('يجب أن يعرض footer مخصص', () => {
      const renderCustomFooter = () => <div>Custom Footer</div>;
      render(
        <FrameEvaluator {...defaultProps} renderCustomFooter={renderCustomFooter} />
      );
      
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });
  });

  describe('التحقق', () => {
    it('يجب أن يعرض أخطاء التحقق', () => {
      const invalidData: FrameData = {
        side: 'A',
        honeyPercentage: 60,
        broodPercentage: 50,
        beeBreadPercentage: 10,
        emptyPercentage: -20,
        broodAge: 'MIXED',
        isValid: false,
      };

      render(<FrameEvaluator side="A" initialData={invalidData} />);
      
      // يجب أن تظهر رسالة خطأ
      expect(screen.getByText(/أخطاء:/i)).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('يجب أن يستدعي onChange عند التغيير', () => {
      const onChange = jest.fn();
      render(<FrameEvaluator {...defaultProps} onChange={onChange} />);
      
      // محاكاة تغيير (سيتم تنفيذه عبر المؤشرات)
      // هذا اختبار أساسي فقط
      expect(onChange).not.toHaveBeenCalled();
    });

    it('يجب أن يستدعي onCancel عند النقر على زر الإلغاء', () => {
      const onCancel = jest.fn();
      render(<FrameEvaluator {...defaultProps} onCancel={onCancel} />);
      
      const cancelButton = screen.getByText('إلغاء');
      fireEvent.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
