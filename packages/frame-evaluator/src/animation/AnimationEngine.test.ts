/**
 * اختبارات محرك الرسوم المتحركة (Animation Engine Tests)
 */

import { AnimationEngine, Easing, EasingFunction } from './AnimationEngine';

// Mock requestAnimationFrame و cancelAnimationFrame
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

// دالة مساعدة لتشغيل الإطارات
function runAnimationFrames(count: number, timeStep: number = 16) {
  let currentTime = 0;
  for (let i = 0; i < count; i++) {
    currentTime += timeStep;
    const callbacks = Array.from(animationFrameCallbacks.values());
    animationFrameCallbacks.clear();
    callbacks.forEach(callback => callback(currentTime));
  }
}

describe('AnimationEngine', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    animationFrameId = 0;
    animationFrameCallbacks.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    engine.stop();
  });

  describe('animate - أرقام', () => {
    it('يجب أن يحرك رقم من 0 إلى 100', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value));

      engine.animate(0, 100, callback, { duration: 300, easing: 'linear' });

      // تشغيل الإطارات (300ms / 16ms ≈ 19 إطار)
      runAnimationFrames(20);

      expect(callback).toHaveBeenCalled();
      expect(values.length).toBeGreaterThan(0);
      expect(values[values.length - 1]).toBe(100);
    });

    it('يجب أن يحرك رقم من 50 إلى 25', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value));

      engine.animate(50, 25, callback, { duration: 300, easing: 'linear' });

      runAnimationFrames(20);

      expect(values[values.length - 1]).toBe(25);
      expect(values[0]).toBeGreaterThan(25);
    });
  });

  describe('animate - ألوان', () => {
    it('يجب أن يحرك لون من الأبيض إلى الأسود', () => {
      const values: string[] = [];
      const callback = jest.fn((value) => values.push(value as string));

      engine.animate('#ffffff', '#000000', callback, { duration: 300, easing: 'linear' });

      runAnimationFrames(20);

      expect(values.length).toBeGreaterThan(0);
      expect(values[values.length - 1]).toBe('#000000');
      expect(values[0]).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('يجب أن يحرك لون من الأحمر إلى الأزرق', () => {
      const values: string[] = [];
      const callback = jest.fn((value) => values.push(value as string));

      engine.animate('#ff0000', '#0000ff', callback, { duration: 300, easing: 'linear' });

      runAnimationFrames(20);

      expect(values[values.length - 1]).toBe('#0000ff');
    });
  });

  describe('animate - كائنات', () => {
    it('يجب أن يحرك كائن بخصائص متعددة', () => {
      const values: any[] = [];
      const callback = jest.fn((value) => values.push(value));

      const from = { x: 0, y: 0, scale: 1 };
      const to = { x: 100, y: 50, scale: 2 };

      engine.animate(from, to, callback, { duration: 300, easing: 'linear' });

      runAnimationFrames(20);

      expect(values.length).toBeGreaterThan(0);
      const lastValue = values[values.length - 1];
      expect(lastValue.x).toBe(100);
      expect(lastValue.y).toBe(50);
      expect(lastValue.scale).toBe(2);
    });
  });

  describe('easing functions', () => {
    it('يجب أن يطبق linear easing', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value as number));

      engine.animate(0, 100, callback, { duration: 100, easing: 'linear' });

      runAnimationFrames(10);

      // linear يجب أن يكون تقدم خطي
      const midValue = values[Math.floor(values.length / 2)];
      expect(midValue).toBeGreaterThan(30);
      expect(midValue).toBeLessThan(70);
    });

    it('يجب أن يطبق easeIn easing', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value as number));

      engine.animate(0, 100, callback, { duration: 100, easing: 'easeIn' });

      runAnimationFrames(10);

      // easeIn يبدأ ببطء
      expect(values[1]).toBeLessThan(20);
    });

    it('يجب أن يطبق easeOut easing', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value as number));

      engine.animate(0, 100, callback, { duration: 100, easing: 'easeOut' });

      runAnimationFrames(10);

      // easeOut يبدأ بسرعة
      expect(values[1]).toBeGreaterThan(10);
    });

    it('يجب أن يطبق easeInOut easing', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value as number));

      engine.animate(0, 100, callback, { duration: 100, easing: 'easeInOut' });

      runAnimationFrames(10);

      expect(values.length).toBeGreaterThan(0);
    });

    it('يجب أن يقبل دالة easing مخصصة', () => {
      const values: number[] = [];
      const callback = jest.fn((value) => values.push(value as number));
      const customEasing: EasingFunction = (t) => t * t; // quadratic

      engine.animate(0, 100, callback, { duration: 100, easing: customEasing });

      runAnimationFrames(10);

      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('lifecycle callbacks', () => {
    it('يجب أن يستدعي onStart عند بداية الرسوم المتحركة', () => {
      const onStart = jest.fn();
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100, onStart });

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يستدعي onUpdate عند كل إطار', () => {
      const onUpdate = jest.fn();
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100, onUpdate });

      runAnimationFrames(5);

      expect(onUpdate).toHaveBeenCalled();
      expect(onUpdate.mock.calls.length).toBeGreaterThan(0);
    });

    it('يجب أن يستدعي onComplete عند انتهاء الرسوم المتحركة', () => {
      const onComplete = jest.fn();
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100, onComplete });

      runAnimationFrames(10);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يمرر progress صحيح إلى onUpdate', () => {
      const onUpdate = jest.fn();
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100, onUpdate });

      runAnimationFrames(10);

      const progressValues = onUpdate.mock.calls.map(call => call[0]);
      expect(progressValues[progressValues.length - 1]).toBe(1);
    });
  });

  describe('stop', () => {
    it('يجب أن يوقف الرسوم المتحركة', () => {
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100 });

      runAnimationFrames(2);
      const callCountBefore = callback.mock.calls.length;

      engine.stop();

      runAnimationFrames(5);
      const callCountAfter = callback.mock.calls.length;

      expect(callCountAfter).toBe(callCountBefore);
    });

    it('يجب أن يستدعي cancelAnimationFrame', () => {
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100 });

      engine.stop();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('isAnimating', () => {
    it('يجب أن يرجع true أثناء الرسوم المتحركة', () => {
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100 });

      expect(engine.isAnimating()).toBe(true);
    });

    it('يجب أن يرجع false بعد انتهاء الرسوم المتحركة', () => {
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100 });

      runAnimationFrames(10);

      expect(engine.isAnimating()).toBe(false);
    });

    it('يجب أن يرجع false بعد إيقاف الرسوم المتحركة', () => {
      const callback = jest.fn();

      engine.animate(0, 100, callback, { duration: 100 });

      engine.stop();

      expect(engine.isAnimating()).toBe(false);
    });
  });

  describe('animateMultiple', () => {
    it('يجب أن يحرك عدة قيم في نفس الوقت', () => {
      const values1: number[] = [];
      const values2: number[] = [];
      const values3: number[] = [];

      engine.animateMultiple([
        { from: 0, to: 100, callback: (v) => values1.push(v as number) },
        { from: 50, to: 150, callback: (v) => values2.push(v as number) },
        { from: 100, to: 0, callback: (v) => values3.push(v as number) },
      ], { duration: 300 });

      runAnimationFrames(20);

      expect(values1[values1.length - 1]).toBe(100);
      expect(values2[values2.length - 1]).toBe(150);
      expect(values3[values3.length - 1]).toBe(0);
    });

    it('يجب أن يستدعي onComplete مرة واحدة فقط', () => {
      const onComplete = jest.fn();

      engine.animateMultiple([
        { from: 0, to: 100, callback: jest.fn() },
        { from: 50, to: 150, callback: jest.fn() },
      ], { duration: 100, onComplete });

      runAnimationFrames(10);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يطبق نفس easing على جميع القيم', () => {
      const values1: number[] = [];
      const values2: number[] = [];

      engine.animateMultiple([
        { from: 0, to: 100, callback: (v) => values1.push(v as number) },
        { from: 0, to: 200, callback: (v) => values2.push(v as number) },
      ], { duration: 100, easing: 'linear' });

      runAnimationFrames(10);

      // النسبة يجب أن تكون متساوية
      const ratio1 = values1[5] / 100;
      const ratio2 = values2[5] / 200;
      expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.01);
    });
  });

  describe('duration', () => {
    it('يجب أن يستخدم المدة الافتراضية (300ms)', () => {
      const callback = jest.fn();
      const onComplete = jest.fn();

      engine.animate(0, 100, callback, { onComplete });

      // 300ms / 16ms ≈ 19 إطار
      runAnimationFrames(25);

      expect(onComplete).toHaveBeenCalled();
      expect(engine.isAnimating()).toBe(false);
    });

    it('يجب أن يحترم المدة المخصصة', () => {
      const callback = jest.fn();
      const onComplete = jest.fn();

      engine.animate(0, 100, callback, { duration: 100, onComplete });

      // 100ms / 16ms ≈ 7 إطارات
      runAnimationFrames(15);

      expect(onComplete).toHaveBeenCalled();
      expect(engine.isAnimating()).toBe(false);
    });
  });

  describe('إيقاف وبدء رسوم متحركة جديدة', () => {
    it('يجب أن يوقف الرسوم المتحركة السابقة عند بدء رسوم جديدة', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      engine.animate(0, 100, callback1, { duration: 100 });

      runAnimationFrames(2);
      const count1 = callback1.mock.calls.length;

      engine.animate(0, 50, callback2, { duration: 100 });

      runAnimationFrames(5);

      // callback1 يجب أن لا يستدعى بعد بدء الرسوم الجديدة
      expect(callback1.mock.calls.length).toBe(count1);
      expect(callback2).toHaveBeenCalled();
    });
  });
});

describe('Easing helper object', () => {
  it('يجب أن يحتوي على جميع دوال easing', () => {
    expect(Easing.linear).toBeDefined();
    expect(Easing.easeIn).toBeDefined();
    expect(Easing.easeOut).toBeDefined();
    expect(Easing.easeInOut).toBeDefined();
    expect(Easing.easeInQuad).toBeDefined();
    expect(Easing.easeOutQuad).toBeDefined();
    expect(Easing.easeInOutQuad).toBeDefined();
    expect(Easing.easeInCubic).toBeDefined();
    expect(Easing.easeOutCubic).toBeDefined();
    expect(Easing.easeInOutCubic).toBeDefined();
    expect(Easing.easeInQuart).toBeDefined();
    expect(Easing.easeOutQuart).toBeDefined();
    expect(Easing.easeInOutQuart).toBeDefined();
  });

  it('يجب أن تعمل دوال easing بشكل صحيح', () => {
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(1)).toBe(1);

    expect(Easing.easeIn(0)).toBe(0);
    expect(Easing.easeIn(1)).toBe(1);

    expect(Easing.easeOut(0)).toBe(0);
    expect(Easing.easeOut(1)).toBe(1);

    expect(Easing.easeInOut(0)).toBe(0);
    expect(Easing.easeInOut(1)).toBe(1);
  });

  it('يجب أن تعمل دوال easing المتقدمة', () => {
    expect(Easing.easeInSine(0)).toBe(0);
    expect(Easing.easeInSine(1)).toBeCloseTo(1, 5);

    expect(Easing.easeInExpo(0)).toBe(0);
    expect(Easing.easeInExpo(1)).toBeCloseTo(1, 5);

    expect(Easing.easeInCirc(0)).toBe(0);
    expect(Easing.easeInCirc(1)).toBeCloseTo(1, 5);

    expect(Easing.easeInBack(0)).toBe(0);
    expect(Easing.easeInBack(1)).toBeCloseTo(1, 5);

    expect(Easing.easeInElastic(0)).toBe(0);
    expect(Easing.easeInElastic(1)).toBe(1);

    expect(Easing.easeOutBounce(0)).toBe(0);
    expect(Easing.easeOutBounce(1)).toBeCloseTo(1, 5);
  });
});
