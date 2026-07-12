/**
 * Platform Adapters
 * محولات المنصات
 */

export * from './types';
export { WebPlatformAdapter } from './web';
export { ReactNativePlatformAdapter } from './react-native';
export { ElectronPlatformAdapter } from './electron';

/**
 * اكتشاف المنصة الحالية تلقائياً
 */
export function detectPlatform(): 'web' | 'react-native' | 'electron' {
  // التحقق من Electron
  if (
    typeof window !== 'undefined' &&
    typeof (window as any).process !== 'undefined' &&
    (window as any).process.type === 'renderer'
  ) {
    return 'electron';
  }

  // التحقق من React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'react-native';
  }

  // افتراضياً Web
  return 'web';
}
