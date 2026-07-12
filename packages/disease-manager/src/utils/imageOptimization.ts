/**
 * Image Optimization Utilities
 * 
 * هذا الملف يوفر أدوات لتحسين الصور (ضغط، تغيير الحجم، تحويل الصيغة)
 * لتحسين الأداء وتقليل استهلاك البيانات.
 */

/**
 * خيارات تحسين الصور
 */
export interface ImageOptimizationOptions {
  /**
   * الحد الأقصى للعرض (بالبكسل)
   */
  maxWidth?: number;

  /**
   * الحد الأقصى للارتفاع (بالبكسل)
   */
  maxHeight?: number;

  /**
   * جودة الصورة (0-1)
   * 0.8 = جودة جيدة مع ضغط معقول
   */
  quality?: number;

  /**
   * صيغة الإخراج
   */
  format?: 'jpeg' | 'png' | 'webp';

  /**
   * الحفاظ على نسبة العرض إلى الارتفاع
   */
  maintainAspectRatio?: boolean;
}

/**
 * معلومات الصورة
 */
export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
  aspectRatio: number;
}

/**
 * نتيجة التحسين
 */
export interface OptimizationResult {
  blob: Blob;
  dataUrl: string;
  info: ImageInfo;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * ضغط وتحسين صورة
 * 
 * @param file - ملف الصورة
 * @param options - خيارات التحسين
 * @returns Promise بنتيجة التحسين
 * 
 * @example
 * ```typescript
 * const result = await optimizeImage(file, {
 *   maxWidth: 1200,
 *   quality: 0.8,
 *   format: 'webp'
 * });
 * console.log(`Compressed from ${result.originalSize} to ${result.optimizedSize}`);
 * ```
 */
export async function optimizeImage(
  file: File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    maintainAspectRatio = true,
  } = options;

  // قراءة الصورة
  const img = await loadImage(file);
  const originalSize = file.size;

  // حساب الأبعاد الجديدة
  let { width, height } = calculateDimensions(
    img.width,
    img.height,
    maxWidth,
    maxHeight,
    maintainAspectRatio
  );

  // إنشاء canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // رسم الصورة المصغرة
  ctx.drawImage(img, 0, 0, width, height);

  // تحويل إلى blob
  const mimeType = `image/${format}`;
  const blob = await canvasToBlob(canvas, mimeType, quality);

  // تحويل إلى data URL
  const dataUrl = await blobToDataUrl(blob);

  // معلومات الصورة
  const info: ImageInfo = {
    width,
    height,
    size: blob.size,
    format,
    aspectRatio: width / height,
  };

  return {
    blob,
    dataUrl,
    info,
    originalSize,
    optimizedSize: blob.size,
    compressionRatio: originalSize / blob.size,
  };
}

/**
 * تحميل صورة من ملف
 * 
 * @param file - ملف الصورة
 * @returns Promise بعنصر الصورة
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * حساب الأبعاد الجديدة
 * 
 * @param originalWidth - العرض الأصلي
 * @param originalHeight - الارتفاع الأصلي
 * @param maxWidth - الحد الأقصى للعرض
 * @param maxHeight - الحد الأقصى للارتفاع
 * @param maintainAspectRatio - الحفاظ على نسبة العرض إلى الارتفاع
 * @returns الأبعاد الجديدة
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight),
    };
  }

  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // تصغير حسب العرض
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // تصغير حسب الارتفاع
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * تحويل canvas إلى blob
 * 
 * @param canvas - عنصر canvas
 * @param mimeType - نوع MIME
 * @param quality - الجودة
 * @returns Promise بـ blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * تحويل blob إلى data URL
 * 
 * @param blob - blob
 * @returns Promise بـ data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read blob'));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * الحصول على معلومات الصورة
 * 
 * @param file - ملف الصورة
 * @returns Promise بمعلومات الصورة
 * 
 * @example
 * ```typescript
 * const info = await getImageInfo(file);
 * console.log(`Image: ${info.width}x${info.height}, ${info.size} bytes`);
 * ```
 */
export async function getImageInfo(file: File | Blob): Promise<ImageInfo> {
  const img = await loadImage(file);

  return {
    width: img.width,
    height: img.height,
    size: file.size,
    format: file.type.split('/')[1] || 'unknown',
    aspectRatio: img.width / img.height,
  };
}

/**
 * إنشاء thumbnail (صورة مصغرة)
 * 
 * @param file - ملف الصورة
 * @param size - حجم الـ thumbnail (عرض وارتفاع متساويان)
 * @returns Promise بنتيجة التحسين
 * 
 * @example
 * ```typescript
 * const thumbnail = await createThumbnail(file, 200);
 * ```
 */
export async function createThumbnail(
  file: File | Blob,
  size: number = 200
): Promise<OptimizationResult> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
    maintainAspectRatio: true,
  });
}

/**
 * Batch optimization للصور المتعددة
 * 
 * @param files - قائمة ملفات الصور
 * @param options - خيارات التحسين
 * @param onProgress - callback للتقدم
 * @returns Promise بنتائج التحسين
 * 
 * @example
 * ```typescript
 * const results = await batchOptimizeImages(files, {
 *   maxWidth: 1200,
 *   quality: 0.8
 * }, (current, total) => {
 *   console.log(`Processing ${current}/${total}`);
 * });
 * ```
 */
export async function batchOptimizeImages(
  files: (File | Blob)[],
  options: ImageOptimizationOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await optimizeImage(files[i], options);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
}

/**
 * التحقق من دعم WebP
 * 
 * @returns true إذا كان المتصفح يدعم WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * اختيار أفضل صيغة للصورة
 * 
 * @returns أفضل صيغة مدعومة
 */
export function getBestImageFormat(): 'webp' | 'jpeg' {
  return supportsWebP() ? 'webp' : 'jpeg';
}

/**
 * Image Optimizer Class
 * فئة لإدارة تحسين الصور مع cache
 */
export class ImageOptimizer {
  private cache: Map<string, OptimizationResult> = new Map();
  private defaultOptions: ImageOptimizationOptions;

  constructor(defaultOptions: ImageOptimizationOptions = {}) {
    this.defaultOptions = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: getBestImageFormat(),
      maintainAspectRatio: true,
      ...defaultOptions,
    };
  }

  /**
   * تحسين صورة مع cache
   * 
   * @param file - ملف الصورة
   * @param options - خيارات التحسين
   * @returns Promise بنتيجة التحسين
   */
  async optimize(
    file: File | Blob,
    options?: ImageOptimizationOptions
  ): Promise<OptimizationResult> {
    // إنشاء مفتاح cache
    const cacheKey = await this.getCacheKey(file);

    // التحقق من cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // تحسين الصورة
    const result = await optimizeImage(file, {
      ...this.defaultOptions,
      ...options,
    });

    // حفظ في cache
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * إنشاء مفتاح cache للصورة
   * 
   * @param file - ملف الصورة
   * @returns Promise بمفتاح cache
   */
  private async getCacheKey(file: File | Blob): Promise<string> {
    // استخدام حجم الملف ونوعه كمفتاح بسيط
    // في الإنتاج، يمكن استخدام hash للمحتوى
    return `${file.size}-${file.type}`;
  }

  /**
   * مسح cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * الحصول على حجم cache
   * 
   * @returns عدد الصور في cache
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * مثيل عام لـ ImageOptimizer
 */
export const imageOptimizer = new ImageOptimizer();
