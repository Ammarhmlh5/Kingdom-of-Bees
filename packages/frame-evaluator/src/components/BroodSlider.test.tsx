/**
 * BroodSlider Component Tests
 * اختبارات مكون مؤشر الحضنة
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BroodSlider } from './BroodSlider';
import { BroodAge } from '../types';

// Mock useDrag hook
jest.mock('../hooks/useDrag', () => ({
  useDrag: jest.fn(() => ({
    handlers: {
      onMouseDown: jest.fn(),
      onMouseMove: jest.fn(),
      onMouseUp: jest.fn(),
      onTouchStart: jest.fn(),
      onTouchMove: jest.fn(),
      onTouchEnd: jest.fn(),
    },
    isDragging: false,
    setContainerRef: jest.fn(),
  })),
}));

describe('BroodSlider', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should display brood icon and label', () => {
      render(<BroodSlider value={50} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText(/🐝 حضنة/)).toBeInTheDocument();
    });

    it('should display percentage value', () => {
      render(<BroodSlider value={75} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<BroodSlider value={50} onChange={mockOnChange} showLabel={false} />);
      expect(screen.queryByText(/🐝 حضنة/)).not.toBeInTheDocument();
    });

    it('should render with small size', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} size="small" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.height).toBe('40px');
    });

    it('should render with medium size', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} size="medium" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.height).toBe('50px');
    });

    it('should render with large size', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} size="large" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.height).toBe('60px');
    });
  });

  describe('Value Display', () => {
    it('should display 0% correctly', () => {
      render(<BroodSlider value={0} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display 100% correctly', () => {
      render(<BroodSlider value={100} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should display intermediate values correctly', () => {
      render(<BroodSlider value={42} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should set progress bar width to match value', () => {
      const { container } = render(
        <BroodSlider value={60} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 60%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should update progress bar when value changes', () => {
      const { container, rerender } = render(
        <BroodSlider value={30} onChange={mockOnChange} />
      );
      
      let progressBar = container.querySelector('div[style*="width: 30%"]');
      expect(progressBar).toBeInTheDocument();

      rerender(<BroodSlider value={70} onChange={mockOnChange} />);
      
      progressBar = container.querySelector('div[style*="width: 70%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Brood Age Colors', () => {
    it('should use eggs color for EGGS age', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="EGGS" />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(255, 251, 235)'); // #FFFBEB
    });

    it('should use young larvae color for YOUNG_LARVAE age', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="YOUNG_LARVAE" />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(254, 243, 199)'); // #FEF3C7
    });

    it('should use old larvae color for OLD_LARVAE age', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="OLD_LARVAE" />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(253, 230, 138)'); // #FDE68A
    });

    it('should use capped color for CAPPED age', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="CAPPED" />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(217, 119, 6)'); // #D97706
    });

    it('should use young larvae color for MIXED age (default)', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="MIXED" />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(254, 243, 199)'); // #FEF3C7
    });

    it('should accept custom color', () => {
      const customColor = '#FF0000';
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} color={customColor} />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(255, 0, 0)'); // #FF0000
    });
  });

  describe('Background Gradient', () => {
    it('should render background for MIXED brood age', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="MIXED" />
      );
      
      // التحقق من وجود عنصر الخلفية
      const backgrounds = container.querySelectorAll('div');
      expect(backgrounds.length).toBeGreaterThan(0);
      
      // التحقق من أن هناك عنصر يحتوي على خلفية
      const hasBackground = Array.from(backgrounds).some(el => {
        const style = (el as HTMLElement).style.background;
        return style && style.length > 0;
      });
      
      expect(hasBackground).toBe(true);
    });

    it('should render background for non-MIXED brood age', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} broodAge="EGGS" />
      );
      
      // التحقق من وجود عنصر الخلفية
      const backgrounds = container.querySelectorAll('div');
      expect(backgrounds.length).toBeGreaterThan(0);
      
      // التحقق من أن هناك عنصر يحتوي على خلفية
      const hasBackground = Array.from(backgrounds).some(el => {
        const style = (el as HTMLElement).style.background;
        return style && style.length > 0;
      });
      
      expect(hasBackground).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled cursor when disabled', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} disabled={true} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.cursor).toBe('not-allowed');
    });

    it('should apply normal cursor when not disabled', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} disabled={false} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.cursor).toBe('ew-resize');
    });

    it('should reduce opacity when disabled', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} disabled={true} />
      );
      const background = container.querySelector('div[style*="opacity: 0.5"]');
      expect(background).toBeInTheDocument();
    });
  });

  describe('Snap Points', () => {
    it('should render snap points when provided', () => {
      const snapPoints = [0, 25, 50, 75, 100];
      const { container } = render(
        <BroodSlider
          value={50}
          onChange={mockOnChange}
          snapPoints={snapPoints}
        />
      );
      
      const snapPointElements = container.querySelectorAll('div[style*="width: 2px"]');
      expect(snapPointElements.length).toBe(snapPoints.length);
    });

    it('should position snap points correctly', () => {
      const snapPoints = [0, 50, 100];
      const { container } = render(
        <BroodSlider
          value={50}
          onChange={mockOnChange}
          snapPoints={snapPoints}
        />
      );
      
      const snapPoint50 = container.querySelector('div[style*="left: 50%"]');
      expect(snapPoint50).toBeInTheDocument();
    });

    it('should not render snap points when not provided', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} snapPoints={[]} />
      );
      
      const snapPointElements = container.querySelectorAll('div[style*="width: 2px"]');
      expect(snapPointElements.length).toBe(0);
    });
  });

  describe('Integration with useDrag', () => {
    it('should pass correct orientation to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(<BroodSlider value={50} onChange={mockOnChange} />);
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'horizontal',
        })
      );
    });

    it('should pass value and onChange to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(<BroodSlider value={75} onChange={mockOnChange} />);
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 75,
          onChange: mockOnChange,
        })
      );
    });

    it('should pass disabled state to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(<BroodSlider value={50} onChange={mockOnChange} disabled={true} />);
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
        })
      );
    });

    it('should pass snap points to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      const snapPoints = [0, 25, 50, 75, 100];
      
      render(
        <BroodSlider
          value={50}
          onChange={mockOnChange}
          snapPoints={snapPoints}
        />
      );
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          snapPoints,
        })
      );
    });

    it('should pass haptic feedback setting to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(
        <BroodSlider
          value={50}
          onChange={mockOnChange}
          hapticFeedback={false}
        />
      );
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          hapticFeedback: false,
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should prevent text selection', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.userSelect).toBe('none');
    });

    it('should disable touch actions', () => {
      const { container } = render(
        <BroodSlider value={50} onChange={mockOnChange} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.touchAction).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    it('should handle value of 0', () => {
      const { container } = render(
        <BroodSlider value={0} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle value of 100', () => {
      const { container } = render(
        <BroodSlider value={100} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<BroodSlider value={42.5} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('42.5%')).toBeInTheDocument();
    });

    it('should handle all brood ages', () => {
      const ages: BroodAge[] = ['EGGS', 'YOUNG_LARVAE', 'OLD_LARVAE', 'CAPPED', 'MIXED'];
      
      ages.forEach(age => {
        const { container } = render(
          <BroodSlider value={50} onChange={mockOnChange} broodAge={age} />
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
