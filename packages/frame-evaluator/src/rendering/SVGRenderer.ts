/**
 * محرك الرسم بـ SVG (SVG Renderer)
 * 
 * مسؤول عن رسم الإطار وعرض المحتوى بصرياً باستخدام SVG
 */

import { FrameData } from '../types';
import { Area, HexagonalPatternGenerator, HexCell } from './HexagonalPatternGenerator';
import { CellularPatternGenerator, BroodCell } from './CellularPatternGenerator';
import { GranularPatternGenerator, Grain } from './GranularPatternGenerator';
import { GradientGenerator, GradientDefinition } from './GradientGenerator';
import { ColorScheme } from '../types';

/**
 * مساحة طبقة واحدة
 */
export interface LayerArea extends Area {
  // يرث x, y, width, height من Area
}

/**
 * مساحات جميع الطبقات
 */
export interface LayerAreas {
  /** طبقة العسل (أعلى) */
  honey: LayerArea;
  
  /** طبقة الحضنة (وسط) */
  brood: LayerArea;
  
  /** طبقة خبز النحل (جوانب) */
  beeBread: {
    left: LayerArea;
    right: LayerArea;
  };
  
  /** الطبقة الفارغة (خلفية) */
  empty: LayerArea;
}

/**
 * خيارات تكوين المحرك
 */
export interface RendererConfig {
  /** أبعاد الإطار */
  dimensions: {
    width: number;
    height: number;
  };
  
  /** حجم الخلية السداسية */
  cellSize?: number;
}

/**
 * فئة محرك الرسم بـ SVG
 */
export class SVGRenderer {
  private dimensions: { width: number; height: number };
  private cellSize: number;
  
  constructor(config: RendererConfig) {
    this.dimensions = config.dimensions;
    this.cellSize = config.cellSize || 10;
  }
  
  /**
   * حساب مساحات الطبقات بناءً على بيانات الإطار
   */
  calculateLayers(data: FrameData): LayerAreas {
    const totalHeight = this.dimensions.height;
    const totalWidth = this.dimensions.width;
    
    // حساب ارتفاعات الطبقات
    const honeyHeight = (data.honeyPercentage / 100) * totalHeight;
    const broodHeight = (data.broodPercentage / 100) * totalHeight;
    
    // حساب عرض خبز النحل على الجوانب
    // خبز النحل يأخذ نسبة من نصف العرض على كل جانب
    const beeBreadWidth = (data.beeBreadPercentage / 100) * (totalWidth / 2);
    
    return {
      honey: {
        x: 0,
        y: 0,
        width: totalWidth,
        height: honeyHeight,
      },
      brood: {
        x: beeBreadWidth,
        y: honeyHeight,
        width: totalWidth - (beeBreadWidth * 2),
        height: broodHeight,
      },
      beeBread: {
        left: {
          x: 0,
          y: 0,
          width: beeBreadWidth,
          height: totalHeight,
        },
        right: {
          x: totalWidth - beeBreadWidth,
          y: 0,
          width: beeBreadWidth,
          height: totalHeight,
        },
      },
      empty: {
        x: beeBreadWidth,
        y: honeyHeight + broodHeight,
        width: totalWidth - (beeBreadWidth * 2),
        height: totalHeight - honeyHeight - broodHeight,
      },
    };
  }
  
  /**
   * حساب المساحة الإجمالية لطبقة
   */
  static calculateLayerArea(layer: LayerArea): number {
    return layer.width * layer.height;
  }
  
  /**
   * حساب المساحة الإجمالية لطبقة خبز النحل (الجانبين)
   */
  static calculateBeeBreadArea(beeBread: { left: LayerArea; right: LayerArea }): number {
    return (
      beeBread.left.width * beeBread.left.height +
      beeBread.right.width * beeBread.right.height
    );
  }
  
  /**
   * حساب المساحة الإجمالية لجميع الطبقات
   */
  static calculateTotalArea(layers: LayerAreas): {
    honey: number;
    brood: number;
    beeBread: number;
    empty: number;
    total: number;
  } {
    const honeyArea = this.calculateLayerArea(layers.honey);
    const broodArea = this.calculateLayerArea(layers.brood);
    const beeBreadArea = this.calculateBeeBreadArea(layers.beeBread);
    const emptyArea = this.calculateLayerArea(layers.empty);
    
    return {
      honey: honeyArea,
      brood: broodArea,
      beeBread: beeBreadArea,
      empty: emptyArea,
      total: honeyArea + broodArea + beeBreadArea + emptyArea,
    };
  }
  
  /**
   * التحقق من أن الطبقات صحيحة ولا تتداخل
   */
  static validateLayers(layers: LayerAreas, dimensions: { width: number; height: number }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // التحقق من أن جميع الطبقات داخل الأبعاد
    const checkBounds = (layer: LayerArea, name: string) => {
      if (layer.x < 0 || layer.y < 0) {
        errors.push(`${name}: الموضع سالب`);
      }
      if (layer.x + layer.width > dimensions.width) {
        errors.push(`${name}: يتجاوز العرض`);
      }
      if (layer.y + layer.height > dimensions.height) {
        errors.push(`${name}: يتجاوز الارتفاع`);
      }
      if (layer.width < 0 || layer.height < 0) {
        errors.push(`${name}: الأبعاد سالبة`);
      }
    };
    
    checkBounds(layers.honey, 'طبقة العسل');
    checkBounds(layers.brood, 'طبقة الحضنة');
    checkBounds(layers.beeBread.left, 'خبز النحل (يسار)');
    checkBounds(layers.beeBread.right, 'خبز النحل (يمين)');
    checkBounds(layers.empty, 'الطبقة الفارغة');
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * حساب النسب المئوية من المساحات
   */
  static calculatePercentagesFromAreas(
    areas: { honey: number; brood: number; beeBread: number; empty: number },
    totalArea: number
  ): {
    honeyPercentage: number;
    broodPercentage: number;
    beeBreadPercentage: number;
    emptyPercentage: number;
  } {
    if (totalArea === 0) {
      return {
        honeyPercentage: 0,
        broodPercentage: 0,
        beeBreadPercentage: 0,
        emptyPercentage: 0,
      };
    }
    
    return {
      honeyPercentage: (areas.honey / totalArea) * 100,
      broodPercentage: (areas.brood / totalArea) * 100,
      beeBreadPercentage: (areas.beeBread / totalArea) * 100,
      emptyPercentage: (areas.empty / totalArea) * 100,
    };
  }
  
  /**
   * التحقق من أن طبقة داخل منطقة معينة
   */
  static isLayerInArea(layer: LayerArea, area: Area): boolean {
    return (
      layer.x >= area.x &&
      layer.y >= area.y &&
      layer.x + layer.width <= area.x + area.width &&
      layer.y + layer.height <= area.y + area.height
    );
  }
  
  /**
   * حساب التقاطع بين طبقتين
   */
  static calculateIntersection(layer1: LayerArea, layer2: LayerArea): LayerArea | null {
    const x = Math.max(layer1.x, layer2.x);
    const y = Math.max(layer1.y, layer2.y);
    const width = Math.min(layer1.x + layer1.width, layer2.x + layer2.width) - x;
    const height = Math.min(layer1.y + layer1.height, layer2.y + layer2.height) - y;
    
    if (width <= 0 || height <= 0) {
      return null;
    }
    
    return { x, y, width, height };
  }
  
  /**
   * دمج طبقتين
   */
  static mergeLayers(layer1: LayerArea, layer2: LayerArea): LayerArea {
    const x = Math.min(layer1.x, layer2.x);
    const y = Math.min(layer1.y, layer2.y);
    const width = Math.max(layer1.x + layer1.width, layer2.x + layer2.width) - x;
    const height = Math.max(layer1.y + layer1.height, layer2.y + layer2.height) - y;
    
    return { x, y, width, height };
  }
  
  /**
   * تقسيم طبقة إلى شبكة من المناطق الصغيرة
   */
  static subdivideLayer(layer: LayerArea, gridSize: number): LayerArea[] {
    const subdivisions: LayerArea[] = [];
    
    for (let y = layer.y; y < layer.y + layer.height; y += gridSize) {
      for (let x = layer.x; x < layer.x + layer.width; x += gridSize) {
        const width = Math.min(gridSize, layer.x + layer.width - x);
        const height = Math.min(gridSize, layer.y + layer.height - y);
        
        if (width > 0 && height > 0) {
          subdivisions.push({ x, y, width, height });
        }
      }
    }
    
    return subdivisions;
  }
  
  /**
   * الحصول على الأبعاد
   */
  getDimensions(): { width: number; height: number } {
    return { ...this.dimensions };
  }
  
  /**
   * الحصول على حجم الخلية
   */
  getCellSize(): number {
    return this.cellSize;
  }
  
  /**
   * تحديث الأبعاد
   */
  setDimensions(dimensions: { width: number; height: number }): void {
    this.dimensions = { ...dimensions };
  }
  
  /**
   * تحديث حجم الخلية
   */
  setCellSize(cellSize: number): void {
    this.cellSize = cellSize;
  }
  
  /**
   * رسم طبقة العسل
   */
  renderHoneyLayer(area: LayerArea, _colors: ColorScheme): {
    cells: HexCell[];
    svgPaths: string[];
    gradient: GradientDefinition;
  } {
    if (area.width <= 0 || area.height <= 0) {
      return { 
        cells: [], 
        svgPaths: [],
        gradient: GradientGenerator.createHoneyGradient(),
      };
    }
    
    // توليد الشبكة السداسية
    const generator = new HexagonalPatternGenerator({ cellSize: this.cellSize });
    const cells = generator.generateGrid(area);
    
    // تحويل الخلايا إلى مسارات SVG
    const svgPaths = cells.map((cell) => {
      return HexagonalPatternGenerator.hexCellToSVGPath(cell);
    });
    
    // إنشاء التدرج اللوني
    const gradient = GradientGenerator.createHoneyGradient();
    
    return { cells, svgPaths, gradient };
  }
  
  /**
   * رسم طبقة الحضنة
   */
  renderBroodLayer(
    area: LayerArea,
    broodAge: string,
    colors: ColorScheme
  ): {
    cells: BroodCell[];
    svgData: Array<{
      path: string;
      fill: string;
      symbol?: { text: string; x: number; y: number; size: number };
    }>;
    gradient: GradientDefinition;
  } {
    if (area.width <= 0 || area.height <= 0) {
      return { 
        cells: [], 
        svgData: [],
        gradient: GradientGenerator.createBroodGradient('broodGradient', 'MIXED'),
      };
    }
    
    // توليد الشبكة السداسية
    const hexGenerator = new HexagonalPatternGenerator({ cellSize: this.cellSize });
    const hexCells = hexGenerator.generateGrid(area);
    
    // توليد نمط الحضنة
    const cellularGenerator = new CellularPatternGenerator({
      cellSize: this.cellSize,
      broodAge: broodAge as 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED',
      colors: {
        eggs: colors.brood.eggs,
        youngLarvae: colors.brood.youngLarvae,
        oldLarvae: colors.brood.oldLarvae,
        capped: colors.brood.capped,
        mixed: colors.brood.mixed,
      },
    });
    
    const broodCells = cellularGenerator.generatePattern(hexCells);
    
    // تحويل إلى بيانات SVG
    const svgData = broodCells.map((cell) => {
      return CellularPatternGenerator.broodCellToSVG(cell);
    });
    
    // إنشاء التدرج اللوني حسب عمر الحضنة
    const gradient = GradientGenerator.createBroodGradient(
      'broodGradient',
      broodAge as 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED'
    );
    
    return { cells: broodCells, svgData, gradient };
  }
  
  /**
   * رسم طبقة خبز النحل
   */
  renderBeeBreadLayer(
    leftArea: LayerArea,
    rightArea: LayerArea,
    colors: ColorScheme
  ): {
    leftGrains: Grain[];
    rightGrains: Grain[];
    svgData: Array<{
      cx: number;
      cy: number;
      r: number;
      fill: string;
      opacity: number;
    }>;
    gradient: GradientDefinition;
  } {
    const leftGrains: Grain[] = [];
    const rightGrains: Grain[] = [];
    const svgData: Array<{
      cx: number;
      cy: number;
      r: number;
      fill: string;
      opacity: number;
    }> = [];
    
    // رسم الجانب الأيسر
    if (leftArea.width > 0 && leftArea.height > 0) {
      const leftGenerator = new GranularPatternGenerator({
        colors: colors.beeBread.variations,
        radiusRange: [2, 4],
        opacityRange: [0.7, 0.9],
        density: 0.5,
      });
      
      const grains = leftGenerator.generatePattern(leftArea);
      leftGrains.push(...grains);
      
      grains.forEach((grain) => {
        svgData.push(GranularPatternGenerator.grainToSVG(grain));
      });
    }
    
    // رسم الجانب الأيمن
    if (rightArea.width > 0 && rightArea.height > 0) {
      const rightGenerator = new GranularPatternGenerator({
        colors: colors.beeBread.variations,
        radiusRange: [2, 4],
        opacityRange: [0.7, 0.9],
        density: 0.5,
      });
      
      const grains = rightGenerator.generatePattern(rightArea);
      rightGrains.push(...grains);
      
      grains.forEach((grain) => {
        svgData.push(GranularPatternGenerator.grainToSVG(grain));
      });
    }
    
    // إنشاء التدرج اللوني
    const gradient = GradientGenerator.createBeeBreadGradient();
    
    return { leftGrains, rightGrains, svgData, gradient };
  }
  
  /**
   * رسم الطبقة الفارغة
   */
  renderEmptyLayer(area: LayerArea, color: string): {
    area: LayerArea;
    fill: string;
  } {
    return {
      area: { ...area },
      fill: color,
    };
  }
  
  /**
   * رسم الإطار الكامل
   */
  renderFrame(data: FrameData, colors: ColorScheme): {
    layers: LayerAreas;
    honey: ReturnType<SVGRenderer['renderHoneyLayer']>;
    brood: ReturnType<SVGRenderer['renderBroodLayer']>;
    beeBread: ReturnType<SVGRenderer['renderBeeBreadLayer']>;
    empty: ReturnType<SVGRenderer['renderEmptyLayer']>;
    gradients: {
      honey: GradientDefinition;
      brood: GradientDefinition;
      beeBread: GradientDefinition;
    };
  } {
    // حساب مساحات الطبقات
    const layers = this.calculateLayers(data);
    
    // رسم كل طبقة
    const honey = this.renderHoneyLayer(layers.honey, colors);
    const brood = this.renderBroodLayer(
      layers.brood,
      data.broodAge || 'MIXED',
      colors
    );
    const beeBread = this.renderBeeBreadLayer(
      layers.beeBread.left,
      layers.beeBread.right,
      colors
    );
    const empty = this.renderEmptyLayer(layers.empty, colors.empty);
    
    return {
      layers,
      honey,
      brood,
      beeBread,
      empty,
      gradients: {
        honey: honey.gradient,
        brood: brood.gradient,
        beeBread: beeBread.gradient,
      },
    };
  }
  
  /**
   * إنشاء تعريفات SVG للتدرجات
   */
  static createGradientDefs(gradients: {
    honey: GradientDefinition;
    brood: GradientDefinition;
    beeBread: GradientDefinition;
  }): string {
    return `<defs>
    ${GradientGenerator.toSVG(gradients.honey)}
    ${GradientGenerator.toSVG(gradients.brood)}
    ${GradientGenerator.toSVG(gradients.beeBread)}
  </defs>`;
  }
}
