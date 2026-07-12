import React from 'react';

export type ErrorType = 'validation' | 'database' | 'network' | 'unknown';

export interface ErrorDisplayProps {
  type: ErrorType;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  type,
  message,
  details,
  onRetry,
  onDismiss,
}) => {
  const getIcon = (): string => {
    switch (type) {
      case 'validation':
        return '⚠️';
      case 'database':
        return '💾';
      case 'network':
        return '🌐';
      default:
        return '❌';
    }
  };

  const getColor = (): string => {
    switch (type) {
      case 'validation':
        return '#F59E0B';
      case 'database':
        return '#EF4444';
      case 'network':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <div style={{ ...styles.container, borderColor: getColor() }}>
      <div style={styles.header}>
        <span style={styles.icon}>{getIcon()}</span>
        <span style={{ ...styles.message, color: getColor() }}>{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} style={styles.dismissButton}>
            ✕
          </button>
        )}
      </div>
      {details && <div style={styles.details}>{details}</div>}
      {onRetry && (
        <button onClick={onRetry} style={{ ...styles.retryButton, backgroundColor: getColor() }}>
          إعادة المحاولة
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '15px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '2px solid',
    marginBottom: '10px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '24px',
  },
  message: {
    flex: 1,
    fontSize: '16px',
    fontWeight: '600',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6B7280',
  },
  details: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#F9FAFB',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#6B7280',
  },
  retryButton: {
    marginTop: '10px',
    padding: '8px 16px',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};
