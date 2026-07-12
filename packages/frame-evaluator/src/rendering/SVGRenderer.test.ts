import { SVGRenderer, LayerAreas, LayerArea } from './SVGRenderer';
import { FrameData } from '../types';

describe('SVGRenderer', () => {
  const defaultDimensions = { width: 400, height: 600 };
  
  const createTestFrameData = (overrides?: Partial<FrameData>): FrameData => ({
    side: 'A',
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 20,
    emptyPercentage: 10,
    isValid: true,
    ...overrides,
  });
  
  describe('constructor', () => {
    it('should create renderer with default cell size', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      expect(renderer.getDimensions()).toEqual(defaultDimensions);
      expect(renderer.getCellSize()).toBe(10);
    });
    
    it('should create renderer with custom cell size', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
        cellSize: 15,
      });
      
      expect(renderer.getCellSize()).toBe(15);
    });
  });
  
  describe('calculateLayers', () => {
    it('should calculate layer areas correctly', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 30,
        broodPercentage: 40,
        beeBreadPercentage: 20,
      });
      
      const layers = renderer.calculateLayers(data);
      
      // طبقة العسل (30% من الارتفاع)
      expect(layers.honey.height).toBe(180); // 600 * 0.3
      expect(layers.honey.width).toBe(400);
      expect(layers.honey.x).toBe(0);
      expect(layers.honey.y).toBe(0);
      
      // طبقة الحضنة (40% من الارتفاع)
      expect(layers.brood.height).toBe(240); // 600 * 0.4
      expect(layers.brood.y).toBe(180); // بعد العسل
      
      // خبز النحل (20% من نصف العرض على كل جانب)
      expect(layers.beeBread.left.width).toBe(40); // 400 * 0.5 * 0.2
      expect(layers.beeBread.right.width).toBe(40);
      expect(layers.beeBread.left.x).toBe(0);
      expect(layers.beeBread.right.x).toBe(360); // 400 - 40
    });
    
    it('should handle zero percentages', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 0,
        broodPercentage: 0,
        beeBreadPercentage: 0,
        emptyPercentage: 100,
      });
      
      const layers = renderer.calculateLayers(data);
      
      expect(layers.honey.height).toBe(0);
      expect(layers.brood.height).toBe(0);
      expect(layers.beeBread.left.width).toBe(0);
      expect(layers.beeBread.right.width).toBe(0);
      expect(layers.empty.height).toBe(600);
    });
    
    it('should handle 100% honey', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 100,
        broodPercentage: 0,
        beeBreadPercentage: 0,
        emptyPercentage: 0,
      });
      
      const layers = renderer.calculateLayers(data);
      
      expect(layers.honey.height).toBe(600);
      expect(layers.brood.height).toBe(0);
      expect(layers.empty.height).toBe(0);
    });
    
    it('should calculate brood area width correctly with beebread', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 20,
        broodPercentage: 60,
        beeBreadPercentage: 10,
      });
      
      const layers = renderer.calculateLayers(data);
      
      // خبز النحل يأخذ 10% من نصف العرض = 20 بكسل على كل جانب
      const beeBreadWidth = 20;
      expect(layers.brood.width).toBe(400 - (beeBreadWidth * 2));
      expect(layers.brood.x).toBe(beeBreadWidth);
    });
  });
  
  describe('calculateLayerArea', () => {
    it('should calculate area correctly', () => {
      const layer: LayerArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 200,
      };
      
      const area = SVGRenderer.calculateLayerArea(layer);
      
      expect(area).toBe(20000);
    });
    
    it('should handle zero dimensions', () => {
      const layer: LayerArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      
      const area = SVGRenderer.calculateLayerArea(layer);
      
      expect(area).toBe(0);
    });
  });
  
  describe('calculateBeeBreadArea', () => {
    it('should calculate total beebread area', () => {
      const beeBread = {
        left: { x: 0, y: 0, width: 50, height: 600 },
        right: { x: 350, y: 0, width: 50, height: 600 },
      };
      
      const area = SVGRenderer.calculateBeeBreadArea(beeBread);
      
      expect(area).toBe(60000); // 50*600 + 50*600
    });
  });
  
  describe('calculateTotalArea', () => {
    it('should calculate all layer areas', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 25,
        broodPercentage: 50,
        beeBreadPercentage: 15,
        emptyPercentage: 10,
      });
      
      const layers = renderer.calculateLayers(data);
      const areas = SVGRenderer.calculateTotalArea(layers);
      
      expect(areas.honey).toBeGreaterThan(0);
      expect(areas.brood).toBeGreaterThan(0);
      expect(areas.beeBread).toBeGreaterThan(0);
      expect(areas.empty).toBeGreaterThan(0);
      expect(areas.total).toBe(
        areas.honey + areas.brood + areas.beeBread + areas.empty
      );
    });
  });
  
  describe('validateLayers', () => {
    it('should validate correct layers', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData();
      const layers = renderer.calculateLayers(data);
      
      const validation = SVGRenderer.validateLayers(layers, defaultDimensions);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
    
    it('should detect layers exceeding bounds', () => {
      const layers: LayerAreas = {
        honey: { x: 0, y: 0, width: 500, height: 100 }, // يتجاوز العرض
        brood: { x: 0, y: 100, width: 400, height: 200 },
        beeBread: {
          left: { x: 0, y: 0, width: 50, height: 600 },
          right: { x: 350, y: 0, width: 50, height: 600 },
        },
        empty: { x: 0, y: 300, width: 400, height: 300 },
      };
      
      const validation = SVGRenderer.validateLayers(layers, defaultDimensions);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
    
    it('should detect negative dimensions', () => {
      const layers: LayerAreas = {
        honey: { x: 0, y: 0, width: -100, height: 100 },
        brood: { x: 0, y: 100, width: 400, height: 200 },
        beeBread: {
          left: { x: 0, y: 0, width: 50, height: 600 },
          right: { x: 350, y: 0, width: 50, height: 600 },
        },
        empty: { x: 0, y: 300, width: 400, height: 300 },
      };
      
      const validation = SVGRenderer.validateLayers(layers, defaultDimensions);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('سالبة'))).toBe(true);
    });
  });
  
  describe('calculatePercentagesFromAreas', () => {
    it('should calculate percentages correctly', () => {
      const areas = {
        honey: 6000,
        brood: 12000,
        beeBread: 4000,
        empty: 2000,
      };
      const totalArea = 24000;
      
      const percentages = SVGRenderer.calculatePercentagesFromAreas(areas, totalArea);
      
      expect(percentages.honeyPercentage).toBe(25);
      expect(percentages.broodPercentage).toBe(50);
      expect(percentages.beeBreadPercentage).toBeCloseTo(16.67, 1);
      expect(percentages.emptyPercentage).toBeCloseTo(8.33, 1);
    });
    
    it('should handle zero total area', () => {
      const areas = {
        honey: 0,
        brood: 0,
        beeBread: 0,
        empty: 0,
      };
      
      const percentages = SVGRenderer.calculatePercentagesFromAreas(areas, 0);
      
      expect(percentages.honeyPercentage).toBe(0);
      expect(percentages.broodPercentage).toBe(0);
      expect(percentages.beeBreadPercentage).toBe(0);
      expect(percentages.emptyPercentage).toBe(0);
    });
  });
  
  describe('isLayerInArea', () => {
    it('should detect layer inside area', () => {
      const layer: LayerArea = {
        x: 10,
        y: 10,
        width: 50,
        height: 50,
      };
      
      const area = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      expect(SVGRenderer.isLayerInArea(layer, area)).toBe(true);
    });
    
    it('should detect layer outside area', () => {
      const layer: LayerArea = {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      };
      
      const area = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      expect(SVGRenderer.isLayerInArea(layer, area)).toBe(false);
    });
  });
  
  describe('calculateIntersection', () => {
    it('should calculate intersection of overlapping layers', () => {
      const layer1: LayerArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      const layer2: LayerArea = {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      };
      
      const intersection = SVGRenderer.calculateIntersection(layer1, layer2);
      
      expect(intersection).not.toBeNull();
      expect(intersection?.x).toBe(50);
      expect(intersection?.y).toBe(50);
      expect(intersection?.width).toBe(50);
      expect(intersection?.height).toBe(50);
    });
    
    it('should return null for non-overlapping layers', () => {
      const layer1: LayerArea = {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      };
      
      const layer2: LayerArea = {
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };
      
      const intersection = SVGRenderer.calculateIntersection(layer1, layer2);
      
      expect(intersection).toBeNull();
    });
  });
  
  describe('mergeLayers', () => {
    it('should merge two layers', () => {
      const layer1: LayerArea = {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      };
      
      const layer2: LayerArea = {
        x: 25,
        y: 25,
        width: 50,
        height: 50,
      };
      
      const merged = SVGRenderer.mergeLayers(layer1, layer2);
      
      expect(merged.x).toBe(0);
      expect(merged.y).toBe(0);
      expect(merged.width).toBe(75);
      expect(merged.height).toBe(75);
    });
  });
  
  describe('subdivideLayer', () => {
    it('should subdivide layer into grid', () => {
      const layer: LayerArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      const subdivisions = SVGRenderer.subdivideLayer(layer, 25);
      
      expect(subdivisions.length).toBe(16); // 4x4 grid
      
      subdivisions.forEach((sub) => {
        expect(sub.width).toBeLessThanOrEqual(25);
        expect(sub.height).toBeLessThanOrEqual(25);
      });
    });
    
    it('should handle non-divisible dimensions', () => {
      const layer: LayerArea = {
        x: 0,
        y: 0,
        width: 105,
        height: 105,
      };
      
      const subdivisions = SVGRenderer.subdivideLayer(layer, 50);
      
      expect(subdivisions.length).toBeGreaterThan(0);
      
      // التحقق من أن جميع الأجزاء داخل الطبقة الأصلية
      subdivisions.forEach((sub) => {
        expect(sub.x).toBeGreaterThanOrEqual(layer.x);
        expect(sub.y).toBeGreaterThanOrEqual(layer.y);
        expect(sub.x + sub.width).toBeLessThanOrEqual(layer.x + layer.width);
        expect(sub.y + sub.height).toBeLessThanOrEqual(layer.y + layer.height);
      });
    });
  });
  
  describe('setters and getters', () => {
    it('should update dimensions', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const newDimensions = { width: 500, height: 700 };
      renderer.setDimensions(newDimensions);
      
      expect(renderer.getDimensions()).toEqual(newDimensions);
    });
    
    it('should update cell size', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      renderer.setCellSize(20);
      
      expect(renderer.getCellSize()).toBe(20);
    });
  });
  
  describe('renderHoneyLayer', () => {
    it('should render honey layer with hexagonal cells', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
        cellSize: 10,
      });
      
      const area: LayerArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      const colors = {
        honey: {
          light: '#FEF9C3',
          medium: '#FEF08A',
          dark: '#FDE047',
          stroke: '#D97706',
        },
      } as any;
      
      const result = renderer.renderHoneyLayer(area, colors);
      
      expect(result.cells.length).toBeGreaterThan(0);
      expect(result.svgPaths.length).toBe(result.cells.length);
      expect(result.gradient).toBeDefined();
      expect(result.gradient.id).toBe('honeyGradient');
      
      result.svgPaths.forEach((path) => {
        expect(path).toContain('M');
        expect(path).toContain('L');
      });
    });
    
    it('should handle empty area', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const area: LayerArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      
      const result = renderer.renderHoneyLayer(area, {} as any);
      
      expect(result.cells.length).toBe(0);
      expect(result.svgPaths.length).toBe(0);
      expect(result.gradient).toBeDefined();
    });
  });
  
  describe('renderBroodLayer', () => {
    it('should render brood layer with cellular pattern', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
        cellSize: 10,
      });
      
      const area: LayerArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      const colors = {
        brood: {
          eggs: '#FFFBEB',
          youngLarvae: '#FEF3C7',
          oldLarvae: '#FDE68A',
          capped: '#D97706',
          mixed: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#D97706'],
          stroke: '#92400E',
        },
      } as any;
      
      const result = renderer.renderBroodLayer(area, 'EGGS', colors);
      
      expect(result.cells.length).toBeGreaterThan(0);
      expect(result.svgData.length).toBe(result.cells.length);
      expect(result.gradient).toBeDefined();
      expect(result.gradient.id).toBe('broodGradient');
      
      result.svgData.forEach((data) => {
        expect(data.path).toBeDefined();
        expect(data.fill).toBeDefined();
      });
    });
    
    it('should handle different brood ages', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
        cellSize: 10,
      });
      
      const area: LayerArea = {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      };
      
      const colors = {
        brood: {
          eggs: '#FFFBEB',
          youngLarvae: '#FEF3C7',
          oldLarvae: '#FDE68A',
          capped: '#D97706',
          mixed: ['#FFFBEB', '#FEF3C7'],
          stroke: '#92400E',
        },
      } as any;
      
      const ages = ['EGGS', 'YOUNG_LARVAE', 'OLD_LARVAE', 'CAPPED', 'MIXED'];
      
      ages.forEach((age) => {
        const result = renderer.renderBroodLayer(area, age, colors);
        expect(result.cells.length).toBeGreaterThan(0);
        expect(result.gradient).toBeDefined();
      });
    });
    
    it('should handle empty area', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const area: LayerArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      
      const result = renderer.renderBroodLayer(area, 'EGGS', {} as any);
      
      expect(result.cells.length).toBe(0);
      expect(result.svgData.length).toBe(0);
      expect(result.gradient).toBeDefined();
    });
  });
  
  describe('renderBeeBreadLayer', () => {
    it('should render beebread on both sides', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const leftArea: LayerArea = {
        x: 0,
        y: 0,
        width: 50,
        height: 600,
      };
      
      const rightArea: LayerArea = {
        x: 350,
        y: 0,
        width: 50,
        height: 600,
      };
      
      const colors = {
        beeBread: {
          light: '#FFEDD5',
          medium: '#FED7AA',
          dark: '#FDBA74',
          variations: ['#FDBA74', '#FB923C', '#F97316'],
        },
      } as any;
      
      const result = renderer.renderBeeBreadLayer(leftArea, rightArea, colors);
      
      expect(result.leftGrains.length).toBeGreaterThan(0);
      expect(result.rightGrains.length).toBeGreaterThan(0);
      expect(result.svgData.length).toBe(
        result.leftGrains.length + result.rightGrains.length
      );
      expect(result.gradient).toBeDefined();
      expect(result.gradient.id).toBe('beeBreadGradient');
      
      result.svgData.forEach((data) => {
        expect(data.cx).toBeDefined();
        expect(data.cy).toBeDefined();
        expect(data.r).toBeGreaterThan(0);
        expect(data.fill).toBeDefined();
        expect(data.opacity).toBeGreaterThan(0);
      });
    });
    
    it('should handle empty areas', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const emptyArea: LayerArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      
      const colors = {
        beeBread: {
          variations: ['#FDBA74'],
        },
      } as any;
      
      const result = renderer.renderBeeBreadLayer(emptyArea, emptyArea, colors);
      
      expect(result.leftGrains.length).toBe(0);
      expect(result.rightGrains.length).toBe(0);
      expect(result.svgData.length).toBe(0);
      expect(result.gradient).toBeDefined();
    });
  });
  
  describe('renderEmptyLayer', () => {
    it('should render empty layer', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const area: LayerArea = {
        x: 50,
        y: 400,
        width: 300,
        height: 200,
      };
      
      const result = renderer.renderEmptyLayer(area, '#F5F5DC');
      
      expect(result.area).toEqual(area);
      expect(result.fill).toBe('#F5F5DC');
    });
  });
  
  describe('renderFrame', () => {
    it('should render complete frame with all layers', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
        cellSize: 10,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 30,
        broodPercentage: 40,
        beeBreadPercentage: 20,
        broodAge: 'MIXED',
      });
      
      const colors = {
        honey: {
          light: '#FEF9C3',
          medium: '#FEF08A',
          dark: '#FDE047',
          stroke: '#D97706',
        },
        brood: {
          eggs: '#FFFBEB',
          youngLarvae: '#FEF3C7',
          oldLarvae: '#FDE68A',
          capped: '#D97706',
          mixed: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#D97706'],
          stroke: '#92400E',
        },
        beeBread: {
          light: '#FFEDD5',
          medium: '#FED7AA',
          dark: '#FDBA74',
          variations: ['#FDBA74', '#FB923C', '#F97316'],
        },
        empty: '#F5F5DC',
      } as any;
      
      const result = renderer.renderFrame(data, colors);
      
      expect(result.layers).toBeDefined();
      expect(result.honey).toBeDefined();
      expect(result.brood).toBeDefined();
      expect(result.beeBread).toBeDefined();
      expect(result.empty).toBeDefined();
      expect(result.gradients).toBeDefined();
      expect(result.gradients.honey).toBeDefined();
      expect(result.gradients.brood).toBeDefined();
      expect(result.gradients.beeBread).toBeDefined();
      
      expect(result.honey.cells.length).toBeGreaterThan(0);
      expect(result.brood.cells.length).toBeGreaterThan(0);
      expect(result.beeBread.leftGrains.length).toBeGreaterThan(0);
      expect(result.beeBread.rightGrains.length).toBeGreaterThan(0);
    });
    
    it('should handle frame with no honey', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData({
        honeyPercentage: 0,
        broodPercentage: 80,
        beeBreadPercentage: 10,
      });
      
      const colors = {
        honey: { light: '#FEF9C3', medium: '#FEF08A', dark: '#FDE047', stroke: '#D97706' },
        brood: {
          eggs: '#FFFBEB',
          youngLarvae: '#FEF3C7',
          oldLarvae: '#FDE68A',
          capped: '#D97706',
          mixed: ['#FFFBEB'],
          stroke: '#92400E',
        },
        beeBread: { light: '#FFEDD5', medium: '#FED7AA', dark: '#FDBA74', variations: ['#FDBA74'] },
        empty: '#F5F5DC',
      } as any;
      
      const result = renderer.renderFrame(data, colors);
      
      expect(result.honey.cells.length).toBe(0);
      expect(result.brood.cells.length).toBeGreaterThan(0);
      expect(result.gradients).toBeDefined();
    });
  });
  
  describe('createGradientDefs', () => {
    it('should create SVG gradient definitions', () => {
      const renderer = new SVGRenderer({
        dimensions: defaultDimensions,
      });
      
      const data = createTestFrameData();
      const colors = {
        honey: { light: '#FEF9C3', medium: '#FEF08A', dark: '#FDE047', stroke: '#D97706' },
        brood: {
          eggs: '#FFFBEB',
          youngLarvae: '#FEF3C7',
          oldLarvae: '#FDE68A',
          capped: '#D97706',
          mixed: ['#FFFBEB'],
          stroke: '#92400E',
        },
        beeBread: { light: '#FFEDD5', medium: '#FED7AA', dark: '#FDBA74', variations: ['#FDBA74'] },
        empty: '#F5F5DC',
      } as any;
      
      const result = renderer.renderFrame(data, colors);
      const defs = SVGRenderer.createGradientDefs(result.gradients);
      
      expect(defs).toContain('<defs>');
      expect(defs).toContain('</defs>');
      expect(defs).toContain('honeyGradient');
      expect(defs).toContain('broodGradient');
      expect(defs).toContain('beeBreadGradient');
      expect(defs).toContain('<linearGradient');
    });
  });
});
