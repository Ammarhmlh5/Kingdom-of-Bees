/**
 * Platform abstraction types
 * Provides unified interfaces for React Web and React Native
 */

import { ReactNode } from 'react';

/**
 * Platform type
 */
export type Platform = 'web' | 'native';

/**
 * Touch/Mouse event data
 */
export interface GestureEvent {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Gesture handler interface
 */
export interface GestureHandler {
  onStart: (event: GestureEvent) => void;
  onMove: (event: GestureEvent) => void;
  onEnd: (event: GestureEvent) => void;
}

/**
 * SVG component props
 */
export interface SVGProps {
  width: number;
  height: number;
  viewBox?: string;
  children: ReactNode;
}

/**
 * SVG Path props
 */
export interface SVGPathProps {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * SVG Circle props
 */
export interface SVGCircleProps {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * SVG Rect props
 */
export interface SVGRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rx?: number;
  ry?: number;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
}

/**
 * Storage interface
 */
export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Haptic feedback interface
 */
export interface HapticAdapter {
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
  selection: () => void;
}

/**
 * Platform adapter interface
 * Provides unified API for different platforms
 */
export interface PlatformAdapter {
  // Platform identification
  platform: Platform;
  
  // SVG components
  SVG: React.ComponentType<SVGProps>;
  SVGPath: React.ComponentType<SVGPathProps>;
  SVGCircle: React.ComponentType<SVGCircleProps>;
  SVGRect: React.ComponentType<SVGRectProps>;
  
  // Gesture handling
  createGestureHandler: (handler: GestureHandler) => {
    onTouchStart?: (e: any) => void;
    onTouchMove?: (e: any) => void;
    onTouchEnd?: (e: any) => void;
    onMouseDown?: (e: any) => void;
    onMouseMove?: (e: any) => void;
    onMouseUp?: (e: any) => void;
  };
  
  // Storage
  storage: StorageAdapter;
  
  // Haptic feedback
  haptic: HapticAdapter;
  
  // Animation
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
}
