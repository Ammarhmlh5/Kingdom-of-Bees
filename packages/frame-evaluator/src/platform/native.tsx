/**
 * React Native Platform Adapter
 * 
 * Note: This is a placeholder implementation.
 * Actual React Native implementation requires:
 * - react-native-svg
 * - react-native-gesture-handler
 * - @react-native-async-storage/async-storage
 * - expo-haptics (optional)
 */

import React from 'react';
import {
  PlatformAdapter,
  GestureHandler,
  SVGProps,
  SVGPathProps,
  SVGCircleProps,
  SVGRectProps,
  StorageAdapter,
  HapticAdapter,
} from './types';

/**
 * Placeholder Storage Adapter
 * Replace with @react-native-async-storage/async-storage
 */
const nativeStorage: StorageAdapter = {
  async getItem(_key: string): Promise<string | null> {
    console.warn('Native storage not implemented. Install @react-native-async-storage/async-storage');
    return null;
  },

  async setItem(_key: string, _value: string): Promise<void> {
    console.warn('Native storage not implemented. Install @react-native-async-storage/async-storage');
  },

  async removeItem(_key: string): Promise<void> {
    console.warn('Native storage not implemented. Install @react-native-async-storage/async-storage');
  },
};

/**
 * Placeholder Haptic Adapter
 * Replace with expo-haptics or react-native-haptic-feedback
 */
const nativeHaptic: HapticAdapter = {
  impact(_style?: 'light' | 'medium' | 'heavy'): void {
    console.warn('Native haptic not implemented. Install expo-haptics');
  },

  notification(_type?: 'success' | 'warning' | 'error'): void {
    console.warn('Native haptic not implemented. Install expo-haptics');
  },

  selection(): void {
    console.warn('Native haptic not implemented. Install expo-haptics');
  },
};

/**
 * Placeholder SVG Component
 * Replace with react-native-svg
 */
const NativeSVG: React.FC<SVGProps> = ({ children }) => {
  console.warn('Native SVG not implemented. Install react-native-svg');
  return <>{children}</>;
};

/**
 * Placeholder SVG Path Component
 */
const NativeSVGPath: React.FC<SVGPathProps> = () => {
  return null;
};

/**
 * Placeholder SVG Circle Component
 */
const NativeSVGCircle: React.FC<SVGCircleProps> = () => {
  return null;
};

/**
 * Placeholder SVG Rect Component
 */
const NativeSVGRect: React.FC<SVGRectProps> = () => {
  return null;
};

/**
 * Placeholder gesture handler
 * Replace with react-native-gesture-handler
 */
function createNativeGestureHandler(_handler: GestureHandler) {
  console.warn('Native gesture handler not implemented. Install react-native-gesture-handler');
  
  return {
    onTouchStart: () => {},
    onTouchMove: () => {},
    onTouchEnd: () => {},
  };
}

/**
 * React Native Platform Adapter (Placeholder)
 * 
 * To use this adapter in React Native:
 * 1. Install dependencies:
 *    npm install react-native-svg react-native-gesture-handler @react-native-async-storage/async-storage
 * 2. Optionally install expo-haptics for haptic feedback
 * 3. Replace placeholder implementations with actual native modules
 */
export const nativeAdapter: PlatformAdapter = {
  platform: 'native',
  
  // SVG components (placeholder)
  SVG: NativeSVG,
  SVGPath: NativeSVGPath,
  SVGCircle: NativeSVGCircle,
  SVGRect: NativeSVGRect,
  
  // Gesture handling (placeholder)
  createGestureHandler: createNativeGestureHandler,
  
  // Storage (placeholder)
  storage: nativeStorage,
  
  // Haptic feedback (placeholder)
  haptic: nativeHaptic,
  
  // Animation
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16) as unknown as number;
  },
  cancelAnimationFrame: (id: number) => {
    clearTimeout(id);
  },
};

/**
 * Note: For production React Native implementation, create a separate file
 * (e.g., native.native.tsx) with actual implementations:
 * 
 * import Svg, { Path, Circle, Rect } from 'react-native-svg';
 * import { GestureDetector, Gesture } from 'react-native-gesture-handler';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import * as Haptics from 'expo-haptics';
 */
