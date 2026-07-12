/**
 * مولد الأنماط الخلوية (Cellular Pattern Generator)
 * 
 * يستخدم لتوليد نمط خلوي لتمثيل الحضنة في الإطار
 * مع إضافة رموز حسب عمر الحضنة (بيض، مغلقة، إلخ)
 */

import { HexCell } from './HexagonalPatternGenerator';
import { BroodAge } from '../types';

/**
 * نوع الخلية الحضنة
 */
export type CellType = 'empty' | 'egg' | 'larva' | 'pupa' | 'capped';

/**
 * خلية حضنة
 */
export interface BroodCell extends HexCell {
  /** نوع الخلية */
  type: CellType;
  
  /** عمر الحضنة */
  broodAge?: BroodAge;
  
  /** اللون */
  color: string;
  
  /** الرمز (إن وجد) */
  symbol?: string;
}

/**
 * خيارات توليد النمط الخلوي
 */
export interface CellularPatternOptions {
  /** حجم الخلية */
  cellSize: number;
  
  /** عمر الحضنة */
  broodAge: BroodAge;
  
  /** الألوان حسب العمر */
  colors: {
    eggs: string;
    youngLarvae: string;
    oldLarvae: string;
    capped: string;
    mixed: string[];
  };
  
  /** نسبة الخلايا المملوءة (0-1) */
  fillRatio?: number;
  
  /** إضافة رموز للبيض والمغلقة */
  showSymbols?: boolean;
  
  /** حجم الرمز نسبة إلى حجم الخلية */
  symbolSize?: number;
}

/**
 * فئة مولد الأنماط الخلوية
 */
export class CellularPatternGenerator {
  private options: Required<CellularPatternOptions>;
  
  constructor(options: CellularPatternOptions) {
    this.options = {
      cellSize: options.cellSize,
      broodAge: options.broodAge,
      colors: options.colors,
      fillRatio: options.fillRatio ?? 0.95,
      showSymbols: options.showSymbols ?? true,
      symbolSize: options.symbolSize ?? 0.6,
    };
  }
  
  /**
   * توليد نمط خلوي للحضنة
   */
  generatePattern(cells: HexCell[]): BroodCell[] {
    const broodCells: BroodCell[] = [];
    
    cells.forEach((cell, index) => {
      // تحديد ما إذا كانت الخلية مملوءة
      const isFilled = Math.random() < this.options.fillRatio;
      
      if (!isFilled) {
        return;
      }
      
      // تحديد نوع الخلية واللون حسب عمر الحضنة
      const broodCell = this.createBroodCell(cell, index);
      broodCells.push(broodCell);
    });
    
    return broodCells;
  }
  
  /**
   * إنشاء خلية حضنة
   */
  private createBroodCell(cell: HexCell, index: number): BroodCell {
    const broodAge = this.options.broodAge;
    let type: CellType;
    let color: string;
    let symbol: string | undefined;
    
    switch (broodAge) {
      case 'EGGS':
        type = 'egg';
        color = this.options.colors.eggs;
        symbol = this.options.showSymbols ? '⚪' : undefined;
        break;
        
      case 'YOUNG_LARVAE':
        type = 'larva';
        color = this.options.colors.youngLarvae;
        break;
        
      case 'OLD_LARVAE':
        type = 'larva';
        color = this.options.colors.oldLarvae;
        break;
        
      case 'CAPPED':
        type = 'capped';
        color = this.options.colors.capped;
        symbol = this.options.showSymbols ? '●' : undefined;
        break;
        
      case 'MIXED': {
        // للحضنة المختلطة، نوزع الألوان بشكل عشوائي
        const mixedColors = this.options.colors.mixed;
        color = mixedColors[index % mixedColors.length];
        
        // تحديد النوع بشكل عشوائي
        const types: CellType[] = ['egg', 'larva', 'pupa', 'capped'];
        type = types[Math.floor(Math.random() * types.length)];
        
        // إضافة رموز للبيض والمغلقة فقط
        if (this.options.showSymbols) {
          if (type === 'egg') {
            symbol = '⚪';
          } else if (type === 'capped') {
            symbol = '●';
          }
        }
        break;
      }
        
      default:
        type = 'empty';
        color = '#F5F5DC';
    }
    
    return {
      ...cell,
      type,
      broodAge,
      color,
      symbol,
    };
  }
  
  /**
   * تحويل خلية حضنة إلى عنصر SVG
   */
  static broodCellToSVG(cell: BroodCell): {
    path: string;
    fill: string;
    symbol?: { text: string; x: number; y: number; size: number };
  } {
    // إنشاء المسار للشكل السداسي
    let path = '';
    if (cell.vertices.length > 0) {
      path = `M ${cell.vertices[0].x},${cell.vertices[0].y}`;
      for (let i = 1; i < cell.vertices.length; i++) {
        path += ` L ${cell.vertices[i].x},${cell.vertices[i].y}`;
      }
      path += ' Z';
    }
    
    const result: {
      path: string;
      fill: string;
      symbol?: { text: string; x: number; y: number; size: number };
    } = {
      path,
      fill: cell.color,
    };
    
    // إضافة الرمز إن وجد
    if (cell.symbol) {
      result.symbol = {
        text: cell.symbol,
        x: cell.center.x,
        y: cell.center.y,
        size: cell.size * 0.6,
      };
    }
    
    return result;
  }
  
  /**
   * حساب إحصائيات النمط
   */
  static calculatePatternStats(cells: BroodCell[]): {
    total: number;
    byType: Record<CellType, number>;
    fillRatio: number;
  } {
    const stats = {
      total: cells.length,
      byType: {
        empty: 0,
        egg: 0,
        larva: 0,
        pupa: 0,
        capped: 0,
      } as Record<CellType, number>,
      fillRatio: 0,
    };
    
    cells.forEach((cell) => {
      stats.byType[cell.type]++;
    });
    
    // حساب نسبة الملء (الخلايا غير الفارغة)
    const filledCells = stats.total - stats.byType.empty;
    stats.fillRatio = stats.total > 0 ? filledCells / stats.total : 0;
    
    return stats;
  }
  
  /**
   * تصفية الخلايا حسب النوع
   */
  static filterByType(cells: BroodCell[], type: CellType): BroodCell[] {
    return cells.filter((cell) => cell.type === type);
  }
  
  /**
   * تصفية الخلايا حسب عمر الحضنة
   */
  static filterByBroodAge(cells: BroodCell[], broodAge: BroodAge): BroodCell[] {
    return cells.filter((cell) => cell.broodAge === broodAge);
  }
  
  /**
   * إيجاد الخلايا التي تحتوي على رموز
   */
  static getCellsWithSymbols(cells: BroodCell[]): BroodCell[] {
    return cells.filter((cell) => cell.symbol !== undefined);
  }
  
  /**
   * تطبيق تدرج لوني على الخلايا
   */
  static applyGradient(
    cells: BroodCell[],
    startColor: string,
    endColor: string
  ): BroodCell[] {
    if (cells.length === 0) {
      return cells;
    }
    
    return cells.map((cell, index) => {
      const ratio = index / (cells.length - 1);
      const color = this.interpolateColor(startColor, endColor, ratio);
      
      return {
        ...cell,
        color,
      };
    });
  }
  
  /**
   * استيفاء بين لونين
   */
  private static interpolateColor(
    color1: string,
    color2: string,
    ratio: number
  ): string {
    // تحويل الألوان من hex إلى RGB
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    if (!c1 || !c2) {
      return color1;
    }
    
    // استيفاء كل قناة
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
    
    // تحويل إلى hex
    return this.rgbToHex(r, g, b);
  }
  
  /**
   * تحويل hex إلى RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  
  /**
   * تحويل RGB إلى hex
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  /**
   * إنشاء نمط متنوع للحضنة المختلطة
   */
  static createMixedPattern(
    cells: HexCell[],
    colors: string[],
    _cellSize: number
  ): BroodCell[] {
    return cells.map((cell, index) => {
      const colorIndex = index % colors.length;
      const color = colors[colorIndex];
      
      // تحديد النوع بناءً على الموضع
      let type: CellType;
      let symbol: string | undefined;
      
      if (index % 5 === 0) {
        type = 'egg';
        symbol = '⚪';
      } else if (index % 5 === 4) {
        type = 'capped';
        symbol = '●';
      } else {
        type = 'larva';
      }
      
      return {
        ...cell,
        type,
        broodAge: 'MIXED',
        color,
        symbol,
      };
    });
  }
  
  /**
   * تطبيق نمط متناثر (scattered pattern)
   */
  static applyScatteredPattern(
    cells: BroodCell[],
    scatterRatio: number = 0.3
  ): BroodCell[] {
    return cells.filter(() => Math.random() > scatterRatio);
  }
  
  /**
   * تجميع الخلايا حسب المنطقة
   */
  static groupByArea(
    cells: BroodCell[],
    gridSize: number
  ): Map<string, BroodCell[]> {
    const groups = new Map<string, BroodCell[]>();
    
    cells.forEach((cell) => {
      const gridX = Math.floor(cell.center.x / gridSize);
      const gridY = Math.floor(cell.center.y / gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key)!.push(cell);
    });
    
    return groups;
  }
}
