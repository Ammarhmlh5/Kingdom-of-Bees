import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// تتبع جميع معرفات requestAnimationFrame النشطة
const activeAnimationFrames = new Set<number>();

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  const id = setTimeout(callback, 0) as unknown as number;
  activeAnimationFrames.add(id);
  return id;
};

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
  activeAnimationFrames.delete(id);
};

// Mock performance.now for tests
global.performance = global.performance || {
  now: () => Date.now(),
} as Performance;

// تنظيف شامل بعد كل اختبار
afterEach(() => {
  // إلغاء جميع إطارات الرسوم المتحركة النشطة
  activeAnimationFrames.forEach(id => {
    clearTimeout(id);
  });
  activeAnimationFrames.clear();
  
  // تنظيف جميع المؤقتات
  jest.clearAllTimers();
  
  // تنظيف مكونات React
  cleanup();
  
  // تنظيف DOM
  document.body.innerHTML = '';
  
  // إعادة تعيين جميع mocks
  jest.clearAllMocks();
});
