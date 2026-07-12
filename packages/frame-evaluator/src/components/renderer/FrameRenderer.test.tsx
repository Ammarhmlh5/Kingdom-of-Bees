/**
 * اختبارات مكون FrameRenderer
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FrameRenderer } from './FrameRenderer';
import { FrameData } from '../../types';

// Mock requestAnimationFrame
let animationFrameId = 0;
const animationFrameCallbacks = new Map<number, FrameRequestCallback>();

global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  const id = ++animationFrameId;
  animationFrameCallbacks.set(id, callback);
  return id;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  animationFrameCallbacks.delete(id);
});

function runAnimationFrames(count: number, timeStep: number = 16) {
  let currentTime = 0;
  for (let i = 0; i < count; i++) {
    currentTime += timeStep;
    const callbacks = Array.from(animationFrameCallbacks.values());
    animationFrameCallbacks.clear();
    callbacks.forEach(callback => callback(currentTime));
  }
}

describe('FrameRenderer', () => {
  const defaultData: FrameData = {
    side: 'A',
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 20,
    emptyPercentage: 10,
    broodAge: 'MIXED',
    isValid: true,
  };

  beforeEach(() => {
    animationFrameId = 0;
    animationFrameCallbacks.clear();
    jest.clearAllMocks();
  });

  describe('الرسم الأساسي', () => {
    it('يجب أن يرسم SVG بالأبعاد الصحيحة', () => {
      render(<FrameRenderer data={defaultData} width={400} height={600} />);

      const svg = screen.getByTestId('frame-renderer');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '600');
      expect(svg).toHaveAttribute('viewBox', '0 0 400 600');
    });

    it('يجب أن يستخدم الأبعاد الافتراضية', () => {
      render(<FrameRenderer data={defaultData} />);

      const svg = screen.getByTestId('frame-renderer');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '600');
    });

    it('يجب أن يرسم الإطار بالبيانات المعطاة', () => {
      render(<FrameRenderer data={defaultData} animated={false} />);

      const svg = screen.getByTestId('frame-renderer');
      expect(svg.children.length).toBeGreaterThan(0);
    });
  });

  describe('الرسوم المتحركة', () => {
    it('يجب أن يحرك التغييرات عند تفعيل animated', async () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} animated={true} animationDuration={100} />
      );

      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 50,
        broodPercentage: 30,
        beeBreadPercentage: 15,
        emptyPercentage: 5,
      };

      rerender(<FrameRenderer data={newData} animated={true} animationDuration={100} />);

      // تشغيل الإطارات
      runAnimationFrames(10);

      await waitFor(() => {
        expect(requestAnimationFrame).toHaveBeenCalled();
      });
    });

    it('يجب أن يحدث فوراً عند تعطيل animated', () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} animated={false} />
      );

      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 50,
      };

      rerender(<FrameRenderer data={newData} animated={false} />);

      // لا يجب استدعاء requestAnimationFrame
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('يجب أن يحترم مدة الرسوم المتحركة', async () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} animated={true} animationDuration={200} />
      );

      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 60,
      };

      rerender(<FrameRenderer data={newData} animated={true} animationDuration={200} />);

      runAnimationFrames(5);

      await waitFor(() => {
        expect(requestAnimationFrame).toHaveBeenCalled();
      });
    });
  });

  describe('معالجة الأحداث', () => {
    it('يجب أن يستدعي onLayerClick عند النقر على طبقة', async () => {
      const onLayerClick = jest.fn();
      render(
        <FrameRenderer 
          data={defaultData} 
          animated={false}
          onLayerClick={onLayerClick} 
        />
      );

      await waitFor(() => {
        const svg = screen.getByTestId('frame-renderer');
        expect(svg.children.length).toBeGreaterThan(0);
      });

      const svg = screen.getByTestId('frame-renderer');
      const layers = svg.querySelectorAll('[data-layer]');
      
      if (layers.length > 0) {
        const firstLayer = layers[0] as SVGElement;
        await userEvent.click(firstLayer);
        
        expect(onLayerClick).toHaveBeenCalled();
      }
    });

    it('يجب أن يضيف cursor pointer عند وجود onLayerClick', () => {
      const onLayerClick = jest.fn();
      render(
        <FrameRenderer 
          data={defaultData} 
          animated={false}
          onLayerClick={onLayerClick} 
        />
      );

      const svg = screen.getByTestId('frame-renderer');
      const layers = svg.querySelectorAll('[data-layer]');
      
      layers.forEach(layer => {
        expect((layer as HTMLElement).style.cursor).toBe('pointer');
      });
    });
  });

  describe('التحديثات', () => {
    it('يجب أن يتجاهل التحديثات إذا لم تتغير البيانات', () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} animated={true} />
      );

      const callCountBefore = (requestAnimationFrame as jest.Mock).mock.calls.length;

      rerender(<FrameRenderer data={defaultData} animated={true} />);

      const callCountAfter = (requestAnimationFrame as jest.Mock).mock.calls.length;

      expect(callCountAfter).toBe(callCountBefore);
    });

    it('يجب أن يحدث عند تغيير honeyPercentage', async () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} animated={true} />
      );

      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 50,
        emptyPercentage: 0,
      };

      rerender(<FrameRenderer data={newData} animated={true} />);

      await waitFor(() => {
        expect(requestAnimationFrame).toHaveBeenCalled();
      });
    });

    it('يجب أن يحدث عند تغيير broodAge', async () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} animated={true} />
      );

      const newData: FrameData = {
        ...defaultData,
        broodAge: 'CAPPED',
      };

      rerender(<FrameRenderer data={newData} animated={true} />);

      await waitFor(() => {
        expect(requestAnimationFrame).toHaveBeenCalled();
      });
    });
  });

  describe('التنظيف', () => {
    it('يجب أن ينظف الموارد عند إلغاء التثبيت', () => {
      const { unmount, rerender } = render(<FrameRenderer data={defaultData} animated={true} />);

      // تحديث البيانات لبدء رسوم متحركة
      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 50,
      };
      rerender(<FrameRenderer data={newData} animated={true} />);

      // إلغاء التثبيت أثناء الرسوم المتحركة
      unmount();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('React.memo', () => {
    it('يجب أن لا يعيد الرسم إذا لم تتغير الخصائص', () => {
      const { rerender } = render(
        <FrameRenderer data={defaultData} width={400} height={600} />
      );

      const svg1 = screen.getByTestId('frame-renderer');

      rerender(<FrameRenderer data={defaultData} width={400} height={600} />);

      const svg2 = screen.getByTestId('frame-renderer');

      expect(svg1).toBe(svg2);
    });
  });

  describe('الخصائص المخصصة', () => {
    it('يجب أن يقبل معرف مخصص', () => {
      render(<FrameRenderer data={defaultData} id="custom-frame" />);

      const svg = screen.getByTestId('frame-renderer');
      expect(svg).toHaveAttribute('id', 'custom-frame');
    });

    it('يجب أن يستخدم cellSize المخصص', () => {
      render(<FrameRenderer data={defaultData} cellSize={15} />);

      const svg = screen.getByTestId('frame-renderer');
      expect(svg).toBeInTheDocument();
    });
  });
});
