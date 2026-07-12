/**
 * Platform abstraction layer
 * Automatically detects and provides the correct platform adapter
 */

import { PlatformAdapter } from './types';
import { webAdapter } from './web';
import { nativeAdapter } from './native';

/**
 * Detect current platform
 */
function detectPlatform(): 'web' | 'native' {
  // Check if we're in a React Native environment
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'native';
  }
  
  // Check for React Native specific globals
  if (typeof global !== 'undefined' && (global as any).__fbBatchedBridge) {
    return 'native';
  }
  
  // Default to web
  return 'web';
}

/**
 * Get platform adapter based on current environment
 */
export function getPlatformAdapter(): PlatformAdapter {
  const platform = detectPlatform();
  return platform === 'native' ? nativeAdapter : webAdapter;
}

/**
 * Current platform adapter
 */
export const platformAdapter = getPlatformAdapter();

/**
 * Re-export types
 */
export * from './types';

/**
 * Re-export adapters for manual selection
 */
export { webAdapter } from './web';
export { nativeAdapter } from './native';
