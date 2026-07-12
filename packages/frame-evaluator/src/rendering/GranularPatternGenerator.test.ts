import {
  GranularPatternGenerator,
  Grain,
  Area,
} from './GranularPatternGenerator';

describe('GranularPatternGenerator', () => {
  const defaultColors = ['#FDBA74', '#FB923C', '#F97316'];
  const testArea: Area = { x: 0, y: 0, width: 100, height: 100 };
  
  describe('generatePattern', () => {
    it('should generate grains in the specified area', () => {
      const generator = new GranularPatternGenerator({
        colors: defaultColors,
        density: 1.0,
      });
      
      const grains = generator.generatePattern(testArea);
      
      expect(grains.length).toBeGreaterThan(0);
      
      grains.forEach((grain) => {
        expect(grain.center.x).toBeGreaterThanOrEqual(testArea.x);
        expect(grain.center.x).toBeLessThanOrEqual(testArea.x + testArea.width);
        expect(grain.center.y).toBeGreaterThanOrEqual(testArea.y);
        expect(grain.center.y).toBeLessThanOrEqual(testArea.y + testArea.height);
      });
    });
    
    it('should respect density option', () => {
      const lowDensity = new GranularPatternGenerator({
        colors: defaultColors,
        density: 0.1,
      });
      
      const highDensity = new GranularPatternGenerator({
        colors: defaultColors,
        density: 2.0,
      });
      
      const lowGrains = lowDensity.generatePattern(testArea);
      const highGrains = highDensity.generatePattern(testArea);
      
      expect(highGrains.length).toBeGreaterThan(lowGrains.length);
    });
    
    it('should use colors from the provided palette', () => {
      const generator = new GranularPatternGenerator({
        colors: defaultColors,
      });
      
      const grains = generator.generatePattern(testArea);
      
      grains.forEach((grain) => {
        expect(defaultColors).toContain(grain.color);
      });
    });
    
    it('should respect radiusRange option', () => {
      const generator = new GranularPatternGenerator({
        colors: defaultColors,
        radiusRange: [3, 5],
      });
      
      const grains = generator.generatePattern(testArea);
      
      grains.forEach((grain) => {
        expect(grain.radius).toBeGreaterThanOrEqual(3);
        expect(grain.radius).toBeLessThanOrEqual(5);
      });
    });
    
    it('should respect opacityRange option', () => {
      const generator = new GranularPatternGenerator({
        colors: defaultColors,
        opacityRange: [0.5, 0.8],
      });
      
      const grains = generator.generatePattern(testArea);
      
      grains.forEach((grain) => {
        expect(grain.opacity).toBeGreaterThanOrEqual(0.5);
        expect(grain.opacity).toBeLessThanOrEqual(0.8);
      });
    });
    
    it('should respect minDistance option', () => {
      const generator = new GranularPatternGenerator({
        colors: defaultColors,
        minDistance: 10,
        density: 0.5,
      });
      
      const grains = generator.generatePattern(testArea);
      
      // التحقق من أن جميع الحبوب متباعدة بالمسافة المطلوبة
      for (let i = 0; i < grains.length; i++) {
        for (let j = i + 1; j < grains.length; j++) {
          const dx = grains[i].center.x - grains[j].center.x;
          const dy = grains[i].center.y - grains[j].center.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          expect(distance).toBeGreaterThanOrEqual(10);
        }
      }
    });
    
    it('should handle empty area', () => {
      const generator = new GranularPatternGenerator({
        colors: defaultColors,
      });
      
      const emptyArea: Area = { x: 0, y: 0, width: 0, height: 0 };
      const grains = generator.generatePattern(emptyArea);
      
      expect(grains.length).toBe(0);
    });
  });
  
  describe('grainToSVG', () => {
    it('should convert grain to SVG properties', () => {
      const grain: Grain = {
        center: { x: 50, y: 50 },
        radius: 3,
        color: '#FDBA74',
        opacity: 0.8,
      };
      
      const svg = GranularPatternGenerator.grainToSVG(grain);
      
      expect(svg.cx).toBe(50);
      expect(svg.cy).toBe(50);
      expect(svg.r).toBe(3);
      expect(svg.fill).toBe('#FDBA74');
      expect(svg.opacity).toBe(0.8);
    });
  });
  
  describe('calculatePatternStats', () => {
    it('should calculate pattern statistics', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.7,
        },
        {
          center: { x: 20, y: 20 },
          radius: 4,
          color: '#FB923C',
          opacity: 0.9,
        },
        {
          center: { x: 30, y: 30 },
          radius: 3,
          color: '#FDBA74',
          opacity: 0.8,
        },
      ];
      
      const stats = GranularPatternGenerator.calculatePatternStats(grains);
      
      expect(stats.total).toBe(3);
      expect(stats.averageRadius).toBe(3);
      expect(stats.averageOpacity).toBeCloseTo(0.8, 1);
      expect(stats.colorDistribution['#FDBA74']).toBe(2);
      expect(stats.colorDistribution['#FB923C']).toBe(1);
    });
    
    it('should handle empty array', () => {
      const stats = GranularPatternGenerator.calculatePatternStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.averageRadius).toBe(0);
      expect(stats.averageOpacity).toBe(0);
      expect(Object.keys(stats.colorDistribution).length).toBe(0);
    });
  });
  
  describe('filterByColor', () => {
    it('should filter grains by color', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 30, y: 30 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
      ];
      
      const filtered = GranularPatternGenerator.filterByColor(grains, '#FDBA74');
      
      expect(filtered.length).toBe(2);
      filtered.forEach((grain) => {
        expect(grain.color).toBe('#FDBA74');
      });
    });
  });
  
  describe('filterByRadiusRange', () => {
    it('should filter grains by radius range', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 4,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 30, y: 30 },
          radius: 3,
          color: '#F97316',
          opacity: 0.8,
        },
      ];
      
      const filtered = GranularPatternGenerator.filterByRadiusRange(grains, 2.5, 4);
      
      expect(filtered.length).toBe(2);
      filtered.forEach((grain) => {
        expect(grain.radius).toBeGreaterThanOrEqual(2.5);
        expect(grain.radius).toBeLessThanOrEqual(4);
      });
    });
  });
  
  describe('filterInArea', () => {
    it('should filter grains in specified area', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 60, y: 60 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 30, y: 30 },
          radius: 2,
          color: '#F97316',
          opacity: 0.8,
        },
      ];
      
      const area: Area = { x: 0, y: 0, width: 50, height: 50 };
      const filtered = GranularPatternGenerator.filterInArea(grains, area);
      
      expect(filtered.length).toBe(2);
      filtered.forEach((grain) => {
        expect(grain.center.x).toBeLessThanOrEqual(50);
        expect(grain.center.y).toBeLessThanOrEqual(50);
      });
    });
  });
  
  describe('applyOpacityGradient', () => {
    it('should apply opacity gradient to grains', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.5,
        },
        {
          center: { x: 20, y: 20 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.5,
        },
        {
          center: { x: 30, y: 30 },
          radius: 2,
          color: '#F97316',
          opacity: 0.5,
        },
      ];
      
      const gradientGrains = GranularPatternGenerator.applyOpacityGradient(
        grains,
        0.3,
        0.9
      );
      
      expect(gradientGrains.length).toBe(3);
      expect(gradientGrains[0].opacity).toBeCloseTo(0.3, 1);
      expect(gradientGrains[2].opacity).toBeCloseTo(0.9, 1);
    });
    
    it('should handle empty array', () => {
      const gradientGrains = GranularPatternGenerator.applyOpacityGradient(
        [],
        0.3,
        0.9
      );
      
      expect(gradientGrains.length).toBe(0);
    });
  });
  
  describe('applyRadiusGradient', () => {
    it('should apply radius gradient to grains', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 30, y: 30 },
          radius: 2,
          color: '#F97316',
          opacity: 0.8,
        },
      ];
      
      const gradientGrains = GranularPatternGenerator.applyRadiusGradient(
        grains,
        1,
        5
      );
      
      expect(gradientGrains.length).toBe(3);
      expect(gradientGrains[0].radius).toBeCloseTo(1, 1);
      expect(gradientGrains[2].radius).toBeCloseTo(5, 1);
    });
    
    it('should handle empty array', () => {
      const gradientGrains = GranularPatternGenerator.applyRadiusGradient(
        [],
        1,
        5
      );
      
      expect(gradientGrains.length).toBe(0);
    });
  });
  
  describe('mergePatterns', () => {
    it('should merge multiple patterns', () => {
      const pattern1: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
      ];
      
      const pattern2: Grain[] = [
        {
          center: { x: 20, y: 20 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.8,
        },
      ];
      
      const merged = GranularPatternGenerator.mergePatterns(pattern1, pattern2);
      
      expect(merged.length).toBe(2);
    });
    
    it('should handle empty patterns', () => {
      const merged = GranularPatternGenerator.mergePatterns([], []);
      
      expect(merged.length).toBe(0);
    });
  });
  
  describe('removeOverlapping', () => {
    it('should remove overlapping grains', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 12, y: 12 },
          radius: 2,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 50, y: 50 },
          radius: 2,
          color: '#F97316',
          opacity: 0.8,
        },
      ];
      
      const filtered = GranularPatternGenerator.removeOverlapping(grains, 10);
      
      expect(filtered.length).toBe(2);
    });
  });
  
  describe('sortByRadius', () => {
    it('should sort grains by radius ascending', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 4,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 2,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 30, y: 30 },
          radius: 3,
          color: '#F97316',
          opacity: 0.8,
        },
      ];
      
      const sorted = GranularPatternGenerator.sortByRadius(grains, true);
      
      expect(sorted[0].radius).toBe(2);
      expect(sorted[1].radius).toBe(3);
      expect(sorted[2].radius).toBe(4);
    });
    
    it('should sort grains by radius descending', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 4,
          color: '#FB923C',
          opacity: 0.8,
        },
        {
          center: { x: 30, y: 30 },
          radius: 3,
          color: '#F97316',
          opacity: 0.8,
        },
      ];
      
      const sorted = GranularPatternGenerator.sortByRadius(grains, false);
      
      expect(sorted[0].radius).toBe(4);
      expect(sorted[1].radius).toBe(3);
      expect(sorted[2].radius).toBe(2);
    });
  });
  
  describe('sortByPosition', () => {
    it('should sort grains by position', () => {
      const grains: Grain[] = [
        {
          center: { x: 30, y: 30 },
          radius: 2,
          color: '#F97316',
          opacity: 0.8,
        },
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.8,
        },
      ];
      
      const sorted = GranularPatternGenerator.sortByPosition(grains);
      
      expect(sorted[0].center.y).toBeLessThanOrEqual(sorted[1].center.y);
      expect(sorted[1].center.y).toBeLessThanOrEqual(sorted[2].center.y);
    });
  });
  
  describe('calculateTotalArea', () => {
    it('should calculate total area covered by grains', () => {
      const grains: Grain[] = [
        {
          center: { x: 10, y: 10 },
          radius: 2,
          color: '#FDBA74',
          opacity: 0.8,
        },
        {
          center: { x: 20, y: 20 },
          radius: 3,
          color: '#FB923C',
          opacity: 0.8,
        },
      ];
      
      const totalArea = GranularPatternGenerator.calculateTotalArea(grains);
      
      const expectedArea = Math.PI * (2 * 2 + 3 * 3);
      expect(totalArea).toBeCloseTo(expectedArea, 2);
    });
    
    it('should return 0 for empty array', () => {
      const totalArea = GranularPatternGenerator.calculateTotalArea([]);
      
      expect(totalArea).toBe(0);
    });
  });
  
  describe('calculateCoverageRatio', () => {
    it('should calculate coverage ratio', () => {
      const grains: Grain[] = [
        {
          center: { x: 50, y: 50 },
          radius: 10,
          color: '#FDBA74',
          opacity: 0.8,
        },
      ];
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const ratio = GranularPatternGenerator.calculateCoverageRatio(grains, area);
      
      const grainArea = Math.PI * 10 * 10;
      const expectedRatio = grainArea / (100 * 100);
      expect(ratio).toBeCloseTo(expectedRatio, 3);
    });
    
    it('should return 0 for empty area', () => {
      const grains: Grain[] = [
        {
          center: { x: 50, y: 50 },
          radius: 10,
          color: '#FDBA74',
          opacity: 0.8,
        },
      ];
      
      const area: Area = { x: 0, y: 0, width: 0, height: 0 };
      const ratio = GranularPatternGenerator.calculateCoverageRatio(grains, area);
      
      expect(ratio).toBe(0);
    });
  });
});
