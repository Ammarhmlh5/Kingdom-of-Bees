/**
 * HoneySlider Component Tests
 * اختبارات مكون مؤشر العسل
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HoneySlider } from './HoneySlider';

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

describe('HoneySlider', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should display honey icon and label', () => {
      render(<HoneySlider value={50} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText(/🍯 عسل/)).toBeInTheDocument();
    });

    it('should display percentage value', () => {
      render(<HoneySlider value={75} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<HoneySlider value={50} onChange={mockOnChange} showLabel={false} />);
      expect(screen.queryByText(/🍯 عسل/)).not.toBeInTheDocument();
    });

    it('should render with small size', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} size="small" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.height).toBe('40px');
    });

    it('should render with medium size', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} size="medium" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.height).toBe('50px');
    });

    it('should render with large size', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} size="large" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.height).toBe('60px');
    });
  });

  describe('Value Display', () => {
    it('should display 0% correctly', () => {
      render(<HoneySlider value={0} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display 100% correctly', () => {
      render(<HoneySlider value={100} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should display intermediate values correctly', () => {
      render(<HoneySlider value={42} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should set progress bar width to match value', () => {
      const { container } = render(
        <HoneySlider value={60} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 60%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should update progress bar when value changes', () => {
      const { container, rerender } = render(
        <HoneySlider value={30} onChange={mockOnChange} />
      );
      
      let progressBar = container.querySelector('div[style*="width: 30%"]');
      expect(progressBar).toBeInTheDocument();

      rerender(<HoneySlider value={70} onChange={mockOnChange} />);
      
      progressBar = container.querySelector('div[style*="width: 70%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Color Gradient', () => {
    it('should use light color for low values (0-30%)', () => {
      const { container } = render(
        <HoneySlider value={20} onChange={mockOnChange} />
      );
      // البحث عن شريط التقدم بناءً على العرض 20%
      const progressBar = container.querySelector('div[style*="width: 20%"]');
      expect(progressBar).toBeInTheDocument();
      
      // التحقق من أن اللون الفاتح يُستخدم (المتصفح يحول HEX إلى RGB)
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(254, 249, 195)'); // #FEF9C3
    });

    it('should use medium color for mid values (31-60%)', () => {
      const { container } = render(
        <HoneySlider value={45} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 45%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(254, 240, 138)'); // #FEF08A
    });

    it('should use dark color for high values (61-100%)', () => {
      const { container } = render(
        <HoneySlider value={80} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 80%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(253, 224, 71)'); // #FDE047
    });

    it('should accept custom color', () => {
      const customColor = '#FF0000';
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} color={customColor} />
      );
      const progressBar = container.querySelector('div[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
      
      const bgColor = (progressBar as HTMLElement).style.background;
      expect(bgColor).toBe('rgb(255, 0, 0)'); // #FF0000
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled cursor when disabled', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} disabled={true} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.cursor).toBe('not-allowed');
    });

    it('should apply normal cursor when not disabled', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} disabled={false} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.cursor).toBe('ew-resize');
    });

    it('should reduce opacity when disabled', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} disabled={true} />
      );
      const background = container.querySelector('div[style*="opacity: 0.5"]');
      expect(background).toBeInTheDocument();
    });
  });

  describe('Snap Points', () => {
    it('should render snap points when provided', () => {
      const snapPoints = [0, 25, 50, 75, 100];
      const { container } = render(
        <HoneySlider
          value={50}
          onChange={mockOnChange}
          snapPoints={snapPoints}
        />
      );
      
      // يجب أن يكون هناك 5 نقاط التصاق
      const snapPointElements = container.querySelectorAll('div[style*="width: 2px"]');
      expect(snapPointElements.length).toBe(snapPoints.length);
    });

    it('should position snap points correctly', () => {
      const snapPoints = [0, 50, 100];
      const { container } = render(
        <HoneySlider
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
        <HoneySlider value={50} onChange={mockOnChange} snapPoints={[]} />
      );
      
      const snapPointElements = container.querySelectorAll('div[style*="width: 2px"]');
      expect(snapPointElements.length).toBe(0);
    });
  });

  describe('Integration with useDrag', () => {
    it('should pass correct orientation to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(<HoneySlider value={50} onChange={mockOnChange} />);
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'horizontal',
        })
      );
    });

    it('should pass value and onChange to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(<HoneySlider value={75} onChange={mockOnChange} />);
      
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 75,
          onChange: mockOnChange,
        })
      );
    });

    it('should pass disabled state to useDrag', () => {
      const { useDrag } = require('../hooks/useDrag');
      
      render(<HoneySlider value={50} onChange={mockOnChange} disabled={true} />);
      
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
        <HoneySlider
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
        <HoneySlider
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
        <HoneySlider value={50} onChange={mockOnChange} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.userSelect).toBe('none');
    });

    it('should disable touch actions', () => {
      const { container } = render(
        <HoneySlider value={50} onChange={mockOnChange} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.touchAction).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    it('should handle value of 0', () => {
      const { container } = render(
        <HoneySlider value={0} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle value of 100', () => {
      const { container } = render(
        <HoneySlider value={100} onChange={mockOnChange} />
      );
      const progressBar = container.querySelector('div[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<HoneySlider value={42.5} onChange={mockOnChange} showLabel={true} />);
      expect(screen.getByText('42.5%')).toBeInTheDocument();
    });
  });
});
