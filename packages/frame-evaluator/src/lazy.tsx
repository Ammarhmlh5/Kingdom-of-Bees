import React, { lazy, Suspense, ComponentType } from 'react';
import type { HistoryViewerProps } from './components/history/HistoryViewer';
import type { ComparisonViewProps } from './components/comparison/ComparisonView';

// Lazy load components
const LazyHistoryViewerComponent = lazy(() =>
  import('./components/history/HistoryViewer').then((module) => ({
    default: module.HistoryViewer,
  }))
);

const LazyComparisonViewComponent = lazy(() =>
  import('./components/comparison/ComparisonView').then((module) => ({
    default: module.ComparisonView,
  }))
);

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div style={styles.loading}>
    <div style={styles.spinner} />
    <p style={styles.text}>جاري التحميل...</p>
  </div>
);

// Wrapped components with Suspense
export const LazyHistoryViewer: ComponentType<HistoryViewerProps> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyHistoryViewerComponent {...props} />
  </Suspense>
);

export const LazyComparisonView: ComponentType<ComparisonViewProps> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyComparisonViewComponent {...props} />
  </Suspense>
);

const styles: Record<string, React.CSSProperties> = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    minHeight: '200px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: '15px',
    color: '#6B7280',
    fontSize: '14px',
  },
};

// Add keyframes for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
