import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparisonView } from './ComparisonView';
import { FrameData } from '../../types';

const mockLeftData: FrameData = {
  side: 'A',
  honeyPercentage: 30,
  broodPercentage: 40,
  beeBreadPercentage: 10,
  emptyPercentage: 20,
  broodAge: 'MIXED',
  isValid: true,
};

const mockRightData: FrameData = {
  side: 'B',
  honeyPercentage: 35,
  broodPercentage: 45,
  beeBreadPercentage: 8,
  emptyPercentage: 12,
  broodAge: 'MIXED',
  isValid: true,
};

describe('ComparisonView', () => {
  it('renders both frames', () => {
    render(<ComparisonView leftData={mockLeftData} rightData={mockRightData} />);
    expect(screen.getByText('مقارنة التقييمات')).toBeInTheDocument();
  });

  it('displays custom labels', () => {
    render(
      <ComparisonView
        leftData={mockLeftData}
        rightData={mockRightData}
        leftLabel="قديم"
        rightLabel="جديد"
      />
    );
    expect(screen.getByText('قديم')).toBeInTheDocument();
    expect(screen.getByText('جديد')).toBeInTheDocument();
  });

  it('shows differences when enabled', () => {
    render(
      <ComparisonView
        leftData={mockLeftData}
        rightData={mockRightData}
        showDifferences={true}
      />
    );
    expect(screen.getByText('الفروقات')).toBeInTheDocument();
  });

  it('hides differences when disabled', () => {
    render(
      <ComparisonView
        leftData={mockLeftData}
        rightData={mockRightData}
        showDifferences={false}
      />
    );
    expect(screen.queryByText('الفروقات')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <ComparisonView
        leftData={mockLeftData}
        rightData={mockRightData}
        onClose={onClose}
      />
    );
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays statistics for both frames', () => {
    render(<ComparisonView leftData={mockLeftData} rightData={mockRightData} />);
    expect(screen.getAllByText(/العسل:/)).toHaveLength(2);
    expect(screen.getAllByText(/الحضنة:/)).toHaveLength(2);
    expect(screen.getAllByText(/خبز النحل:/)).toHaveLength(2);
  });
});
