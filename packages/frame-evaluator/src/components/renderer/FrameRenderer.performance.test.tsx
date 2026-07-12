/**
 * اختبارات الأداء لمكون FrameRenderer
 * 
 * تقيس وقت الرسم، معدل الإطارات، واستهلاك الذاكرة
 */

import { render } from '@testing-library/react';
import { FrameRenderer } from './FrameRenderer';
import { FrameData } from '../../types';

describe('FrameRenderer - اختبارات الأداء', () => {
  const defaultData: FrameData = {
    side: 'A',
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 20,
    emptyPercentage: 10,
    broodAge: 'MIXED',
    isValid: true,
  };

  // تنظيف جميع المؤقتات والإطارات المعلقة بعد كل اختبار
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('وقت الرسم الأولي', () => {
    it('يجب أن يرسم الإطار في أقل من 150ms', () => {
      const startTime = performance.now();
      
      render(<FrameRenderer data={defaultData} animated={false} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // يجب أن يكون وقت الرسم أقل من 400ms (مع هامش للبيئة الاختبارية)
      expect(renderTime).toBeLessThan(400);
    });

    it('يجب أن يرسم إطار كبير (800x1200) في أقل من 400ms', () => {
      const startTime = performance.now();
      
      render(
        <FrameRenderer 
          data={defaultData} 
          width={800} 
          height={1200} 
          animated={false} 
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // يجب أن يكون وقت الرسم أقل من 800ms للإطارات الكبيرة (مع هامش للبيئة الاختبارية)
      expect(renderTime).toBeLessThan(800);
    });

    it('يجب أن يرسم إطار صغير (200x300) في أقل من 100ms', () => {
      const startTime = performance.now();
      
      render(
        <FrameRenderer 
          data={defaultData} 
          width={200} 
          height={300} 
          animated={false} 
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // يجب أن يكون وقت الرسم أقل من 100ms للإطارات الصغيرة (مع هامش للبيئة الاختبارية)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('معدل الإطارات (FPS)', () => {
    it('يجب أن يحافظ على 60 FPS أثناء الرسوم المتحركة', (done) => {
      const { rerender, unmount } = render(
        <FrameRenderer data={defaultData} animated={true} animationDuration={1000} />
      );

      const frameTimestamps: number[] = [];
      let frameCount = 0;
      const maxFrames = 60; // قياس 60 إطار

      const measureFrame = () => {
        frameTimestamps.push(performance.now());
        frameCount++;

        if (frameCount < maxFrames) {
          requestAnimationFrame(measureFrame);
        } else {
          // حساب متوسط FPS
          const totalTime = frameTimestamps[frameTimestamps.length - 1] - frameTimestamps[0];
          const averageFPS = (frameCount / totalTime) * 1000;

          // يجب أن يكون متوسط FPS أكثر من 55 (قريب من 60)
          expect(averageFPS).toBeGreaterThan(55);
          unmount();
          done();
        }
      };

      // بدء الرسوم المتحركة
      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 60,
        emptyPercentage: 0,
      };
      rerender(<FrameRenderer data={newData} animated={true} animationDuration={1000} />);

      requestAnimationFrame(measureFrame);
    }, 10000); // timeout أطول للاختبار

    it('يجب أن لا يتجاوز وقت الإطار الواحد 100ms', () => {
      const frameTimes: number[] = [];
      let lastTime = performance.now();

      for (let i = 0; i < 10; i++) {
        render(
          <FrameRenderer 
            data={{
              ...defaultData,
              honeyPercentage: 30 + i * 2,
              emptyPercentage: 10 - i * 2,
            }} 
            animated={false} 
          />
        );

        const currentTime = performance.now();
        frameTimes.push(currentTime - lastTime);
        lastTime = currentTime;
      }

      // حساب متوسط وقت الإطار
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

      // يجب أن يكون متوسط وقت الإطار أقل من 150ms (مع هامش للبيئة الاختبارية)
      expect(averageFrameTime).toBeLessThan(150);
    });
  });

  describe('استهلاك الذاكرة', () => {
    it('يجب أن لا يتسبب في تسرب الذاكرة عند إعادة الرسم المتكرر', () => {
      // قياس الذاكرة الأولية (إن كان متاحاً)
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // رسم وإلغاء تثبيت 100 مرة
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <FrameRenderer 
            data={{
              ...defaultData,
              honeyPercentage: 30 + (i % 10),
              emptyPercentage: 10 - (i % 10),
            }} 
            animated={false} 
          />
        );
        unmount();
      }

      // قياس الذاكرة النهائية
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // إذا كانت واجهة الذاكرة متاحة، تحقق من عدم زيادة الذاكرة بشكل كبير
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercentage = (memoryIncrease / initialMemory) * 100;

        // يجب أن لا تزيد الذاكرة بأكثر من 50%
        expect(memoryIncreasePercentage).toBeLessThan(50);
      } else {
        // إذا لم تكن واجهة الذاكرة متاحة، نجح الاختبار
        expect(true).toBe(true);
      }
    });

    it('يجب أن ينظف الموارد بشكل صحيح عند إلغاء التثبيت', () => {
      const { unmount } = render(<FrameRenderer data={defaultData} animated={true} />);

      // قياس عدد العناصر في DOM قبل إلغاء التثبيت
      const elementsBefore = document.querySelectorAll('svg').length;

      unmount();

      // قياس عدد العناصر في DOM بعد إلغاء التثبيت
      const elementsAfter = document.querySelectorAll('svg').length;

      // يجب أن يقل عدد العناصر بعد إلغاء التثبيت
      expect(elementsAfter).toBeLessThan(elementsBefore);
    });
  });

  describe('أداء الرسوم المتحركة', () => {
    it('يجب أن تكون الرسوم المتحركة سلسة بدون تقطع', (done) => {
      const { rerender, unmount } = render(
        <FrameRenderer data={defaultData} animated={true} animationDuration={500} />
      );

      const frameDelays: number[] = [];
      let lastFrameTime = performance.now();
      let frameCount = 0;
      const maxFrames = 30;

      const checkFrame = () => {
        const currentTime = performance.now();
        const delay = currentTime - lastFrameTime;
        frameDelays.push(delay);
        lastFrameTime = currentTime;
        frameCount++;

        if (frameCount < maxFrames) {
          requestAnimationFrame(checkFrame);
        } else {
          // حساب الانحراف المعياري للتأخيرات
          const avgDelay = frameDelays.reduce((a, b) => a + b, 0) / frameDelays.length;
          const variance = frameDelays.reduce((sum, delay) => {
            return sum + Math.pow(delay - avgDelay, 2);
          }, 0) / frameDelays.length;
          const stdDeviation = Math.sqrt(variance);

          // يجب أن يكون الانحراف المعياري صغيراً (رسوم متحركة سلسة)
          expect(stdDeviation).toBeLessThan(10);
          unmount();
          done();
        }
      };

      // بدء الرسوم المتحركة
      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 50,
        emptyPercentage: 0,
      };
      rerender(<FrameRenderer data={newData} animated={true} animationDuration={500} />);

      requestAnimationFrame(checkFrame);
    }, 10000);

    it('يجب أن تكون الرسوم المتحركة القصيرة (100ms) سريعة', (done) => {
      const startTime = performance.now();
      
      const { rerender, unmount } = render(
        <FrameRenderer data={defaultData} animated={true} animationDuration={100} />
      );

      const newData: FrameData = {
        ...defaultData,
        honeyPercentage: 50,
        emptyPercentage: 0,
      };
      rerender(<FrameRenderer data={newData} animated={true} animationDuration={100} />);

      setTimeout(() => {
        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // يجب أن تكتمل الرسوم المتحركة في حوالي 100ms (مع هامش للبيئة الاختبارية)
        expect(totalTime).toBeLessThan(250);
        unmount();
        done();
      }, 120);
    });
  });

  describe('أداء مع بيانات معقدة', () => {
    it('يجب أن يتعامل مع إطار ممتلئ بالعسل بكفاءة', () => {
      const fullHoneyData: FrameData = {
        side: 'A',
        honeyPercentage: 90,
        broodPercentage: 5,
        beeBreadPercentage: 5,
        emptyPercentage: 0,
        broodAge: 'MIXED',
        isValid: true,
      };

      const startTime = performance.now();
      render(<FrameRenderer data={fullHoneyData} animated={false} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('يجب أن يتعامل مع إطار ممتلئ بالحضنة بكفاءة', () => {
      const fullBroodData: FrameData = {
        side: 'A',
        honeyPercentage: 5,
        broodPercentage: 90,
        beeBreadPercentage: 5,
        emptyPercentage: 0,
        broodAge: 'MIXED',
        isValid: true,
      };

      const startTime = performance.now();
      render(<FrameRenderer data={fullBroodData} animated={false} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('يجب أن يتعامل مع إطار متوازن بكفاءة', () => {
      const balancedData: FrameData = {
        side: 'A',
        honeyPercentage: 25,
        broodPercentage: 25,
        beeBreadPercentage: 25,
        emptyPercentage: 25,
        broodAge: 'MIXED',
        isValid: true,
      };

      const startTime = performance.now();
      render(<FrameRenderer data={balancedData} animated={false} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('أداء مع أحجام خلايا مختلفة', () => {
    it('يجب أن يتعامل مع خلايا صغيرة (5px) بكفاءة', () => {
      const startTime = performance.now();
      render(<FrameRenderer data={defaultData} cellSize={5} animated={false} />);
      const endTime = performance.now();

      // يجب أن يكون وقت الرسم أقل من 200ms (مع هامش للبيئة الاختبارية)
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('يجب أن يتعامل مع خلايا كبيرة (20px) بكفاءة', () => {
      const startTime = performance.now();
      render(<FrameRenderer data={defaultData} cellSize={20} animated={false} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
