import {
  CellularPatternGenerator,
  BroodCell,
  CellType,
} from './CellularPatternGenerator';
import { HexagonalPatternGenerator, HexCell, Area } from './HexagonalPatternGenerator';

describe('CellularPatternGenerator', () => {
  // إنشاء خلايا سداسية للاختبار
  const createTestCells = (count: number = 10): HexCell[] => {
    const generator = new HexagonalPatternGenerator({ cellSize: 10 });
    const area: Area = { x: 0, y: 0, width: 100, height: 100 };
    const cells = generator.generateGrid(area);
    return cells.slice(0, count);
  };
  
  const defaultColors = {
    eggs: '#FFFBEB',
    youngLarvae: '#FEF3C7',
    oldLarvae: '#FDE68A',
    capped: '#D97706',
    mixed: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#D97706'],
  };
  
  describe('generatePattern', () => {
    it('should generate brood cells for EGGS', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'EGGS',
        colors: defaultColors,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      expect(broodCells.length).toBeGreaterThan(0);
      expect(broodCells.length).toBeLessThanOrEqual(cells.length);
      
      broodCells.forEach((cell) => {
        expect(cell.type).toBe('egg');
        expect(cell.color).toBe(defaultColors.eggs);
        expect(cell.broodAge).toBe('EGGS');
      });
    });
    
    it('should generate brood cells for YOUNG_LARVAE', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'YOUNG_LARVAE',
        colors: defaultColors,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      broodCells.forEach((cell) => {
        expect(cell.type).toBe('larva');
        expect(cell.color).toBe(defaultColors.youngLarvae);
        expect(cell.broodAge).toBe('YOUNG_LARVAE');
      });
    });
    
    it('should generate brood cells for OLD_LARVAE', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'OLD_LARVAE',
        colors: defaultColors,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      broodCells.forEach((cell) => {
        expect(cell.type).toBe('larva');
        expect(cell.color).toBe(defaultColors.oldLarvae);
        expect(cell.broodAge).toBe('OLD_LARVAE');
      });
    });
    
    it('should generate brood cells for CAPPED', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'CAPPED',
        colors: defaultColors,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      broodCells.forEach((cell) => {
        expect(cell.type).toBe('capped');
        expect(cell.color).toBe(defaultColors.capped);
        expect(cell.broodAge).toBe('CAPPED');
      });
    });
    
    it('should generate mixed brood cells for MIXED', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'MIXED',
        colors: defaultColors,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      broodCells.forEach((cell) => {
        expect(cell.broodAge).toBe('MIXED');
        expect(defaultColors.mixed).toContain(cell.color);
      });
    });
    
    it('should respect fillRatio option', () => {
      const cells = createTestCells(100);
      
      const fullGenerator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'EGGS',
        colors: defaultColors,
        fillRatio: 1.0,
      });
      
      const partialGenerator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'EGGS',
        colors: defaultColors,
        fillRatio: 0.5,
      });
      
      const fullCells = fullGenerator.generatePattern(cells);
      const partialCells = partialGenerator.generatePattern(cells);
      
      expect(fullCells.length).toBeGreaterThan(partialCells.length);
    });
    
    it('should add symbols when showSymbols is true', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'EGGS',
        colors: defaultColors,
        showSymbols: true,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      broodCells.forEach((cell) => {
        expect(cell.symbol).toBeDefined();
      });
    });
    
    it('should not add symbols when showSymbols is false', () => {
      const cells = createTestCells();
      const generator = new CellularPatternGenerator({
        cellSize: 10,
        broodAge: 'EGGS',
        colors: defaultColors,
        showSymbols: false,
      });
      
      const broodCells = generator.generatePattern(cells);
      
      broodCells.forEach((cell) => {
        expect(cell.symbol).toBeUndefined();
      });
    });
  });
  
  describe('broodCellToSVG', () => {
    it('should convert brood cell to SVG', () => {
      const cell: BroodCell = {
        center: { x: 50, y: 50 },
        size: 10,
        vertices: [
          { x: 60, y: 50 },
          { x: 55, y: 58.66 },
          { x: 45, y: 58.66 },
          { x: 40, y: 50 },
          { x: 45, y: 41.34 },
          { x: 55, y: 41.34 },
        ],
        type: 'egg',
        color: '#FFFBEB',
        symbol: '⚪',
      };
      
      const svg = CellularPatternGenerator.broodCellToSVG(cell);
      
      expect(svg.path).toContain('M');
      expect(svg.path).toContain('L');
      expect(svg.path).toContain('Z');
      expect(svg.fill).toBe('#FFFBEB');
      expect(svg.symbol).toBeDefined();
      expect(svg.symbol?.text).toBe('⚪');
    });
    
    it('should handle cell without symbol', () => {
      const cell: BroodCell = {
        center: { x: 50, y: 50 },
        size: 10,
        vertices: [
          { x: 60, y: 50 },
          { x: 55, y: 58.66 },
        ],
        type: 'larva',
        color: '#FEF3C7',
      };
      
      const svg = CellularPatternGenerator.broodCellToSVG(cell);
      
      expect(svg.symbol).toBeUndefined();
    });
  });
  
  describe('calculatePatternStats', () => {
    it('should calculate pattern statistics', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 0, y: 0 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
        },
        {
          center: { x: 10, y: 10 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
        },
        {
          center: { x: 20, y: 20 },
          size: 10,
          vertices: [],
          type: 'capped',
          color: '#D97706',
        },
      ];
      
      const stats = CellularPatternGenerator.calculatePatternStats(cells);
      
      expect(stats.total).toBe(3);
      expect(stats.byType.egg).toBe(2);
      expect(stats.byType.capped).toBe(1);
      expect(stats.fillRatio).toBe(1);
    });
    
    it('should calculate fillRatio correctly', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 0, y: 0 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
        },
        {
          center: { x: 10, y: 10 },
          size: 10,
          vertices: [],
          type: 'empty',
          color: '#F5F5DC',
        },
      ];
      
      const stats = CellularPatternGenerator.calculatePatternStats(cells);
      
      expect(stats.fillRatio).toBe(0.5);
    });
  });
  
  describe('filterByType', () => {
    it('should filter cells by type', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 0, y: 0 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
        },
        {
          center: { x: 10, y: 10 },
          size: 10,
          vertices: [],
          type: 'larva',
          color: '#FEF3C7',
        },
        {
          center: { x: 20, y: 20 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
        },
      ];
      
      const eggCells = CellularPatternGenerator.filterByType(cells, 'egg');
      
      expect(eggCells.length).toBe(2);
      eggCells.forEach((cell) => {
        expect(cell.type).toBe('egg');
      });
    });
  });
  
  describe('filterByBroodAge', () => {
    it('should filter cells by brood age', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 0, y: 0 },
          size: 10,
          vertices: [],
          type: 'egg',
          broodAge: 'EGGS',
          color: '#FFFBEB',
        },
        {
          center: { x: 10, y: 10 },
          size: 10,
          vertices: [],
          type: 'larva',
          broodAge: 'YOUNG_LARVAE',
          color: '#FEF3C7',
        },
        {
          center: { x: 20, y: 20 },
          size: 10,
          vertices: [],
          type: 'egg',
          broodAge: 'EGGS',
          color: '#FFFBEB',
        },
      ];
      
      const eggCells = CellularPatternGenerator.filterByBroodAge(cells, 'EGGS');
      
      expect(eggCells.length).toBe(2);
      eggCells.forEach((cell) => {
        expect(cell.broodAge).toBe('EGGS');
      });
    });
  });
  
  describe('getCellsWithSymbols', () => {
    it('should get cells with symbols', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 0, y: 0 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
          symbol: '⚪',
        },
        {
          center: { x: 10, y: 10 },
          size: 10,
          vertices: [],
          type: 'larva',
          color: '#FEF3C7',
        },
        {
          center: { x: 20, y: 20 },
          size: 10,
          vertices: [],
          type: 'capped',
          color: '#D97706',
          symbol: '●',
        },
      ];
      
      const symbolCells = CellularPatternGenerator.getCellsWithSymbols(cells);
      
      expect(symbolCells.length).toBe(2);
      symbolCells.forEach((cell) => {
        expect(cell.symbol).toBeDefined();
      });
    });
  });
  
  describe('applyGradient', () => {
    it('should apply gradient to cells', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 0, y: 0 },
          size: 10,
          vertices: [],
          type: 'larva',
          color: '#000000',
        },
        {
          center: { x: 10, y: 10 },
          size: 10,
          vertices: [],
          type: 'larva',
          color: '#000000',
        },
        {
          center: { x: 20, y: 20 },
          size: 10,
          vertices: [],
          type: 'larva',
          color: '#000000',
        },
      ];
      
      const gradientCells = CellularPatternGenerator.applyGradient(
        cells,
        '#FFFFFF',
        '#000000'
      );
      
      expect(gradientCells.length).toBe(3);
      expect(gradientCells[0].color).not.toBe(gradientCells[2].color);
    });
    
    it('should handle empty array', () => {
      const cells: BroodCell[] = [];
      const gradientCells = CellularPatternGenerator.applyGradient(
        cells,
        '#FFFFFF',
        '#000000'
      );
      
      expect(gradientCells.length).toBe(0);
    });
  });
  
  describe('createMixedPattern', () => {
    it('should create mixed pattern', () => {
      const hexCells = createTestCells(10);
      const colors = ['#FFFBEB', '#FEF3C7', '#FDE68A', '#D97706'];
      
      const mixedCells = CellularPatternGenerator.createMixedPattern(
        hexCells,
        colors,
        10
      );
      
      expect(mixedCells.length).toBe(hexCells.length);
      
      mixedCells.forEach((cell) => {
        expect(cell.broodAge).toBe('MIXED');
        expect(colors).toContain(cell.color);
      });
    });
    
    it('should include eggs and capped cells in mixed pattern', () => {
      const hexCells = createTestCells(10);
      const colors = ['#FFFBEB', '#FEF3C7'];
      
      const mixedCells = CellularPatternGenerator.createMixedPattern(
        hexCells,
        colors,
        10
      );
      
      const hasEggs = mixedCells.some((cell) => cell.type === 'egg');
      const hasCapped = mixedCells.some((cell) => cell.type === 'capped');
      
      expect(hasEggs).toBe(true);
      expect(hasCapped).toBe(true);
    });
  });
  
  describe('applyScatteredPattern', () => {
    it('should reduce number of cells', () => {
      const cells: BroodCell[] = Array.from({ length: 100 }, (_, i) => ({
        center: { x: i, y: i },
        size: 10,
        vertices: [],
        type: 'larva' as CellType,
        color: '#FEF3C7',
      }));
      
      const scatteredCells = CellularPatternGenerator.applyScatteredPattern(
        cells,
        0.5
      );
      
      expect(scatteredCells.length).toBeLessThan(cells.length);
    });
  });
  
  describe('groupByArea', () => {
    it('should group cells by area', () => {
      const cells: BroodCell[] = [
        {
          center: { x: 5, y: 5 },
          size: 10,
          vertices: [],
          type: 'egg',
          color: '#FFFBEB',
        },
        {
          center: { x: 15, y: 15 },
          size: 10,
          vertices: [],
          type: 'larva',
          color: '#FEF3C7',
        },
        {
          center: { x: 25, y: 25 },
          size: 10,
          vertices: [],
          type: 'capped',
          color: '#D97706',
        },
      ];
      
      const groups = CellularPatternGenerator.groupByArea(cells, 10);
      
      expect(groups.size).toBeGreaterThan(0);
      
      let totalCells = 0;
      groups.forEach((group) => {
        totalCells += group.length;
      });
      
      expect(totalCells).toBe(cells.length);
    });
  });
});
