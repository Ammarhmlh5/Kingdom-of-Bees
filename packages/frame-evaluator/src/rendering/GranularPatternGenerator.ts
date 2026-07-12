/**
 * مولد الأنماط الحبيبية (Granular Pattern Generator)
 * 
 * يستخدم لتوليد نمط حبيبي لتمثيل خبز النحل (حبوب اللقاح المخزنة)
 * على جوانب الإطار بشكل عشوائي
 */

/**
 * نقطة في الفضاء ثنائي الأبعاد
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * منطقة مستطيلة
 */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * حبة خبز نحل (حبوب لقاح)
 */
export interface Grain {
  /** مركز الحبة */
  center: Point;
  
  /** نصف القطر */
  radius: number;
  
  /** اللون */
  color: string;
  
  /** الشفافية (0-1) */
  opacity: number;
}

/**
 * خيارات توليد النمط الحبيبي
 */
export interface GranularPatternOptions {
  /** الألوان المتاحة */
  colors: string[];
  
  /** نطاق نصف القطر [min, max] */
  radiusRange?: [number, number];
  
  /** نطاق الشفافية [min, max] */
  opacityRange?: [number, number];
  
  /** كثافة الحبوب (عدد الحبوب لكل 100 بكسل مربع) */
  density?: number;
  
  /** الحد الأدنى للمسافة بين الحبوب */
  minDistance?: number;
}

/**
 * فئة مولد الأنماط الحبيبية
 */
export class GranularPatternGenerator {
  private options: Required<GranularPatternOptions>;
  
  constructor(options: GranularPatternOptions) {
    this.options = {
      colors: options.colors,
      radiusRange: options.radiusRange ?? [2, 4],
      opacityRange: options.opacityRange ?? [0.7, 0.9],
      density: options.density ?? 0.5,
      minDistance: options.minDistance ?? 0,
    };
  }
  
  /**
   * توليد نمط حبيبي في منطقة محددة
   */
  generatePattern(area: Area): Grain[] {
    const grains: Grain[] = [];
    
    // حساب عدد الحبوب بناءً على الكثافة
    const areaSize = area.width * area.height;
    const grainCount = Math.floor((areaSize / 100) * this.options.density);
    
    // توليد الحبوب
    for (let i = 0; i < grainCount; i++) {
      const grain = this.generateGrain(area, grains);
      if (grain) {
        grains.push(grain);
      }
    }
    
    return grains;
  }
  
  /**
   * توليد حبة واحدة
   */
  private generateGrain(area: Area, existingGrains: Grain[]): Grain | null {
    const maxAttempts = 10;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const center: Point = {
        x: area.x + Math.random() * area.width,
        y: area.y + Math.random() * area.height,
      };
      
      // التحقق من المسافة الدنيا
      if (this.options.minDistance > 0) {
        const tooClose = existingGrains.some((grain) => {
          const distance = this.calculateDistance(center, grain.center);
          return distance < this.options.minDistance;
        });
        
        if (tooClose) {
          continue;
        }
      }
      
      // إنشاء الحبة
      const radius = this.randomInRange(
        this.options.radiusRange[0],
        this.options.radiusRange[1]
      );
      
      const color = this.randomColor();
      
      const opacity = this.randomInRange(
        this.options.opacityRange[0],
        this.options.opacityRange[1]
      );
      
      return {
        center,
        radius,
        color,
        opacity,
      };
    }
    
    return null;
  }
  
  /**
   * حساب المسافة بين نقطتين
   */
  private calculateDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * اختيار قيمة عشوائية في نطاق
   */
  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
  
  /**
   * اختيار لون عشوائي
   */
  private randomColor(): string {
    const index = Math.floor(Math.random() * this.options.colors.length);
    return this.options.colors[index];
  }
  
  /**
   * تحويل حبة إلى عنصر SVG
   */
  static grainToSVG(grain: Grain): {
    cx: number;
    cy: number;
    r: number;
    fill: string;
    opacity: number;
  } {
    return {
      cx: grain.center.x,
      cy: grain.center.y,
      r: grain.radius,
      fill: grain.color,
      opacity: grain.opacity,
    };
  }
  
  /**
   * حساب إحصائيات النمط
   */
  static calculatePatternStats(grains: Grain[]): {
    total: number;
    averageRadius: number;
    averageOpacity: number;
    colorDistribution: Record<string, number>;
  } {
    if (grains.length === 0) {
      return {
        total: 0,
        averageRadius: 0,
        averageOpacity: 0,
        colorDistribution: {},
      };
    }
    
    const stats = {
      total: grains.length,
      averageRadius: 0,
      averageOpacity: 0,
      colorDistribution: {} as Record<string, number>,
    };
    
    let totalRadius = 0;
    let totalOpacity = 0;
    
    grains.forEach((grain) => {
      totalRadius += grain.radius;
      totalOpacity += grain.opacity;
      
      stats.colorDistribution[grain.color] =
        (stats.colorDistribution[grain.color] || 0) + 1;
    });
    
    stats.averageRadius = totalRadius / grains.length;
    stats.averageOpacity = totalOpacity / grains.length;
    
    return stats;
  }
  
  /**
   * تصفية الحبوب حسب اللون
   */
  static filterByColor(grains: Grain[], color: string): Grain[] {
    return grains.filter((grain) => grain.color === color);
  }
  
  /**
   * تصفية الحبوب حسب نطاق نصف القطر
   */
  static filterByRadiusRange(
    grains: Grain[],
    minRadius: number,
    maxRadius: number
  ): Grain[] {
    return grains.filter(
      (grain) => grain.radius >= minRadius && grain.radius <= maxRadius
    );
  }
  
  /**
   * إيجاد الحبوب في منطقة محددة
   */
  static filterInArea(grains: Grain[], area: Area): Grain[] {
    return grains.filter((grain) => {
      return (
        grain.center.x >= area.x &&
        grain.center.x <= area.x + area.width &&
        grain.center.y >= area.y &&
        grain.center.y <= area.y + area.height
      );
    });
  }
  
  /**
   * تطبيق تدرج شفافية على الحبوب
   */
  static applyOpacityGradient(
    grains: Grain[],
    startOpacity: number,
    endOpacity: number
  ): Grain[] {
    if (grains.length === 0) {
      return grains;
    }
    
    return grains.map((grain, index) => {
      const ratio = index / (grains.length - 1);
      const opacity = startOpacity + (endOpacity - startOpacity) * ratio;
      
      return {
        ...grain,
        opacity,
      };
    });
  }
  
  /**
   * تطبيق تدرج حجم على الحبوب
   */
  static applyRadiusGradient(
    grains: Grain[],
    startRadius: number,
    endRadius: number
  ): Grain[] {
    if (grains.length === 0) {
      return grains;
    }
    
    return grains.map((grain, index) => {
      const ratio = index / (grains.length - 1);
      const radius = startRadius + (endRadius - startRadius) * ratio;
      
      return {
        ...grain,
        radius,
      };
    });
  }
  
  /**
   * دمج عدة أنماط حبيبية
   */
  static mergePatterns(...patterns: Grain[][]): Grain[] {
    return patterns.flat();
  }
  
  /**
   * إزالة الحبوب المتداخلة
   */
  static removeOverlapping(grains: Grain[], minDistance: number): Grain[] {
    const result: Grain[] = [];
    
    grains.forEach((grain) => {
      const overlaps = result.some((existing) => {
        const dx = grain.center.x - existing.center.x;
        const dy = grain.center.y - existing.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance;
      });
      
      if (!overlaps) {
        result.push(grain);
      }
    });
    
    return result;
  }
  
  /**
   * ترتيب الحبوب حسب الحجم
   */
  static sortByRadius(grains: Grain[], ascending: boolean = true): Grain[] {
    return [...grains].sort((a, b) => {
      return ascending ? a.radius - b.radius : b.radius - a.radius;
    });
  }
  
  /**
   * ترتيب الحبوب حسب الموضع (من اليسار لليمين، من الأعلى للأسفل)
   */
  static sortByPosition(grains: Grain[]): Grain[] {
    return [...grains].sort((a, b) => {
      if (Math.abs(a.center.y - b.center.y) < 1) {
        return a.center.x - b.center.x;
      }
      return a.center.y - b.center.y;
    });
  }
  
  /**
   * حساب المساحة الإجمالية المغطاة بالحبوب
   */
  static calculateTotalArea(grains: Grain[]): number {
    return grains.reduce((total, grain) => {
      return total + Math.PI * grain.radius * grain.radius;
    }, 0);
  }
  
  /**
   * حساب نسبة التغطية في منطقة
   */
  static calculateCoverageRatio(grains: Grain[], area: Area): number {
    const totalGrainArea = this.calculateTotalArea(grains);
    const areaSize = area.width * area.height;
    return areaSize > 0 ? totalGrainArea / areaSize : 0;
  }
}
