/**
 * مولد التدرجات اللونية (Gradient Generator)
 * 
 * مسؤول عن إنشاء تدرجات لونية لطبقات الإطار
 */

/**
 * اتجاه التدرج
 */
export type GradientDirection = 
  | 'horizontal'    // أفقي (من اليسار لليمين)
  | 'vertical'      // عمودي (من الأعلى للأسفل)
  | 'diagonal'      // قطري (من الزاوية العلوية اليسرى للزاوية السفلية اليمنى)
  | 'radial';       // دائري (من المركز للخارج)

/**
 * نقطة توقف في التدرج
 */
export interface GradientStop {
  /** اللون */
  color: string;
  
  /** الموضع (0-100%) */
  offset: number;
  
  /** الشفافية (0-1) */
  opacity?: number;
}

/**
 * تعريف التدرج
 */
export interface GradientDefinition {
  /** معرف فريد للتدرج */
  id: string;
  
  /** نقاط التوقف */
  stops: GradientStop[];
  
  /** الاتجاه */
  direction: GradientDirection;
  
  /** إحداثيات البداية (للتدرج الخطي) */
  x1?: number;
  y1?: number;
  
  /** إحداثيات النهاية (للتدرج الخطي) */
  x2?: number;
  y2?: number;
  
  /** إحداثيات المركز (للتدرج الدائري) */
  cx?: number;
  cy?: number;
  
  /** نصف القطر (للتدرج الدائري) */
  r?: number;
}

/**
 * فئة مولد التدرجات اللونية
 */
export class GradientGenerator {
  /**
   * إنشاء تدرج لوني بسيط بين لونين
   */
  static createSimpleGradient(
    id: string,
    startColor: string,
    endColor: string,
    direction: GradientDirection = 'horizontal'
  ): GradientDefinition {
    const stops: GradientStop[] = [
      { color: startColor, offset: 0 },
      { color: endColor, offset: 100 },
    ];
    
    return this.createGradient(id, stops, direction);
  }
  
  /**
   * إنشاء تدرج لوني متعدد الألوان
   */
  static createMultiColorGradient(
    id: string,
    colors: string[],
    direction: GradientDirection = 'horizontal'
  ): GradientDefinition {
    if (colors.length < 2) {
      throw new Error('يجب توفير لونين على الأقل');
    }
    
    const stops: GradientStop[] = colors.map((color, index) => ({
      color,
      offset: (index / (colors.length - 1)) * 100,
    }));
    
    return this.createGradient(id, stops, direction);
  }
  
  /**
   * إنشاء تدرج لوني مخصص
   */
  static createGradient(
    id: string,
    stops: GradientStop[],
    direction: GradientDirection = 'horizontal'
  ): GradientDefinition {
    const gradient: GradientDefinition = {
      id,
      stops,
      direction,
    };
    
    // تحديد الإحداثيات حسب الاتجاه
    switch (direction) {
      case 'horizontal':
        gradient.x1 = 0;
        gradient.y1 = 0;
        gradient.x2 = 100;
        gradient.y2 = 0;
        break;
        
      case 'vertical':
        gradient.x1 = 0;
        gradient.y1 = 0;
        gradient.x2 = 0;
        gradient.y2 = 100;
        break;
        
      case 'diagonal':
        gradient.x1 = 0;
        gradient.y1 = 0;
        gradient.x2 = 100;
        gradient.y2 = 100;
        break;
        
      case 'radial':
        gradient.cx = 50;
        gradient.cy = 50;
        gradient.r = 50;
        break;
    }
    
    return gradient;
  }
  
  /**
   * إنشاء تدرج العسل (من الفاتح إلى الداكن)
   */
  static createHoneyGradient(id: string = 'honeyGradient'): GradientDefinition {
    return this.createSimpleGradient(
      id,
      '#FEF9C3', // فاتح
      '#FDE047', // داكن
      'vertical'
    );
  }
  
  /**
   * إنشاء تدرج الحضنة حسب العمر
   */
  static createBroodGradient(
    id: string = 'broodGradient',
    broodAge: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED'
  ): GradientDefinition {
    switch (broodAge) {
      case 'EGGS':
        return this.createSimpleGradient(id, '#FFFBEB', '#FEF9C3', 'vertical');
        
      case 'YOUNG_LARVAE':
        return this.createSimpleGradient(id, '#FEF3C7', '#FDE68A', 'vertical');
        
      case 'OLD_LARVAE':
        return this.createSimpleGradient(id, '#FDE68A', '#FCD34D', 'vertical');
        
      case 'CAPPED':
        return this.createSimpleGradient(id, '#D97706', '#B45309', 'vertical');
        
      case 'MIXED':
        return this.createMultiColorGradient(
          id,
          ['#FFFBEB', '#FEF3C7', '#FDE68A', '#D97706'],
          'vertical'
        );
    }
  }
  
  /**
   * إنشاء تدرج خبز النحل (من الفاتح إلى الداكن)
   */
  static createBeeBreadGradient(id: string = 'beeBreadGradient'): GradientDefinition {
    return this.createMultiColorGradient(
      id,
      ['#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C'],
      'vertical'
    );
  }
  
  /**
   * تحويل تدرج إلى SVG linearGradient
   */
  static toSVGLinearGradient(gradient: GradientDefinition): string {
    const { id, stops, x1 = 0, y1 = 0, x2 = 100, y2 = 0 } = gradient;
    
    const stopsStr = stops
      .map((stop) => {
        const opacity = stop.opacity !== undefined ? stop.opacity : 1;
        return `<stop offset="${stop.offset}%" stop-color="${stop.color}" stop-opacity="${opacity}" />`;
      })
      .join('\n    ');
    
    return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
    ${stopsStr}
  </linearGradient>`;
  }
  
  /**
   * تحويل تدرج إلى SVG radialGradient
   */
  static toSVGRadialGradient(gradient: GradientDefinition): string {
    const { id, stops, cx = 50, cy = 50, r = 50 } = gradient;
    
    const stopsStr = stops
      .map((stop) => {
        const opacity = stop.opacity !== undefined ? stop.opacity : 1;
        return `<stop offset="${stop.offset}%" stop-color="${stop.color}" stop-opacity="${opacity}" />`;
      })
      .join('\n    ');
    
    return `<radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="${r}%">
    ${stopsStr}
  </radialGradient>`;
  }
  
  /**
   * تحويل تدرج إلى SVG (تلقائي حسب النوع)
   */
  static toSVG(gradient: GradientDefinition): string {
    if (gradient.direction === 'radial') {
      return this.toSVGRadialGradient(gradient);
    }
    return this.toSVGLinearGradient(gradient);
  }
  
  /**
   * تحويل تدرج إلى CSS
   */
  static toCSS(gradient: GradientDefinition): string {
    const { stops, direction } = gradient;
    
    const stopsStr = stops
      .map((stop) => {
        const opacity = stop.opacity !== undefined ? stop.opacity : 1;
        const color = opacity < 1 
          ? this.hexToRgba(stop.color, opacity)
          : stop.color;
        return `${color} ${stop.offset}%`;
      })
      .join(', ');
    
    if (direction === 'radial') {
      return `radial-gradient(circle, ${stopsStr})`;
    }
    
    const directionMap = {
      horizontal: 'to right',
      vertical: 'to bottom',
      diagonal: 'to bottom right',
      radial: 'circle',
    };
    
    return `linear-gradient(${directionMap[direction]}, ${stopsStr})`;
  }
  
  /**
   * تحويل لون hex إلى rgba
   */
  private static hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * دمج تدرجين لونيين
   */
  static mergeGradients(
    gradient1: GradientDefinition,
    gradient2: GradientDefinition,
    ratio: number = 0.5
  ): GradientDefinition {
    if (gradient1.direction !== gradient2.direction) {
      throw new Error('لا يمكن دمج تدرجات بات اتجاهات مختلفة');
    }
    
    const stops: GradientStop[] = [];
    
    // دمج نقاط التوقف
    const allOffsets = new Set([
      ...gradient1.stops.map(s => s.offset),
      ...gradient2.stops.map(s => s.offset),
    ]);
    
    Array.from(allOffsets).sort((a, b) => a - b).forEach((offset) => {
      const color1 = this.getColorAtOffset(gradient1, offset);
      const color2 = this.getColorAtOffset(gradient2, offset);
      const mergedColor = this.blendColors(color1, color2, ratio);
      
      stops.push({
        color: mergedColor,
        offset,
      });
    });
    
    return {
      id: `${gradient1.id}_${gradient2.id}_merged`,
      stops,
      direction: gradient1.direction,
      x1: gradient1.x1,
      y1: gradient1.y1,
      x2: gradient1.x2,
      y2: gradient1.y2,
      cx: gradient1.cx,
      cy: gradient1.cy,
      r: gradient1.r,
    };
  }
  
  /**
   * الحصول على اللون عند موضع معين في التدرج
   */
  private static getColorAtOffset(gradient: GradientDefinition, offset: number): string {
    const stops = gradient.stops.sort((a, b) => a.offset - b.offset);
    
    // إذا كان الموضع قبل أول نقطة توقف
    if (offset <= stops[0].offset) {
      return stops[0].color;
    }
    
    // إذا كان الموضع بعد آخر نقطة توقف
    if (offset >= stops[stops.length - 1].offset) {
      return stops[stops.length - 1].color;
    }
    
    // إيجاد النقطتين المحيطتين
    for (let i = 0; i < stops.length - 1; i++) {
      if (offset >= stops[i].offset && offset <= stops[i + 1].offset) {
        const ratio = (offset - stops[i].offset) / (stops[i + 1].offset - stops[i].offset);
        return this.blendColors(stops[i].color, stops[i + 1].color, ratio);
      }
    }
    
    return stops[0].color;
  }
  
  /**
   * مزج لونين
   */
  private static blendColors(color1: string, color2: string, ratio: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * إنشاء تدرج عكسي
   */
  static reverseGradient(gradient: GradientDefinition): GradientDefinition {
    return {
      ...gradient,
      id: `${gradient.id}_reversed`,
      stops: gradient.stops.map((stop) => ({
        ...stop,
        offset: 100 - stop.offset,
      })).reverse(),
    };
  }
  
  /**
   * تطبيق شفافية على تدرج
   */
  static applyOpacity(gradient: GradientDefinition, opacity: number): GradientDefinition {
    return {
      ...gradient,
      id: `${gradient.id}_opacity_${opacity}`,
      stops: gradient.stops.map((stop) => ({
        ...stop,
        opacity: (stop.opacity || 1) * opacity,
      })),
    };
  }
}
