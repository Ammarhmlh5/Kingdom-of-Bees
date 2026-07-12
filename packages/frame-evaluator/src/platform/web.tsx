/**
 * React Web Platform Adapter
 */

import React from 'react';
import {
  PlatformAdapter,
  GestureHandler,
  GestureEvent,
  SVGProps,
  SVGPathProps,
  SVGCircleProps,
  SVGRectProps,
  StorageAdapter,
  HapticAdapter,
} from './types';

/**
 * Web Storage Adapter (localStorage)
 */
const webStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

/**
 * Web Haptic Adapter (vibration API)
 */
const webHaptic: HapticAdapter = {
  impact(style?: 'light' | 'medium' | 'heavy'): void {
    if ('vibrate' in navigator) {
      const duration = style === 'light' ? 10 : style === 'heavy' ? 50 : 25;
      navigator.vibrate(duration);
    }
  },

  notification(type?: 'success' | 'warning' | 'error'): void {
    if ('vibrate' in navigator) {
      const pattern = type === 'success' ? [10, 50, 10] : type === 'error' ? [50, 50, 50] : [25];
      navigator.vibrate(pattern);
    }
  },

  selection(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
};

/**
 * SVG Component for Web
 */
const WebSVG: React.FC<SVGProps> = ({ width, height, viewBox, children }) => {
  return (
    <svg width={width} height={height} viewBox={viewBox || `0 0 ${width} ${height}`}>
      {children}
    </svg>
  );
};

/**
 * SVG Path Component for Web
 */
const WebSVGPath: React.FC<SVGPathProps> = ({
  d,
  fill,
  stroke,
  strokeWidth,
  opacity,
}) => {
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  );
};

/**
 * SVG Circle Component for Web
 */
const WebSVGCircle: React.FC<SVGCircleProps> = ({
  cx,
  cy,
  r,
  fill,
  stroke,
  strokeWidth,
  opacity,
}) => {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  );
};

/**
 * SVG Rect Component for Web
 */
const WebSVGRect: React.FC<SVGRectProps> = ({
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  opacity,
  rx,
  ry,
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      rx={rx}
      ry={ry}
    />
  );
};

/**
 * Create gesture handler for web (mouse events)
 */
function createWebGestureHandler(handler: GestureHandler) {
  let isMouseDown = false;

  const extractEvent = (e: MouseEvent | TouchEvent): GestureEvent => {
    const touch = 'touches' in e ? e.touches[0] : e as MouseEvent;
    return {
      x: 'clientX' in touch ? touch.clientX : 0,
      y: 'clientY' in touch ? touch.clientY : 0,
      timestamp: Date.now(),
    };
  };

  return {
    onMouseDown: (e: React.MouseEvent) => {
      isMouseDown = true;
      handler.onStart(extractEvent(e.nativeEvent));
    },

    onMouseMove: (e: React.MouseEvent) => {
      if (isMouseDown) {
        handler.onMove(extractEvent(e.nativeEvent));
      }
    },

    onMouseUp: (e: React.MouseEvent) => {
      if (isMouseDown) {
        isMouseDown = false;
        handler.onEnd(extractEvent(e.nativeEvent));
      }
    },

    onTouchStart: (e: React.TouchEvent) => {
      handler.onStart(extractEvent(e.nativeEvent));
    },

    onTouchMove: (e: React.TouchEvent) => {
      handler.onMove(extractEvent(e.nativeEvent));
    },

    onTouchEnd: (e: React.TouchEvent) => {
      handler.onEnd(extractEvent(e.nativeEvent));
    },
  };
}

/**
 * Web Platform Adapter
 */
export const webAdapter: PlatformAdapter = {
  platform: 'web',
  
  // SVG components
  SVG: WebSVG,
  SVGPath: WebSVGPath,
  SVGCircle: WebSVGCircle,
  SVGRect: WebSVGRect,
  
  // Gesture handling
  createGestureHandler: createWebGestureHandler,
  
  // Storage
  storage: webStorage,
  
  // Haptic feedback
  haptic: webHaptic,
  
  // Animation
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
};
