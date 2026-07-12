import React, { Component, ReactNode, ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class FrameEvaluatorErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('FrameEvaluator Error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h2 style={styles.title}>⚠️ حدث خطأ</h2>
            <p style={styles.message}>{this.state.error.message}</p>
            <details style={styles.details}>
              <summary style={styles.summary}>تفاصيل الخطأ</summary>
              <pre style={styles.stack}>{this.state.error.stack}</pre>
              {this.state.errorInfo && (
                <pre style={styles.stack}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
            <button
              onClick={() => window.location.reload()}
              style={styles.button}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '20px',
    backgroundColor: '#FEF2F2',
  },
  content: {
    maxWidth: '600px',
    padding: '30px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '2px solid #FCA5A5',
  },
  title: {
    color: '#DC2626',
    marginBottom: '15px',
    fontSize: '24px',
  },
  message: {
    color: '#991B1B',
    marginBottom: '20px',
    fontSize: '16px',
  },
  details: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#FEF2F2',
    borderRadius: '4px',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: '10px',
  },
  stack: {
    fontSize: '12px',
    color: '#7F1D1D',
    overflow: 'auto',
    maxHeight: '200px',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    marginTop: '10px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};
