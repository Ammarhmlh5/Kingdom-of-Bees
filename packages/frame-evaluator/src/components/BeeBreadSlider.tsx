/**
 * BeeBreadSlider Component
 * مؤشر خبز النحل (حبوب اللقاح المخزنة) - يعرض على الجانب الأيسر للإطار
 * 
 * المواصفات:
 * - الموقع: الجانب الأيسر
 * - الاتجاه: عمودي (من الأسفل للأعلى)
 * - النطاق: 0-100%
 * - التدرج اللوني: #FFEDD5 → #FDBA74
 * - الأيقونة: 🌼
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { BeeBreadSliderProps } from '../types/components';
import { useDrag } from '../hooks/useDrag';
import { DEFAULT_COLORS } from '../constants/theme';

/**
 * BeeBreadSlider Component
 */
export const BeeBreadSlider: React.FC<BeeBreadSliderProps> = React.memo(({
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

  // استخدام hook السحب مع الاتجاه العمودي
  const { handlers, setContainerRef } = useDrag({
    value,
    onChange,
    disabled,
    orientation: 'vertical',
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
    small: { width: 40, padding: 8, fontSize: 12 },
    medium: { width: 50, padding: 12, fontSize: 14 },
    large: { width: 60, padding: 16, fontSize: 16 },
  }[size]), [size]);

  // حساب لون التدرج - memoized
  const gradientColor = useMemo(() => color || getBeeBreadGradient(value), [color, value]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: dimensions.width,
        height: '100%',
        padding: dimensions.padding,
        cursor: disabled ? 'not-allowed' : 'ns-resize',
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
          background: `linear-gradient(to top, ${DEFAULT_COLORS.beeBread.light}, ${DEFAULT_COLORS.beeBread.medium}, ${DEFAULT_COLORS.beeBread.dark})`,
          borderRadius: 8,
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {/* شريط التقدم */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${value}%`,
          background: gradientColor,
          borderRadius: 8,
          transition: 'height 0.15s ease-out',
          border: `2px solid ${DEFAULT_COLORS.beeBread.dark}`,
        }}
      />

      {/* التسمية والقيمة */}
      {showLabel && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            padding: '12px 0',
            fontSize: dimensions.fontSize,
            fontWeight: 600,
            color: DEFAULT_COLORS.text,
            zIndex: 1,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          <span>🌼 خبز النحل</span>
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
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {snapPoints.map((point) => (
            <div
              key={point}
              style={{
                position: 'absolute',
                bottom: `${point}%`,
                left: 0,
                right: 0,
                height: 2,
                background: 'rgba(0, 0, 0, 0.1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

BeeBreadSlider.displayName = 'BeeBreadSlider';

/**
 * حساب لون التدرج حسب القيمة
 */
function getBeeBreadGradient(percentage: number): string {
  if (percentage <= 30) {
    return DEFAULT_COLORS.beeBread.light;
  } else if (percentage <= 60) {
    return DEFAULT_COLORS.beeBread.medium;
  } else {
    return DEFAULT_COLORS.beeBread.dark;
  }
}

/**
 * التصدير الافتراضي
 */
export default BeeBreadSlider;
