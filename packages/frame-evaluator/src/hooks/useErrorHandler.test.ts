import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';

describe('useErrorHandler', () => {
  it('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('sets error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.setError('validation', 'Test error', 'Test details');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe('validation');
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.error?.details).toBe('Test details');
    expect(result.current.hasError).toBe(true);
  });

  it('clears error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.setError('database', 'Test error');
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('includes timestamp', () => {
    const { result } = renderHook(() => useErrorHandler());
    const before = Date.now();
    
    act(() => {
      result.current.setError('network', 'Test error');
    });

    const after = Date.now();
    expect(result.current.error?.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.current.error?.timestamp).toBeLessThanOrEqual(after);
  });
});
