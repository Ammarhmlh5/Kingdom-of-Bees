import { GradientGenerator, GradientDefinition } from './GradientGenerator';

describe('GradientGenerator', () => {
  describe('createSimpleGradient', () => {
    it('should create a simple horizontal gradient', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      expect(gradient.id).toBe('test');
      expect(gradient.direction).toBe('horizontal');
      expect(gradient.stops.length).toBe(2);
      expect(gradient.stops[0].color).toBe('#FF0000');
      expect(gradient.stops[0].offset).toBe(0);
      expect(gradient.stops[1].color).toBe('#0000FF');
      expect(gradient.stops[1].offset).toBe(100);
      expect(gradient.x1).toBe(0);
      expect(gradient.y1).toBe(0);
      expect(gradient.x2).toBe(100);
      expect(gradient.y2).toBe(0);
    });
    
    it('should create a simple vertical gradient', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'vertical'
      );
      
      expect(gradient.direction).toBe('vertical');
      expect(gradient.x1).toBe(0);
      expect(gradient.y1).toBe(0);
      expect(gradient.x2).toBe(0);
      expect(gradient.y2).toBe(100);
    });
    
    it('should create a simple diagonal gradient', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'diagonal'
      );
      
      expect(gradient.direction).toBe('diagonal');
      expect(gradient.x1).toBe(0);
      expect(gradient.y1).toBe(0);
      expect(gradient.x2).toBe(100);
      expect(gradient.y2).toBe(100);
    });
    
    it('should create a simple radial gradient', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'radial'
      );
      
      expect(gradient.direction).toBe('radial');
      expect(gradient.cx).toBe(50);
      expect(gradient.cy).toBe(50);
      expect(gradient.r).toBe(50);
    });
  });
  
  describe('createMultiColorGradient', () => {
    it('should create a multi-color gradient', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF'];
      const gradient = GradientGenerator.createMultiColorGradient('test', colors);
      
      expect(gradient.stops.length).toBe(3);
      expect(gradient.stops[0].color).toBe('#FF0000');
      expect(gradient.stops[0].offset).toBe(0);
      expect(gradient.stops[1].color).toBe('#00FF00');
      expect(gradient.stops[1].offset).toBe(50);
      expect(gradient.stops[2].color).toBe('#0000FF');
      expect(gradient.stops[2].offset).toBe(100);
    });
    
    it('should throw error for less than 2 colors', () => {
      expect(() => {
        GradientGenerator.createMultiColorGradient('test', ['#FF0000']);
      }).toThrow('يجب توفير لونين على الأقل');
    });
    
    it('should distribute colors evenly', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
      const gradient = GradientGenerator.createMultiColorGradient('test', colors);
      
      expect(gradient.stops.length).toBe(4);
      expect(gradient.stops[0].offset).toBe(0);
      expect(gradient.stops[1].offset).toBeCloseTo(33.33, 1);
      expect(gradient.stops[2].offset).toBeCloseTo(66.67, 1);
      expect(gradient.stops[3].offset).toBe(100);
    });
  });
  
  describe('createHoneyGradient', () => {
    it('should create honey gradient with correct colors', () => {
      const gradient = GradientGenerator.createHoneyGradient();
      
      expect(gradient.id).toBe('honeyGradient');
      expect(gradient.direction).toBe('vertical');
      expect(gradient.stops[0].color).toBe('#FEF9C3');
      expect(gradient.stops[1].color).toBe('#FDE047');
    });
    
    it('should accept custom id', () => {
      const gradient = GradientGenerator.createHoneyGradient('customHoney');
      
      expect(gradient.id).toBe('customHoney');
    });
  });
  
  describe('createBroodGradient', () => {
    it('should create EGGS gradient', () => {
      const gradient = GradientGenerator.createBroodGradient('test', 'EGGS');
      
      expect(gradient.stops[0].color).toBe('#FFFBEB');
      expect(gradient.stops[1].color).toBe('#FEF9C3');
    });
    
    it('should create YOUNG_LARVAE gradient', () => {
      const gradient = GradientGenerator.createBroodGradient('test', 'YOUNG_LARVAE');
      
      expect(gradient.stops[0].color).toBe('#FEF3C7');
      expect(gradient.stops[1].color).toBe('#FDE68A');
    });
    
    it('should create OLD_LARVAE gradient', () => {
      const gradient = GradientGenerator.createBroodGradient('test', 'OLD_LARVAE');
      
      expect(gradient.stops[0].color).toBe('#FDE68A');
      expect(gradient.stops[1].color).toBe('#FCD34D');
    });
    
    it('should create CAPPED gradient', () => {
      const gradient = GradientGenerator.createBroodGradient('test', 'CAPPED');
      
      expect(gradient.stops[0].color).toBe('#D97706');
      expect(gradient.stops[1].color).toBe('#B45309');
    });
    
    it('should create MIXED gradient with multiple colors', () => {
      const gradient = GradientGenerator.createBroodGradient('test', 'MIXED');
      
      expect(gradient.stops.length).toBe(4);
      expect(gradient.stops[0].color).toBe('#FFFBEB');
      expect(gradient.stops[3].color).toBe('#D97706');
    });
  });
  
  describe('createBeeBreadGradient', () => {
    it('should create beebread gradient with correct colors', () => {
      const gradient = GradientGenerator.createBeeBreadGradient();
      
      expect(gradient.id).toBe('beeBreadGradient');
      expect(gradient.direction).toBe('vertical');
      expect(gradient.stops.length).toBe(4);
      expect(gradient.stops[0].color).toBe('#FFEDD5');
      expect(gradient.stops[3].color).toBe('#FB923C');
    });
  });
  
  describe('toSVGLinearGradient', () => {
    it('should convert gradient to SVG linear gradient', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const svg = GradientGenerator.toSVGLinearGradient(gradient);
      
      expect(svg).toContain('<linearGradient id="test"');
      expect(svg).toContain('x1="0%" y1="0%" x2="100%" y2="0%"');
      expect(svg).toContain('<stop offset="0%" stop-color="#FF0000"');
      expect(svg).toContain('<stop offset="100%" stop-color="#0000FF"');
    });
    
    it('should include opacity in stops', () => {
      const gradient: GradientDefinition = {
        id: 'test',
        direction: 'horizontal',
        stops: [
          { color: '#FF0000', offset: 0, opacity: 0.5 },
          { color: '#0000FF', offset: 100, opacity: 0.8 },
        ],
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
      };
      
      const svg = GradientGenerator.toSVGLinearGradient(gradient);
      
      expect(svg).toContain('stop-opacity="0.5"');
      expect(svg).toContain('stop-opacity="0.8"');
    });
  });
  
  describe('toSVGRadialGradient', () => {
    it('should convert gradient to SVG radial gradient', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'radial'
      );
      
      const svg = GradientGenerator.toSVGRadialGradient(gradient);
      
      expect(svg).toContain('<radialGradient id="test"');
      expect(svg).toContain('cx="50%" cy="50%" r="50%"');
      expect(svg).toContain('<stop offset="0%" stop-color="#FF0000"');
      expect(svg).toContain('<stop offset="100%" stop-color="#0000FF"');
    });
  });
  
  describe('toSVG', () => {
    it('should convert linear gradient to SVG', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const svg = GradientGenerator.toSVG(gradient);
      
      expect(svg).toContain('<linearGradient');
    });
    
    it('should convert radial gradient to SVG', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'radial'
      );
      
      const svg = GradientGenerator.toSVG(gradient);
      
      expect(svg).toContain('<radialGradient');
    });
  });
  
  describe('toCSS', () => {
    it('should convert horizontal gradient to CSS', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const css = GradientGenerator.toCSS(gradient);
      
      expect(css).toBe('linear-gradient(to right, #FF0000 0%, #0000FF 100%)');
    });
    
    it('should convert vertical gradient to CSS', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'vertical'
      );
      
      const css = GradientGenerator.toCSS(gradient);
      
      expect(css).toBe('linear-gradient(to bottom, #FF0000 0%, #0000FF 100%)');
    });
    
    it('should convert diagonal gradient to CSS', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'diagonal'
      );
      
      const css = GradientGenerator.toCSS(gradient);
      
      expect(css).toBe('linear-gradient(to bottom right, #FF0000 0%, #0000FF 100%)');
    });
    
    it('should convert radial gradient to CSS', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'radial'
      );
      
      const css = GradientGenerator.toCSS(gradient);
      
      expect(css).toBe('radial-gradient(circle, #FF0000 0%, #0000FF 100%)');
    });
    
    it('should handle opacity in CSS', () => {
      const gradient: GradientDefinition = {
        id: 'test',
        direction: 'horizontal',
        stops: [
          { color: '#FF0000', offset: 0, opacity: 0.5 },
          { color: '#0000FF', offset: 100, opacity: 0.8 },
        ],
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
      };
      
      const css = GradientGenerator.toCSS(gradient);
      
      expect(css).toContain('rgba(255, 0, 0, 0.5)');
      expect(css).toContain('rgba(0, 0, 255, 0.8)');
    });
  });
  
  describe('reverseGradient', () => {
    it('should reverse gradient stops', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const reversed = GradientGenerator.reverseGradient(gradient);
      
      expect(reversed.id).toBe('test_reversed');
      expect(reversed.stops[0].color).toBe('#0000FF');
      expect(reversed.stops[0].offset).toBe(0);
      expect(reversed.stops[1].color).toBe('#FF0000');
      expect(reversed.stops[1].offset).toBe(100);
    });
    
    it('should reverse multi-color gradient', () => {
      const gradient = GradientGenerator.createMultiColorGradient(
        'test',
        ['#FF0000', '#00FF00', '#0000FF']
      );
      
      const reversed = GradientGenerator.reverseGradient(gradient);
      
      expect(reversed.stops[0].color).toBe('#0000FF');
      expect(reversed.stops[2].color).toBe('#FF0000');
    });
  });
  
  describe('applyOpacity', () => {
    it('should apply opacity to all stops', () => {
      const gradient = GradientGenerator.createSimpleGradient(
        'test',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const withOpacity = GradientGenerator.applyOpacity(gradient, 0.5);
      
      expect(withOpacity.id).toBe('test_opacity_0.5');
      expect(withOpacity.stops[0].opacity).toBe(0.5);
      expect(withOpacity.stops[1].opacity).toBe(0.5);
    });
    
    it('should multiply existing opacity', () => {
      const gradient: GradientDefinition = {
        id: 'test',
        direction: 'horizontal',
        stops: [
          { color: '#FF0000', offset: 0, opacity: 0.8 },
          { color: '#0000FF', offset: 100, opacity: 0.6 },
        ],
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
      };
      
      const withOpacity = GradientGenerator.applyOpacity(gradient, 0.5);
      
      expect(withOpacity.stops[0].opacity).toBe(0.4); // 0.8 * 0.5
      expect(withOpacity.stops[1].opacity).toBe(0.3); // 0.6 * 0.5
    });
  });
  
  describe('mergeGradients', () => {
    it('should merge two gradients', () => {
      const gradient1 = GradientGenerator.createSimpleGradient(
        'g1',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const gradient2 = GradientGenerator.createSimpleGradient(
        'g2',
        '#00FF00',
        '#FFFF00',
        'horizontal'
      );
      
      const merged = GradientGenerator.mergeGradients(gradient1, gradient2, 0.5);
      
      expect(merged.id).toBe('g1_g2_merged');
      expect(merged.stops.length).toBeGreaterThanOrEqual(2);
    });
    
    it('should throw error for different directions', () => {
      const gradient1 = GradientGenerator.createSimpleGradient(
        'g1',
        '#FF0000',
        '#0000FF',
        'horizontal'
      );
      
      const gradient2 = GradientGenerator.createSimpleGradient(
        'g2',
        '#00FF00',
        '#FFFF00',
        'vertical'
      );
      
      expect(() => {
        GradientGenerator.mergeGradients(gradient1, gradient2);
      }).toThrow('لا يمكن دمج تدرجات بات اتجاهات مختلفة');
    });
  });
});
