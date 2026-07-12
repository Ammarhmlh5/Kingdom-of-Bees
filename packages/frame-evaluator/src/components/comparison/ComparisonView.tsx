import React from 'react';
import { FrameData } from '../../types';
import { FrameRenderer } from '../renderer/FrameRenderer';

export interface ComparisonViewProps {
  leftData: FrameData;
  rightData: FrameData;
  leftLabel?: string;
  rightLabel?: string;
  showDifferences?: boolean;
  onClose?: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  leftData,
  rightData,
  leftLabel = 'التقييم السابق',
  rightLabel = 'التقييم الحالي',
  showDifferences = true,
  onClose,
}) => {
  const calculateDifference = (left: number, right: number): number => {
    return right - left;
  };

  const getDifferenceColor = (diff: number): string => {
    if (diff > 0) return '#10B981'; // green
    if (diff < 0) return '#EF4444'; // red
    return '#6B7280'; // gray
  };

  const formatDifference = (diff: number): string => {
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  };

  const differences = {
    honey: calculateDifference(leftData.honeyPercentage, rightData.honeyPercentage),
    brood: calculateDifference(leftData.broodPercentage, rightData.broodPercentage),
    beeBread: calculateDifference(leftData.beeBreadPercentage, rightData.beeBreadPercentage),
    empty: calculateDifference(leftData.emptyPercentage || 0, rightData.emptyPercentage || 0),
  };

  return (
    <div style={styles.container}>
      {onClose && (
        <button onClick={onClose} style={styles.closeButton}>
          ✕
        </button>
      )}

      <h2 style={styles.title}>مقارنة التقييمات</h2>

      <div style={styles.comparisonContainer}>
        {/* Left Frame */}
        <div style={styles.frameContainer}>
          <h3 style={styles.frameLabel}>{leftLabel}</h3>
          <FrameRenderer data={leftData} width={300} height={400} />
          <div style={styles.stats}>
            <div style={styles.statRow}>
              <span>🍯 العسل:</span>
              <span>{leftData.honeyPercentage.toFixed(1)}%</span>
            </div>
            <div style={styles.statRow}>
              <span>🐝 الحضنة:</span>
              <span>{leftData.broodPercentage.toFixed(1)}%</span>
            </div>
            <div style={styles.statRow}>
              <span>🌼 خبز النحل:</span>
              <span>{leftData.beeBreadPercentage.toFixed(1)}%</span>
            </div>
            <div style={styles.statRow}>
              <span>⬜ فارغ:</span>
              <span>{(leftData.emptyPercentage || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Differences */}
        {showDifferences && (
          <div style={styles.differencesContainer}>
            <h3 style={styles.differencesTitle}>الفروقات</h3>
            <div style={styles.differencesList}>
              <div style={styles.differenceItem}>
                <span>🍯</span>
                <span style={{ color: getDifferenceColor(differences.honey) }}>
                  {formatDifference(differences.honey)}
                </span>
              </div>
              <div style={styles.differenceItem}>
                <span>🐝</span>
                <span style={{ color: getDifferenceColor(differences.brood) }}>
                  {formatDifference(differences.brood)}
                </span>
              </div>
              <div style={styles.differenceItem}>
                <span>🌼</span>
                <span style={{ color: getDifferenceColor(differences.beeBread) }}>
                  {formatDifference(differences.beeBread)}
                </span>
              </div>
              <div style={styles.differenceItem}>
                <span>⬜</span>
                <span style={{ color: getDifferenceColor(differences.empty) }}>
                  {formatDifference(differences.empty)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right Frame */}
        <div style={styles.frameContainer}>
          <h3 style={styles.frameLabel}>{rightLabel}</h3>
          <FrameRenderer data={rightData} width={300} height={400} />
          <div style={styles.stats}>
            <div style={styles.statRow}>
              <span>🍯 العسل:</span>
              <span>{rightData.honeyPercentage.toFixed(1)}%</span>
            </div>
            <div style={styles.statRow}>
              <span>🐝 الحضنة:</span>
              <span>{rightData.broodPercentage.toFixed(1)}%</span>
            </div>
            <div style={styles.statRow}>
              <span>🌼 خبز النحل:</span>
              <span>{rightData.beeBreadPercentage.toFixed(1)}%</span>
            </div>
            <div style={styles.statRow}>
              <span>⬜ فارغ:</span>
              <span>{(rightData.emptyPercentage || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6B7280',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  comparisonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: '20px',
  },
  frameContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  frameLabel: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  stats: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#F9FAFB',
    borderRadius: '4px',
    width: '100%',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '14px',
  },
  differencesContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '120px',
  },
  differencesTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
  },
  differencesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  differenceItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    fontSize: '20px',
  },
};
