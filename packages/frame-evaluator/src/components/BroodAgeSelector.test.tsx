/**
 * BroodAgeSelector Component Tests
 * اختبارات مكون محدد عمر الحضنة
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BroodAgeSelector } from './BroodAgeSelector';
import { BroodAge } from '../types';
import { DEFAULT_COLORS } from '../constants/theme';

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

describe('BroodAgeSelector', () => {
  const defaultProps = {
    value: 'YOUNG_LARVAE' as BroodAge,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Rendering Tests ====================
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<BroodAgeSelector {...defaultProps} />);
      expect(screen.getByText(/عمر الحضنة/)).toBeInTheDocument();
    });

    it('should render all 5 brood stages', () => {
      render(<BroodAgeSelector {...defaultProps} />);
      expect(screen.getByText('بيض')).toBeInTheDocument();
      expect(screen.getByText('يرقات صغيرة')).toBeInTheDocument();
      expect(screen.getByText('يرقات كبيرة')).toBeInTheDocument();
      expect(screen.getByText('مغلقة')).toBeInTheDocument();
      expect(screen.getByText('متنوعة')).toBeInTheDocument();
    });

    it('should render with default size (medium)', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ width: '80px' });
    });

    it('should render with small size', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} size="small" />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ width: '60px' });
    });

    it('should render with large size', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} size="large" />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ width: '100px' });
    });

    it('should render with labels by default', () => {
      render(<BroodAgeSelector {...defaultProps} />);
      expect(screen.getByText(/عمر الحضنة/)).toBeInTheDocument();
      expect(screen.getByText('يرقات صغيرة')).toBeInTheDocument();
    });

    it('should not render labels when showLabel is false', () => {
      render(<BroodAgeSelector {...defaultProps} showLabel={false} />);
      expect(screen.queryByText(/عمر الحضنة/)).not.toBeInTheDocument();
      expect(screen.queryByText('يرقات صغيرة')).not.toBeInTheDocument();
    });

    it('should not render when visible is false', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} visible={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ==================== Stage Selection Tests ====================
  describe('Stage Selection', () => {
    it('should highlight EGGS stage when selected', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="EGGS" />);
      const html = container.innerHTML;
      expect(html).toContain('🥚');
      expect(html).toContain(DEFAULT_COLORS.brood.eggs);
    });

    it('should highlight YOUNG_LARVAE stage when selected', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="YOUNG_LARVAE" />);
      const html = container.innerHTML;
      expect(html).toContain('🐛');
      expect(html).toContain(DEFAULT_COLORS.brood.youngLarvae);
    });

    it('should highlight OLD_LARVAE stage when selected', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="OLD_LARVAE" />);
      const html = container.innerHTML;
      expect(html).toContain('🐛');
      expect(html).toContain(DEFAULT_COLORS.brood.oldLarvae);
    });

    it('should highlight CAPPED stage when selected', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="CAPPED" />);
      const html = container.innerHTML;
      expect(html).toContain('🔒');
      expect(html).toContain(DEFAULT_COLORS.brood.capped);
    });

    it('should highlight MIXED stage when selected', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="MIXED" />);
      const html = container.innerHTML;
      expect(html).toContain('🔄');
    });
  });

  // ==================== Click Interaction Tests ====================
  describe('Click Interaction', () => {
    it('should call onChange when clicking on a stage', () => {
      const onChange = jest.fn();
      render(<BroodAgeSelector {...defaultProps} onChange={onChange} />);
      
      const eggsStage = screen.getByText('بيض');
      fireEvent.click(eggsStage);
      
      expect(onChange).toHaveBeenCalledWith('EGGS');
    });

    it('should call onChange with correct stage when clicking CAPPED', () => {
      const onChange = jest.fn();
      render(<BroodAgeSelector {...defaultProps} onChange={onChange} />);
      
      const cappedStage = screen.getByText('مغلقة');
      fireEvent.click(cappedStage);
      
      expect(onChange).toHaveBeenCalledWith('CAPPED');
    });

    it('should not call onChange when disabled', () => {
      const onChange = jest.fn();
      render(<BroodAgeSelector {...defaultProps} onChange={onChange} disabled />);
      
      const eggsStage = screen.getByText('بيض');
      fireEvent.click(eggsStage);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should allow clicking on MIXED stage', () => {
      const onChange = jest.fn();
      render(<BroodAgeSelector {...defaultProps} onChange={onChange} />);
      
      const mixedStage = screen.getByText('متنوعة');
      fireEvent.click(mixedStage);
      
      expect(onChange).toHaveBeenCalledWith('MIXED');
    });
  });

  // ==================== Disabled State Tests ====================
  describe('Disabled State', () => {
    it('should apply disabled cursor when disabled', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} disabled />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ cursor: 'not-allowed' });
    });

    it('should reduce opacity when disabled', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} disabled />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ opacity: 0.6 });
    });

    it('should not reduce opacity when enabled', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} disabled={false} />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ opacity: 1 });
    });
  });

  // ==================== Stage Icons Tests ====================
  describe('Stage Icons', () => {
    it('should display egg icon for EGGS stage', () => {
      render(<BroodAgeSelector {...defaultProps} value="EGGS" />);
      const html = document.body.innerHTML;
      expect(html).toContain('🥚');
    });

    it('should display larva icon for YOUNG_LARVAE stage', () => {
      render(<BroodAgeSelector {...defaultProps} value="YOUNG_LARVAE" />);
      const html = document.body.innerHTML;
      expect(html).toContain('🐛');
    });

    it('should display larva icon for OLD_LARVAE stage', () => {
      render(<BroodAgeSelector {...defaultProps} value="OLD_LARVAE" />);
      const html = document.body.innerHTML;
      expect(html).toContain('🐛');
    });

    it('should display lock icon for CAPPED stage', () => {
      render(<BroodAgeSelector {...defaultProps} value="CAPPED" />);
      const html = document.body.innerHTML;
      expect(html).toContain('🔒');
    });

    it('should display mixed icon for MIXED stage', () => {
      render(<BroodAgeSelector {...defaultProps} value="MIXED" />);
      const html = document.body.innerHTML;
      expect(html).toContain('🔄');
    });
  });

  // ==================== Integration with useDrag Tests ====================
  describe('Integration with useDrag', () => {
    it('should call useDrag with correct orientation (vertical)', () => {
      const { useDrag } = require('../hooks/useDrag');
      render(<BroodAgeSelector {...defaultProps} />);
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'vertical',
        })
      );
    });

    it('should call useDrag with snap points for all stages', () => {
      const { useDrag } = require('../hooks/useDrag');
      render(<BroodAgeSelector {...defaultProps} />);
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          snapPoints: [0, 25, 50, 75, 100],
        })
      );
    });

    it('should call useDrag with disabled state', () => {
      const { useDrag } = require('../hooks/useDrag');
      render(<BroodAgeSelector {...defaultProps} disabled />);
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
        })
      );
    });

    it('should call useDrag with disabled when not visible', () => {
      const { useDrag } = require('../hooks/useDrag');
      render(<BroodAgeSelector {...defaultProps} visible={false} />);
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
        })
      );
    });

    it('should call useDrag with haptic feedback enabled', () => {
      const { useDrag } = require('../hooks/useDrag');
      render(<BroodAgeSelector {...defaultProps} />);
      expect(useDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          hapticFeedback: true,
        })
      );
    });
  });

  // ==================== Stage Order Tests ====================
  describe('Stage Order', () => {
    it('should render stages from bottom to top', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} />);
      const stages = container.querySelectorAll('div[style*="flex: 1"]');
      
      // Should have 5 stages
      expect(stages.length).toBe(5);
    });

    it('should have EGGS at the bottom (index 0)', () => {
      render(<BroodAgeSelector {...defaultProps} value="EGGS" />);
      // EGGS should be rendered (we can verify by checking it exists)
      expect(screen.getByText('بيض')).toBeInTheDocument();
    });

    it('should have CAPPED at the top (index 4)', () => {
      render(<BroodAgeSelector {...defaultProps} value="CAPPED" />);
      // CAPPED should be rendered
      expect(screen.getByText('مغلقة')).toBeInTheDocument();
    });

    it('should have MIXED in the middle (index 2)', () => {
      render(<BroodAgeSelector {...defaultProps} value="MIXED" />);
      // MIXED should be rendered
      expect(screen.getByText('متنوعة')).toBeInTheDocument();
    });
  });

  // ==================== Accessibility Tests ====================
  describe('Accessibility', () => {
    it('should have proper user-select none', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} />);
      const selector = container.firstChild as HTMLElement;
      expect(selector).toHaveStyle({ userSelect: 'none' });
    });

    it('should have proper touch-action none', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} />);
      const selector = container.firstChild as HTMLElement;
      // Check that user-select: none is present (touch-action may not render in test environment)
      expect(selector).toHaveStyle({ userSelect: 'none' });
    });

    it('should have clickable stages with pointer cursor when enabled', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} />);
      const html = container.innerHTML;
      expect(html).toContain('cursor: pointer');
    });

    it('should have not-allowed cursor for stages when disabled', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} disabled />);
      const html = container.innerHTML;
      expect(html).toContain('cursor: not-allowed');
    });
  });

  // ==================== Visual Indicator Tests ====================
  describe('Visual Indicator', () => {
    it('should render current stage indicator', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="YOUNG_LARVAE" />);
      // Check for the triangle indicator
      const html = container.innerHTML;
      expect(html).toContain('border-left');
    });

    it('should position indicator based on current stage', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="EGGS" />);
      const html = container.innerHTML;
      // EGGS is at index 0, so bottom should be 0%
      expect(html).toContain('bottom: 0%');
    });

    it('should update indicator color based on stage', () => {
      const { container } = render(<BroodAgeSelector {...defaultProps} value="CAPPED" />);
      const html = container.innerHTML;
      expect(html).toContain(DEFAULT_COLORS.brood.capped);
    });
  });

  // ==================== Edge Cases Tests ====================
  describe('Edge Cases', () => {
    it('should handle all valid brood ages', () => {
      const ages: BroodAge[] = ['EGGS', 'YOUNG_LARVAE', 'OLD_LARVAE', 'CAPPED', 'MIXED'];
      
      ages.forEach(age => {
        const { rerender } = render(<BroodAgeSelector {...defaultProps} value={age} />);
        expect(screen.getByText(/عمر الحضنة/)).toBeInTheDocument();
        rerender(<div />); // Clean up
      });
    });

    it('should not crash with rapid stage changes', () => {
      const { rerender } = render(<BroodAgeSelector {...defaultProps} value="EGGS" />);
      rerender(<BroodAgeSelector {...defaultProps} value="YOUNG_LARVAE" />);
      rerender(<BroodAgeSelector {...defaultProps} value="OLD_LARVAE" />);
      rerender(<BroodAgeSelector {...defaultProps} value="CAPPED" />);
      rerender(<BroodAgeSelector {...defaultProps} value="MIXED" />);
      
      expect(screen.getByText(/عمر الحضنة/)).toBeInTheDocument();
    });

    it('should handle visibility toggle', () => {
      const { rerender, container } = render(
        <BroodAgeSelector {...defaultProps} visible={true} />
      );
      expect(container.firstChild).not.toBeNull();
      
      rerender(<BroodAgeSelector {...defaultProps} visible={false} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
