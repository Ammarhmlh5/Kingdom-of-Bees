/**
 * Platform adapter tests
 */

import { webAdapter } from './web';
import { nativeAdapter } from './native';
import { getPlatformAdapter } from './index';

describe('Platform Adapters', () => {
  describe('Web Adapter', () => {
    it('should have correct platform type', () => {
      expect(webAdapter.platform).toBe('web');
    });

    it('should have SVG components', () => {
      expect(webAdapter.SVG).toBeDefined();
      expect(webAdapter.SVGPath).toBeDefined();
      expect(webAdapter.SVGCircle).toBeDefined();
      expect(webAdapter.SVGRect).toBeDefined();
    });

    it('should have gesture handler creator', () => {
      expect(webAdapter.createGestureHandler).toBeDefined();
      expect(typeof webAdapter.createGestureHandler).toBe('function');
    });

    it('should have storage adapter', () => {
      expect(webAdapter.storage).toBeDefined();
      expect(webAdapter.storage.getItem).toBeDefined();
      expect(webAdapter.storage.setItem).toBeDefined();
      expect(webAdapter.storage.removeItem).toBeDefined();
    });

    it('should have haptic adapter', () => {
      expect(webAdapter.haptic).toBeDefined();
      expect(webAdapter.haptic.impact).toBeDefined();
      expect(webAdapter.haptic.notification).toBeDefined();
      expect(webAdapter.haptic.selection).toBeDefined();
    });

    it('should have animation functions', () => {
      expect(webAdapter.requestAnimationFrame).toBeDefined();
      expect(webAdapter.cancelAnimationFrame).toBeDefined();
    });

    it('should create gesture handlers with mouse and touch events', () => {
      const handler = {
        onStart: jest.fn(),
        onMove: jest.fn(),
        onEnd: jest.fn(),
      };

      const gestureHandlers = webAdapter.createGestureHandler(handler);

      expect(gestureHandlers.onMouseDown).toBeDefined();
      expect(gestureHandlers.onMouseMove).toBeDefined();
      expect(gestureHandlers.onMouseUp).toBeDefined();
      expect(gestureHandlers.onTouchStart).toBeDefined();
      expect(gestureHandlers.onTouchMove).toBeDefined();
      expect(gestureHandlers.onTouchEnd).toBeDefined();
    });
  });

  describe('Native Adapter', () => {
    it('should have correct platform type', () => {
      expect(nativeAdapter.platform).toBe('native');
    });

    it('should have SVG components (placeholder)', () => {
      expect(nativeAdapter.SVG).toBeDefined();
      expect(nativeAdapter.SVGPath).toBeDefined();
      expect(nativeAdapter.SVGCircle).toBeDefined();
      expect(nativeAdapter.SVGRect).toBeDefined();
    });

    it('should have gesture handler creator (placeholder)', () => {
      expect(nativeAdapter.createGestureHandler).toBeDefined();
      expect(typeof nativeAdapter.createGestureHandler).toBe('function');
    });

    it('should have storage adapter (placeholder)', () => {
      expect(nativeAdapter.storage).toBeDefined();
      expect(nativeAdapter.storage.getItem).toBeDefined();
      expect(nativeAdapter.storage.setItem).toBeDefined();
      expect(nativeAdapter.storage.removeItem).toBeDefined();
    });

    it('should have haptic adapter (placeholder)', () => {
      expect(nativeAdapter.haptic).toBeDefined();
      expect(nativeAdapter.haptic.impact).toBeDefined();
      expect(nativeAdapter.haptic.notification).toBeDefined();
      expect(nativeAdapter.haptic.selection).toBeDefined();
    });

    it('should have animation functions', () => {
      expect(nativeAdapter.requestAnimationFrame).toBeDefined();
      expect(nativeAdapter.cancelAnimationFrame).toBeDefined();
    });
  });

  describe('Platform Detection', () => {
    it('should detect web platform by default', () => {
      const adapter = getPlatformAdapter();
      expect(adapter.platform).toBe('web');
    });

    it('should provide consistent interface across platforms', () => {
      const webKeys = Object.keys(webAdapter).sort();
      const nativeKeys = Object.keys(nativeAdapter).sort();
      
      expect(webKeys).toEqual(nativeKeys);
    });
  });

  describe('Storage Adapter', () => {
    it('should store and retrieve data on web', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await webAdapter.storage.setItem(key, value);
      const retrieved = await webAdapter.storage.getItem(key);

      expect(retrieved).toBe(value);

      await webAdapter.storage.removeItem(key);
      const afterRemove = await webAdapter.storage.getItem(key);

      expect(afterRemove).toBeNull();
    });
  });

  describe('Haptic Adapter', () => {
    it('should not throw errors when calling haptic methods', () => {
      expect(() => webAdapter.haptic.impact('light')).not.toThrow();
      expect(() => webAdapter.haptic.notification('success')).not.toThrow();
      expect(() => webAdapter.haptic.selection()).not.toThrow();
    });
  });

  describe('Animation Functions', () => {
    it('should request and cancel animation frames', (done) => {
      let called = false;
      
      const id = webAdapter.requestAnimationFrame(() => {
        called = true;
        done();
      });

      expect(typeof id).toBe('number');
      expect(called).toBe(false);
    });

    it('should cancel animation frames', () => {
      const callback = jest.fn();
      const id = webAdapter.requestAnimationFrame(callback);
      
      webAdapter.cancelAnimationFrame(id);
      
      // Wait a bit to ensure callback is not called
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 50);
    });
  });
});
