import { useState, useCallback } from 'react';

export type ErrorType = 'validation' | 'database' | 'network' | 'unknown';

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: number;
}

export interface UseErrorHandlerReturn {
  error: ErrorState | null;
  setError: (type: ErrorType, message: string, details?: string) => void;
  clearError: () => void;
  hasError: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  const setError = useCallback((type: ErrorType, message: string, details?: string) => {
    setErrorState({
      type,
      message,
      details,
      timestamp: Date.now(),
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error,
    setError,
    clearError,
    hasError: error !== null,
  };
};
