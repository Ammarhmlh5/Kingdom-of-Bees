import {
  HexagonalPatternGenerator,
  Point,
  HexCell,
  Area,
} from './HexagonalPatternGenerator';

describe('HexagonalPatternGenerator', () => {
  describe('generateGrid', () => {
    it('should generate hexagonal grid in horizontal orientation', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
        orientation: 'horizontal',
      });
      
      const area: Area = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      const cells = generator.generateGrid(area);
      
      expect(cells.length).toBeGreaterThan(0);
      expect(cells[0].vertices.length).toBe(6);
    });
    
    it('should generate hexagonal grid in vertical orientation', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
        orientation: 'vertical',
      });
      
      const area: Area = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      
      const cells = generator.generateGrid(area);
      
      expect(cells.length).toBeGreaterThan(0);
      expect(cells[0].vertices.length).toBe(6);
    });
    
    it('should generate more cells for larger area', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const smallArea: Area = { x: 0, y: 0, width: 50, height: 50 };
      const largeArea: Area = { x: 0, y: 0, width: 200, height: 200 };
      
      const smallCells = generator.generateGrid(smallArea);
      const largeCells = generator.generateGrid(largeArea);
      
      expect(largeCells.length).toBeGreaterThan(smallCells.length);
    });
    
    it('should generate fewer cells for larger cell size', () => {
      const smallCellGenerator = new HexagonalPatternGenerator({
        cellSize: 5,
      });
      
      const largeCellGenerator = new HexagonalPatternGenerator({
        cellSize: 20,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      
      const smallCells = smallCellGenerator.generateGrid(area);
      const largeCells = largeCellGenerator.generateGrid(area);
      
      expect(smallCells.length).toBeGreaterThan(largeCells.length);
    });
    
    it('should respect spacing between cells', () => {
      const noSpacingGenerator = new HexagonalPatternGenerator({
        cellSize: 10,
        spacing: 0,
      });
      
      const spacingGenerator = new HexagonalPatternGenerator({
        cellSize: 10,
        spacing: 5,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      
      const noSpacingCells = noSpacingGenerator.generateGrid(area);
      const spacingCells = spacingGenerator.generateGrid(area);
      
      // مع المسافات، يجب أن يكون عدد الخلايا أقل
      expect(spacingCells.length).toBeLessThan(noSpacingCells.length);
    });
    
    it('should generate cells with correct center positions', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      // التحقق من أن جميع المراكز داخل المنطقة (مع هامش)
      cells.forEach((cell) => {
        expect(cell.center.x).toBeGreaterThanOrEqual(area.x - cell.size);
        expect(cell.center.x).toBeLessThanOrEqual(area.x + area.width + cell.size);
        expect(cell.center.y).toBeGreaterThanOrEqual(area.y - cell.size);
        expect(cell.center.y).toBeLessThanOrEqual(area.y + area.height + cell.size);
      });
    });
  });
  
  describe('hexCellToSVGPath', () => {
    it('should convert hex cell to SVG path', () => {
      const cell: HexCell = {
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
      };
      
      const path = HexagonalPatternGenerator.hexCellToSVGPath(cell);
      
      expect(path).toContain('M');
      expect(path).toContain('L');
      expect(path).toContain('Z');
      expect(path).toContain('60,50');
    });
    
    it('should return empty string for cell with no vertices', () => {
      const cell: HexCell = {
        center: { x: 50, y: 50 },
        size: 10,
        vertices: [],
      };
      
      const path = HexagonalPatternGenerator.hexCellToSVGPath(cell);
      
      expect(path).toBe('');
    });
  });
  
  describe('calculateHexArea', () => {
    it('should calculate correct area for hexagon', () => {
      const size = 10;
      const area = HexagonalPatternGenerator.calculateHexArea(size);
      
      // المساحة = (3 * sqrt(3) * size^2) / 2
      const expectedArea = (3 * Math.sqrt(3) * 100) / 2;
      
      expect(area).toBeCloseTo(expectedArea, 5);
    });
    
    it('should return larger area for larger size', () => {
      const smallArea = HexagonalPatternGenerator.calculateHexArea(5);
      const largeArea = HexagonalPatternGenerator.calculateHexArea(10);
      
      expect(largeArea).toBeGreaterThan(smallArea);
    });
  });
  
  describe('calculateHexPerimeter', () => {
    it('should calculate correct perimeter for hexagon', () => {
      const size = 10;
      const perimeter = HexagonalPatternGenerator.calculateHexPerimeter(size);
      
      expect(perimeter).toBe(60);
    });
    
    it('should return larger perimeter for larger size', () => {
      const smallPerimeter = HexagonalPatternGenerator.calculateHexPerimeter(5);
      const largePerimeter = HexagonalPatternGenerator.calculateHexPerimeter(10);
      
      expect(largePerimeter).toBeGreaterThan(smallPerimeter);
    });
  });
  
  describe('isPointInHex', () => {
    it('should return true for point inside hexagon', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      if (cells.length > 0) {
        const cell = cells[0];
        const centerPoint = cell.center;
        
        const isInside = HexagonalPatternGenerator.isPointInHex(centerPoint, cell);
        
        expect(isInside).toBe(true);
      }
    });
    
    it('should return false for point outside hexagon', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      if (cells.length > 0) {
        const cell = cells[0];
        const outsidePoint: Point = {
          x: cell.center.x + 1000,
          y: cell.center.y + 1000,
        };
        
        const isInside = HexagonalPatternGenerator.isPointInHex(outsidePoint, cell);
        
        expect(isInside).toBe(false);
      }
    });
  });
  
  describe('findNearestCell', () => {
    it('should find nearest cell to a point', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      if (cells.length > 1) {
        const targetCell = cells[5];
        const point = targetCell.center;
        
        const nearestCell = HexagonalPatternGenerator.findNearestCell(point, cells);
        
        expect(nearestCell).toBe(targetCell);
      }
    });
    
    it('should return null for empty cells array', () => {
      const point: Point = { x: 50, y: 50 };
      const nearestCell = HexagonalPatternGenerator.findNearestCell(point, []);
      
      expect(nearestCell).toBeNull();
    });
    
    it('should return the only cell for single cell array', () => {
      const cell: HexCell = {
        center: { x: 50, y: 50 },
        size: 10,
        vertices: [],
      };
      
      const point: Point = { x: 100, y: 100 };
      const nearestCell = HexagonalPatternGenerator.findNearestCell(point, [cell]);
      
      expect(nearestCell).toBe(cell);
    });
  });
  
  describe('filterCellsInArea', () => {
    it('should filter cells that are inside area', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const largeArea: Area = { x: 0, y: 0, width: 200, height: 200 };
      const cells = generator.generateGrid(largeArea);
      
      const smallArea: Area = { x: 50, y: 50, width: 50, height: 50 };
      const filteredCells = HexagonalPatternGenerator.filterCellsInArea(cells, smallArea);
      
      expect(filteredCells.length).toBeLessThan(cells.length);
      expect(filteredCells.length).toBeGreaterThan(0);
    });
    
    it('should return empty array for area with no cells', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      const emptyArea: Area = { x: 1000, y: 1000, width: 50, height: 50 };
      const filteredCells = HexagonalPatternGenerator.filterCellsInArea(cells, emptyArea);
      
      expect(filteredCells.length).toBe(0);
    });
    
    it('should include cells with vertices in area', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      const filteredCells = HexagonalPatternGenerator.filterCellsInArea(cells, area);
      
      // يجب أن تكون جميع الخلايا المصفاة لها على الأقل رأس واحد داخل المنطقة
      filteredCells.forEach((cell) => {
        const hasVertexInside = cell.vertices.some(
          (vertex) =>
            vertex.x >= area.x &&
            vertex.x <= area.x + area.width &&
            vertex.y >= area.y &&
            vertex.y <= area.y + area.height
        );
        
        const centerInside =
          cell.center.x >= area.x &&
          cell.center.x <= area.x + area.width &&
          cell.center.y >= area.y &&
          cell.center.y <= area.y + area.height;
        
        expect(hasVertexInside || centerInside).toBe(true);
      });
    });
  });
  
  describe('hex vertices calculation', () => {
    it('should generate 6 vertices for each cell', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      cells.forEach((cell) => {
        expect(cell.vertices.length).toBe(6);
      });
    });
    
    it('should generate vertices at correct distance from center', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      if (cells.length > 0) {
        const cell = cells[0];
        
        cell.vertices.forEach((vertex) => {
          const dx = vertex.x - cell.center.x;
          const dy = vertex.y - cell.center.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          expect(distance).toBeCloseTo(cell.size, 5);
        });
      }
    });
  });
  
  describe('edge cases', () => {
    it('should handle very small area', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 5, height: 5 };
      const cells = generator.generateGrid(area);
      
      // قد لا تكون هناك خلايا أو خلية واحدة فقط
      expect(cells.length).toBeGreaterThanOrEqual(0);
    });
    
    it('should handle very large area', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 0, y: 0, width: 1000, height: 1000 };
      const cells = generator.generateGrid(area);
      
      expect(cells.length).toBeGreaterThan(100);
    });
    
    it('should handle area with offset position', () => {
      const generator = new HexagonalPatternGenerator({
        cellSize: 10,
      });
      
      const area: Area = { x: 100, y: 100, width: 100, height: 100 };
      const cells = generator.generateGrid(area);
      
      expect(cells.length).toBeGreaterThan(0);
      
      // التحقق من أن الخلايا في الموضع الصحيح
      cells.forEach((cell) => {
        expect(cell.center.x).toBeGreaterThanOrEqual(area.x - cell.size);
        expect(cell.center.y).toBeGreaterThanOrEqual(area.y - cell.size);
      });
    });
  });
});
