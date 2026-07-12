/**
 * محرك الرسوم المتحركة (Animation Engine)
 * 
 * مسؤول عن تحريك التغييرات بين الحالات بشكل سلس
 */

/**
 * نوع دالة Easing
 */
export type EasingFunction = (t: number) => number;

/**
 * أنواع Easing المدعومة
 */
export type EasingType = 
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart';

/**
 * خيارات الرسوم المتحركة
 */
export interface AnimationOptions {
  /** المدة بالمللي ثانية */
  duration?: number;
  
  /** نوع Easing */
  easing?: EasingType | EasingFunction;
  
  /** دالة تُستدعى عند بداية الرسوم المتحركة */
  onStart?: () => void;
  
  /** دالة تُستدعى عند كل إطار */
  onUpdate?: (progress: number) => void;
  
  /** دالة تُستدعى عند انتهاء الرسوم المتحركة */
  onComplete?: () => void;
  
  /** دالة تُستدعى عند إلغاء الرسوم المتحركة */
  onCancel?: () => void;
}

/**
 * قيمة قابلة للتحريك
 */
export type AnimatableValue = number | string | { [key: string]: number };

/**
 * فئة محرك الرسوم المتحركة
 */
export class AnimationEngine {
  private animationFrame: number | null = null;
  private startTime: number | null = null;
  private isRunning: boolean = false;
  
  /**
   * تحريك قيمة من حالة لأخرى
   */
  animate(
    from: AnimatableValue,
    to: AnimatableValue,
    callback: (value: AnimatableValue) => void,
    options: AnimationOptions = {}
  ): void {
    // إيقاف أي رسوم متحركة جارية
    this.stop();
    
    const {
      duration = 300,
      easing = 'easeInOut',
      onStart,
      onUpdate,
      onComplete,
    } = options;
    
    // الحصول على دالة Easing
    const easingFn = typeof easing === 'function' 
      ? easing 
      : this.getEasingFunction(easing);
    
    // استدعاء onStart
    if (onStart) {
      onStart();
    }
    
    this.isRunning = true;
    this.startTime = null;
    
    const step = (timestamp: number) => {
      if (!this.isRunning) {
        return;
      }
      
      if (this.startTime === null) {
        this.startTime = timestamp;
      }
      
      const elapsed = timestamp - this.startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // تطبيق Easing
      const easedProgress = easingFn(progress);
      
      // حساب القيمة الحالية
      const currentValue = this.interpolate(from, to, easedProgress);
      
      // استدعاء callback
      callback(currentValue);
      
      // استدعاء onUpdate
      if (onUpdate) {
        onUpdate(easedProgress);
      }
      
      // الاستمرار أو الانتهاء
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.isRunning = false;
        this.animationFrame = null;
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    this.animationFrame = requestAnimationFrame(step);
  }
  
  /**
   * إيقاف الرسوم المتحركة
   */
  stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.isRunning = false;
    this.startTime = null;
  }
  
  /**
   * التحقق من وجود رسوم متحركة جارية
   */
  isAnimating(): boolean {
    return this.isRunning;
  }
  
  /**
   * الحصول على دالة Easing
   */
  private getEasingFunction(type: EasingType): EasingFunction {
    switch (type) {
      case 'linear':
        return (t) => t;
        
      case 'easeIn':
      case 'easeInQuad':
        return (t) => t * t;
        
      case 'easeOut':
      case 'easeOutQuad':
        return (t) => t * (2 - t);
        
      case 'easeInOut':
      case 'easeInOutQuad':
        return (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
      case 'easeInCubic':
        return (t) => t * t * t;
        
      case 'easeOutCubic':
        return (t) => (--t) * t * t + 1;
        
      case 'easeInOutCubic':
        return (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        
      case 'easeInQuart':
        return (t) => t * t * t * t;
        
      case 'easeOutQuart':
        return (t) => 1 - (--t) * t * t * t;
        
      case 'easeInOutQuart':
        return (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        
      default:
        return (t) => t;
    }
  }
  
  /**
   * Interpolation بين قيمتين
   */
  private interpolate(from: AnimatableValue, to: AnimatableValue, progress: number): AnimatableValue {
    // رقم
    if (typeof from === 'number' && typeof to === 'number') {
      return from + (to - from) * progress;
    }
    
    // لون (hex)
    if (typeof from === 'string' && typeof to === 'string') {
      if (from.startsWith('#') && to.startsWith('#')) {
        return this.interpolateColor(from, to, progress);
      }
      // نص عادي - إرجاع القيمة النهائية
      return progress < 1 ? from : to;
    }
    
    // كائن
    if (typeof from === 'object' && typeof to === 'object') {
      const result: { [key: string]: number } = {};
      for (const key in from) {
        if (key in to) {
          result[key] = from[key] + (to[key] - from[key]) * progress;
        }
      }
      return result;
    }
    
    // افتراضي
    return progress < 1 ? from : to;
  }
  
  /**
   * Interpolation بين لونين
   */
  private interpolateColor(from: string, to: string, progress: number): string {
    const fromRgb = this.hexToRgb(from);
    const toRgb = this.hexToRgb(to);
    
    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);
    
    return this.rgbToHex(r, g, b);
  }
  
  /**
   * تحويل hex إلى RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }
  
  /**
   * تحويل RGB إلى hex
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  /**
   * تحريك عدة قيم في نفس الوقت
   */
  animateMultiple(
    animations: Array<{
      from: AnimatableValue;
      to: AnimatableValue;
      callback: (value: AnimatableValue) => void;
    }>,
    options: AnimationOptions = {}
  ): void {
    // إيقاف أي رسوم متحركة جارية
    this.stop();
    
    const {
      duration = 300,
      easing = 'easeInOut',
      onStart,
      onUpdate,
      onComplete,
    } = options;
    
    // الحصول على دالة Easing
    const easingFn = typeof easing === 'function' 
      ? easing 
      : this.getEasingFunction(easing);
    
    // استدعاء onStart
    if (onStart) {
      onStart();
    }
    
    this.isRunning = true;
    this.startTime = null;
    
    const step = (timestamp: number) => {
      if (!this.isRunning) {
        return;
      }
      
      if (this.startTime === null) {
        this.startTime = timestamp;
      }
      
      const elapsed = timestamp - this.startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // تطبيق Easing
      const easedProgress = easingFn(progress);
      
      // تحديث جميع القيم
      animations.forEach(({ from, to, callback }) => {
        const currentValue = this.interpolate(from, to, easedProgress);
        callback(currentValue);
      });
      
      // استدعاء onUpdate
      if (onUpdate) {
        onUpdate(easedProgress);
      }
      
      // الاستمرار أو الانتهاء
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.isRunning = false;
        this.animationFrame = null;
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    this.animationFrame = requestAnimationFrame(step);
  }
}

/**
 * دوال Easing المساعدة (يمكن استخدامها مباشرة)
 */
export const Easing = {
  linear: (t: number) => t,
  
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  // دوال إضافية
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  easeOutCirc: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: (t: number) => {
    return t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },
  
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  
  easeInBounce: (t: number) => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number) => {
    return t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;
  },
};
