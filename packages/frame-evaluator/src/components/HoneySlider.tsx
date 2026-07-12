/**
 * HoneySlider Component
 * مؤشر العسل - يعرض على الجانب العلوي للإطار
 * 
 * المواصفات:
 * - الموقع: الجانب العلوي
 * - الاتجاه: أفقي (من اليسار لليمين)
 * - النطاق: 0-100%
 * - التدرج اللوني: #FEF9C3 → #FDE047
 * - الأيقونة: 🍯
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { HoneySliderProps } from '../types/components';
import { useDrag } from '../hooks/useDrag';
import { DEFAULT_COLORS } from '../constants/theme';

/**
 * HoneySlider Component
 */
export const HoneySlider: React.FC<HoneySliderProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  color,
  size = 'medium',
  showLabel = true,
  snapPoints = [0, 25, 50, 75, 100],
  hapticFeedback = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // استخدام hook السحب
  const { handlers, setContainerRef } = useDrag({
    value,
    onChange,
    disabled,
    orientation: 'horizontal',
    snapPoints,
    hapticFeedback,
    minValue: 0,
    maxValue: 100,
    step: 1,
    snapToGrid: true,
  });

  // تحديث مرجع الحاوية
  useEffect(() => {
    if (containerRef.current) {
      setContainerRef(containerRef.current);
    }
  }, [setContainerRef]);

  // حساب الأبعاد حسب الحجم - memoized
  const dimensions = useMemo(() => ({
    small: { height: 40, padding: 8, fontSize: 12 },
    medium: { height: 50, padding: 12, fontSize: 14 },
    large: { height: 60, padding: 16, fontSize: 16 },
  }[size]), [size]);

  // حساب لون التدرج - memoized
  const gradientColor = useMemo(() => color || getHoneyGradient(value), [color, value]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: dimensions.height,
        padding: dimensions.padding,
        cursor: disabled ? 'not-allowed' : 'ew-resize',
        userSelect: 'none',
        touchAction: 'none',
      }}
      {...handlers}
    >
      {/* الخلفية مع التدرج */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(to right, ${DEFAULT_COLORS.honey.light}, ${DEFAULT_COLORS.honey.medium}, ${DEFAULT_COLORS.honey.dark})`,
          borderRadius: 8,
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {/* شريط التقدم */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${value}%`,
          background: gradientColor,
          borderRadius: 8,
          transition: 'width 0.15s ease-out',
          border: `2px solid ${DEFAULT_COLORS.honey.stroke}`,
        }}
      />

      {/* التسمية والقيمة */}
      {showLabel && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            padding: '0 12px',
            fontSize: dimensions.fontSize,
            fontWeight: 600,
            color: DEFAULT_COLORS.text,
            zIndex: 1,
          }}
        >
          <span>🍯 عسل</span>
          <span>{value}%</span>
        </div>
      )}

      {/* نقاط الالتصاق (اختياري) */}
      {snapPoints && snapPoints.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {snapPoints.map((point) => (
            <div
              key={point}
              style={{
                position: 'absolute',
                left: `${point}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'rgba(0, 0, 0, 0.1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HoneySlider.displayName = 'HoneySlider';

/**
 * حساب لون التدرج حسب القيمة
 */
function getHoneyGradient(percentage: number): string {
  if (percentage <= 30) {
    return DEFAULT_COLORS.honey.light;
  } else if (percentage <= 60) {
    return DEFAULT_COLORS.honey.medium;
  } else {
    return DEFAULT_COLORS.honey.dark;
  }
}

/**
 * التصدير الافتراضي
 */
export default HoneySlider;
