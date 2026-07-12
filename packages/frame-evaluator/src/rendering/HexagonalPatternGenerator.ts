/**
 * مولد الأنماط السداسية (Hexagonal Pattern Generator)
 * 
 * يستخدم لتوليد شبكة من الأشكال السداسية لتمثيل خلايا العسل
 * في طبقة العسل من الإطار
 */

/**
 * نقطة في الفضاء ثنائي الأبعاد
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * خلية سداسية
 */
export interface HexCell {
  center: Point;
  size: number;
  vertices: Point[];
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
 * خيارات توليد الشبكة السداسية
 */
export interface HexagonalGridOptions {
  /** حجم الخلية السداسية (نصف القطر) */
  cellSize: number;
  
  /** المسافة بين الخلايا (0 = متلاصقة، > 0 = متباعدة) */
  spacing?: number;
  
  /** نوع التوجيه (أفقي أو عمودي) */
  orientation?: 'horizontal' | 'vertical';
  
  /** إزاحة الصفوف (لإنشاء نمط متداخل) */
  offset?: number;
}

/**
 * فئة مولد الأنماط السداسية
 */
export class HexagonalPatternGenerator {
  private options: Required<HexagonalGridOptions>;
  
  constructor(options: HexagonalGridOptions) {
    this.options = {
      cellSize: options.cellSize,
      spacing: options.spacing ?? 0,
      orientation: options.orientation ?? 'horizontal',
      offset: options.offset ?? 0.5,
    };
  }
  
  /**
   * توليد شبكة سداسية في منطقة محددة
   */
  generateGrid(area: Area): HexCell[] {
    if (this.options.orientation === 'horizontal') {
      return this.generateHorizontalGrid(area);
    } else {
      return this.generateVerticalGrid(area);
    }
  }
  
  /**
   * توليد شبكة سداسية أفقية
   * (الأشكال السداسية موجهة بحيث يكون لها ضلعان أفقيان)
   */
  private generateHorizontalGrid(area: Area): HexCell[] {
    const cells: HexCell[] = [];
    const size = this.options.cellSize;
    const spacing = this.options.spacing;
    
    // حساب أبعاد الخلية السداسية
    const hexWidth = size * 2;
    const hexHeight = size * Math.sqrt(3);
    
    // المسافة بين مراكز الخلايا
    const horizontalSpacing = hexWidth * 0.75 + spacing;
    const verticalSpacing = hexHeight + spacing;
    
    // حساب عدد الصفوف والأعمدة
    const numRows = Math.ceil(area.height / verticalSpacing) + 1;
    const numCols = Math.ceil(area.width / horizontalSpacing) + 2;
    
    // توليد الخلايا
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        // حساب موضع المركز
        const x = area.x + col * horizontalSpacing;
        const y = area.y + row * verticalSpacing;
        
        // إزاحة الصفوف الفردية
        const offsetX = (row % 2) * horizontalSpacing * this.options.offset;
        
        const center: Point = {
          x: x + offsetX,
          y: y,
        };
        
        // التحقق من أن المركز داخل المنطقة (مع هامش)
        if (this.isPointInArea(center, area, size)) {
          const cell = this.createHexCell(center, size, 'horizontal');
          cells.push(cell);
        }
      }
    }
    
    return cells;
  }
  
  /**
   * توليد شبكة سداسية عمودية
   * (الأشكال السداسية موجهة بحيث يكون لها رأسان عموديان)
   */
  private generateVerticalGrid(area: Area): HexCell[] {
    const cells: HexCell[] = [];
    const size = this.options.cellSize;
    const spacing = this.options.spacing;
    
    // حساب أبعاد الخلية السداسية
    const hexWidth = size * Math.sqrt(3);
    const hexHeight = size * 2;
    
    // المسافة بين مراكز الخلايا
    const horizontalSpacing = hexWidth + spacing;
    const verticalSpacing = hexHeight * 0.75 + spacing;
    
    // حساب عدد الصفوف والأعمدة
    const numRows = Math.ceil(area.height / verticalSpacing) + 2;
    const numCols = Math.ceil(area.width / horizontalSpacing) + 1;
    
    // توليد الخلايا
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        // حساب موضع المركز
        const x = area.x + col * horizontalSpacing;
        const y = area.y + row * verticalSpacing;
        
        // إزاحة الأعمدة الفردية
        const offsetY = (col % 2) * verticalSpacing * this.options.offset;
        
        const center: Point = {
          x: x,
          y: y + offsetY,
        };
        
        // التحقق من أن المركز داخل المنطقة (مع هامش)
        if (this.isPointInArea(center, area, size)) {
          const cell = this.createHexCell(center, size, 'vertical');
          cells.push(cell);
        }
      }
    }
    
    return cells;
  }
  
  /**
   * إنشاء خلية سداسية
   */
  private createHexCell(
    center: Point,
    size: number,
    orientation: 'horizontal' | 'vertical'
  ): HexCell {
    const vertices = this.calculateHexVertices(center, size, orientation);
    
    return {
      center,
      size,
      vertices,
    };
  }
  
  /**
   * حساب رؤوس الشكل السداسي
   */
  private calculateHexVertices(
    center: Point,
    size: number,
    orientation: 'horizontal' | 'vertical'
  ): Point[] {
    const vertices: Point[] = [];
    
    // زاوية البداية تعتمد على التوجيه
    const startAngle = orientation === 'horizontal' ? 0 : Math.PI / 6;
    
    // حساب 6 رؤوس
    for (let i = 0; i < 6; i++) {
      const angle = startAngle + (i * Math.PI) / 3;
      const x = center.x + size * Math.cos(angle);
      const y = center.y + size * Math.sin(angle);
      
      vertices.push({ x, y });
    }
    
    return vertices;
  }
  
  /**
   * التحقق من أن نقطة داخل منطقة (مع هامش)
   */
  private isPointInArea(point: Point, area: Area, margin: number = 0): boolean {
    return (
      point.x >= area.x - margin &&
      point.x <= area.x + area.width + margin &&
      point.y >= area.y - margin &&
      point.y <= area.y + area.height + margin
    );
  }
  
  /**
   * تحويل خلية سداسية إلى مسار SVG
   */
  static hexCellToSVGPath(cell: HexCell): string {
    if (cell.vertices.length === 0) {
      return '';
    }
    
    // البداية من أول رأس
    let path = `M ${cell.vertices[0].x},${cell.vertices[0].y}`;
    
    // رسم خطوط إلى باقي الرؤوس
    for (let i = 1; i < cell.vertices.length; i++) {
      path += ` L ${cell.vertices[i].x},${cell.vertices[i].y}`;
    }
    
    // إغلاق المسار
    path += ' Z';
    
    return path;
  }
  
  /**
   * حساب مساحة الشكل السداسي
   */
  static calculateHexArea(size: number): number {
    return (3 * Math.sqrt(3) * size * size) / 2;
  }
  
  /**
   * حساب محيط الشكل السداسي
   */
  static calculateHexPerimeter(size: number): number {
    return 6 * size;
  }
  
  /**
   * التحقق من أن نقطة داخل شكل سداسي
   */
  static isPointInHex(point: Point, cell: HexCell): boolean {
    // استخدام خوارزمة Ray Casting
    let inside = false;
    const vertices = cell.vertices;
    
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;
      
      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      
      if (intersect) {
        inside = !inside;
      }
    }
    
    return inside;
  }
  
  /**
   * إيجاد أقرب خلية سداسية لنقطة معينة
   */
  static findNearestCell(point: Point, cells: HexCell[]): HexCell | null {
    if (cells.length === 0) {
      return null;
    }
    
    let nearestCell = cells[0];
    let minDistance = this.distanceBetweenPoints(point, nearestCell.center);
    
    for (let i = 1; i < cells.length; i++) {
      const distance = this.distanceBetweenPoints(point, cells[i].center);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCell = cells[i];
      }
    }
    
    return nearestCell;
  }
  
  /**
   * حساب المسافة بين نقطتين
   */
  private static distanceBetweenPoints(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * تصفية الخلايا التي تتقاطع مع منطقة معينة
   */
  static filterCellsInArea(cells: HexCell[], area: Area): HexCell[] {
    return cells.filter((cell) => {
      // التحقق من أن مركز الخلية داخل المنطقة
      // أو أن أي رأس من رؤوس الخلية داخل المنطقة
      const centerInside =
        cell.center.x >= area.x &&
        cell.center.x <= area.x + area.width &&
        cell.center.y >= area.y &&
        cell.center.y <= area.y + area.height;
      
      if (centerInside) {
        return true;
      }
      
      // التحقق من الرؤوس
      for (const vertex of cell.vertices) {
        if (
          vertex.x >= area.x &&
          vertex.x <= area.x + area.width &&
          vertex.y >= area.y &&
          vertex.y <= area.y + area.height
        ) {
          return true;
        }
      }
      
      return false;
    });
  }
}
