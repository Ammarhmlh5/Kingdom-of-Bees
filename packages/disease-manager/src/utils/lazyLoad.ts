/**
 * Lazy Loading Utilities
 * 
 * هذا الملف يوفر أدوات لتحميل المكونات والموارد بشكل كسول (Lazy Loading)
 * لتحسين الأداء وتقليل حجم الحزمة الأولية.
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * خيارات Lazy Loading
 */
export interface LazyLoadOptions {
  /**
   * مدة التأخير قبل التحميل (بالميلي ثانية)
   * مفيد لتجنب التحميل الفوري للمكونات
   */
  delay?: number;

  /**
   * عدد المحاولات عند الفشل
   */
  retries?: number;

  /**
   * مدة الانتظار بين المحاولات (بالميلي ثانية)
   */
  retryDelay?: number;
}

/**
 * تحميل كسول للمكونات مع دعم إعادة المحاولة
 * 
 * @param importFunc - دالة الاستيراد الديناميكي
 * @param options - خيارات التحميل
 * @returns مكون React كسول
 * 
 * @example
 * ```typescript
 * const DiseaseList = lazyLoadComponent(
 *   () => import('./components/DiseaseList'),
 *   { retries: 3, retryDelay: 1000 }
 * );
 * ```
 */
export function lazyLoadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { delay = 0, retries = 3, retryDelay = 1000 } = options;

  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0;

      const attemptLoad = async () => {
        try {
          // تأخير اختياري
          if (delay > 0) {
            await new Promise((r) => setTimeout(r, delay));
          }

          // محاولة التحميل
          const module = await importFunc();
          resolve(module);
        } catch (error) {
          attempts++;

          if (attempts < retries) {
            // إعادة المحاولة بعد تأخير
            setTimeout(attemptLoad, retryDelay);
          } else {
            // فشل بعد جميع المحاولات
            reject(error);
          }
        }
      };

      attemptLoad();
    });
  });
}

/**
 * تحميل كسول لموديول JavaScript
 * 
 * @param importFunc - دالة الاستيراد الديناميكي
 * @param options - خيارات التحميل
 * @returns Promise بالموديول
 * 
 * @example
 * ```typescript
 * const module = await lazyLoadModule(
 *   () => import('./utils/heavyModule'),
 *   { retries: 2 }
 * );
 * ```
 */
export async function lazyLoadModule<T>(
  importFunc: () => Promise<T>,
  options: LazyLoadOptions = {}
): Promise<T> {
  const { delay = 0, retries = 3, retryDelay = 1000 } = options;

  let attempts = 0;

  while (attempts < retries) {
    try {
      // تأخير اختياري
      if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }

      // محاولة التحميل
      return await importFunc();
    } catch (error) {
      attempts++;

      if (attempts >= retries) {
        throw error;
      }

      // انتظار قبل إعادة المحاولة
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }

  throw new Error('Failed to load module after all retries');
}

/**
 * تحميل كسول للصور
 * 
 * @param src - مصدر الصورة
 * @param options - خيارات التحميل
 * @returns Promise بعنصر الصورة
 * 
 * @example
 * ```typescript
 * const img = await lazyLoadImage('/path/to/image.jpg');
 * ```
 */
export function lazyLoadImage(
  src: string,
  options: LazyLoadOptions = {}
): Promise<HTMLImageElement> {
  const { delay = 0, retries = 3, retryDelay = 1000 } = options;

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attemptLoad = () => {
      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        attempts++;

        if (attempts < retries) {
          setTimeout(attemptLoad, retryDelay);
        } else {
          reject(new Error(`Failed to load image: ${src}`));
        }
      };

      // تأخير اختياري
      if (delay > 0) {
        setTimeout(() => {
          img.src = src;
        }, delay);
      } else {
        img.src = src;
      }
    };

    attemptLoad();
  });
}

/**
 * Preload للموارد المهمة
 * 
 * @param resources - قائمة الموارد للتحميل المسبق
 * @returns Promise بجميع الموارد المحملة
 * 
 * @example
 * ```typescript
 * await preloadResources([
 *   { type: 'image', src: '/logo.png' },
 *   { type: 'script', src: '/analytics.js' },
 * ]);
 * ```
 */
export interface PreloadResource {
  type: 'image' | 'script' | 'style' | 'font';
  src: string;
  crossOrigin?: string;
}

export async function preloadResources(
  resources: PreloadResource[]
): Promise<void[]> {
  const promises = resources.map((resource) => {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.type === 'image' ? 'image' : resource.type;
      link.href = resource.src;

      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload: ${resource.src}`));

      document.head.appendChild(link);
    });
  });

  return Promise.all(promises);
}

/**
 * Code Splitting Helper
 * يساعد في تقسيم الكود إلى chunks صغيرة
 */
export class CodeSplitter {
  private loadedChunks: Set<string> = new Set();

  /**
   * تحميل chunk معين
   * 
   * @param chunkName - اسم الـ chunk
   * @param importFunc - دالة الاستيراد
   * @returns Promise بالموديول
   */
  async loadChunk<T>(
    chunkName: string,
    importFunc: () => Promise<T>
  ): Promise<T> {
    // إذا كان محملاً مسبقاً، لا نحمله مرة أخرى
    if (this.loadedChunks.has(chunkName)) {
      return importFunc();
    }

    try {
      const module = await importFunc();
      this.loadedChunks.add(chunkName);
      return module;
    } catch (error) {
      console.error(`Failed to load chunk: ${chunkName}`, error);
      throw error;
    }
  }

  /**
   * التحقق من تحميل chunk
   * 
   * @param chunkName - اسم الـ chunk
   * @returns true إذا كان محملاً
   */
  isChunkLoaded(chunkName: string): boolean {
    return this.loadedChunks.has(chunkName);
  }

  /**
   * إعادة تعيين الحالة
   */
  reset(): void {
    this.loadedChunks.clear();
  }
}

/**
 * مثيل عام لـ CodeSplitter
 */
export const codeSplitter = new CodeSplitter();
