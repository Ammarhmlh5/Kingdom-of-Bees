/**
 * مكون عرض الإطار (Frame Renderer)
 * 
 * مسؤول عن رسم الإطار وعرض المحتوى بصرياً مع دعم الرسوم المتحركة
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import { FrameData } from '../../types';
import { SVGRenderer } from '../../rendering/SVGRenderer';
import { AnimationEngine } from '../../animation/AnimationEngine';
import { DEFAULT_COLORS } from '../../constants/theme';
import { GradientGenerator } from '../../rendering/GradientGenerator';

/**
 * أنواع الطبقات
 */
export type LayerType = 'honey' | 'brood' | 'beebread' | 'empty';

/**
 * خصائص مكون FrameRenderer
 */
export interface FrameRendererProps {
  /** بيانات الإطار */
  data: FrameData;
  
  /** العرض بالبكسل */
  width?: number;
  
  /** الارتفاع بالبكسل */
  height?: number;
  
  /** تفعيل الرسوم المتحركة */
  animated?: boolean;
  
  /** مدة الرسوم المتحركة بالمللي ثانية */
  animationDuration?: number;
  
  /** حجم الخلية السداسية */
  cellSize?: number;
  
  /** دالة تُستدعى عند النقر على طبقة */
  onLayerClick?: (layer: LayerType) => void;
  
  /** معرف فريد للمكون */
  id?: string;
}

/**
 * مكون FrameRenderer
 * 
 * يعرض الإطار بصرياً مع دعم الرسوم المتحركة السلسة
 */
export const FrameRenderer: React.FC<FrameRendererProps> = memo(({
  data,
  width = 400,
  height = 600,
  animated = true,
  animationDuration = 300,
  cellSize = 10,
  onLayerClick,
  id = 'frame-renderer',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rendererRef = useRef<SVGRenderer | null>(null);
  const animationEngineRef = useRef<AnimationEngine | null>(null);
  const previousDataRef = useRef<FrameData>(data);
  const [currentData, setCurrentData] = useState<FrameData>(data);

  // تهيئة المحركات
  useEffect(() => {
    if (!rendererRef.current) {
      rendererRef.current = new SVGRenderer({
        dimensions: { width, height },
        cellSize,
      });
    }

    if (!animationEngineRef.current) {
      animationEngineRef.current = new AnimationEngine();
    }

    return () => {
      // تنظيف الموارد
      if (animationEngineRef.current) {
        animationEngineRef.current.stop();
      }
    };
  }, [width, height, cellSize]);

  // معالجة تغيير البيانات
  useEffect(() => {
    if (!rendererRef.current || !animationEngineRef.current) return;

    const previousData = previousDataRef.current;
    const newData = data;

    // التحقق من وجود تغيير
    const hasChanged = 
      previousData.honeyPercentage !== newData.honeyPercentage ||
      previousData.broodPercentage !== newData.broodPercentage ||
      previousData.beeBreadPercentage !== newData.beeBreadPercentage ||
      previousData.broodAge !== newData.broodAge;

    if (!hasChanged) return;

    if (animated) {
      // تحريك التغيير
      animationEngineRef.current.animate(
        {
          honey: previousData.honeyPercentage,
          brood: previousData.broodPercentage,
          beeBread: previousData.beeBreadPercentage,
        },
        {
          honey: newData.honeyPercentage,
          brood: newData.broodPercentage,
          beeBread: newData.beeBreadPercentage,
        },
        (value) => {
          // التحقق من أن القيمة كائن
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const objValue = value as { honey: number; brood: number; beeBread: number };
            setCurrentData({
              ...newData,
              honeyPercentage: objValue.honey,
              broodPercentage: objValue.brood,
              beeBreadPercentage: objValue.beeBread,
              emptyPercentage: 100 - (objValue.honey + objValue.brood + objValue.beeBread),
            });
          }
        },
        {
          duration: animationDuration,
          easing: 'easeInOutCubic',
        }
      );
    } else {
      // تحديث فوري بدون رسوم متحركة
      setCurrentData(newData);
    }

    previousDataRef.current = newData;
  }, [data, animated, animationDuration]);

  // رسم الإطار
  useEffect(() => {
    if (!svgRef.current || !rendererRef.current) return;

    const svg = svgRef.current;
    
    // مسح المحتوى السابق
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // رسم الإطار الجديد
    const result = rendererRef.current.renderFrame(currentData, {
      ...DEFAULT_COLORS,
      background: '#ffffff',
      border: '#e5e7eb',
      text: '#000000',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
    });

    // إضافة التدرجات
    if (result.gradients) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      
      if (result.gradients.honey) {
        const honeyGradientSVG = GradientGenerator.toSVG(result.gradients.honey);
        const parser = new DOMParser();
        const doc = parser.parseFromString(honeyGradientSVG, 'image/svg+xml');
        const gradientElement = doc.documentElement;
        defs.appendChild(gradientElement);
      }
      
      if (result.gradients.brood) {
        const broodGradientSVG = GradientGenerator.toSVG(result.gradients.brood);
        const parser = new DOMParser();
        const doc = parser.parseFromString(broodGradientSVG, 'image/svg+xml');
        const gradientElement = doc.documentElement;
        defs.appendChild(gradientElement);
      }
      
      if (result.gradients.beeBread) {
        const beeBreadGradientSVG = GradientGenerator.toSVG(result.gradients.beeBread);
        const parser = new DOMParser();
        const doc = parser.parseFromString(beeBreadGradientSVG, 'image/svg+xml');
        const gradientElement = doc.documentElement;
        defs.appendChild(gradientElement);
      }
      
      svg.appendChild(defs);
    }

    // إضافة الطبقات
    // طبقة فارغة (خلفية)
    if (result.empty && result.layers.empty) {
      const emptyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      emptyRect.setAttribute('x', result.layers.empty.x.toString());
      emptyRect.setAttribute('y', result.layers.empty.y.toString());
      emptyRect.setAttribute('width', result.layers.empty.width.toString());
      emptyRect.setAttribute('height', result.layers.empty.height.toString());
      emptyRect.setAttribute('fill', result.empty.fill);
      emptyRect.setAttribute('data-layer', 'empty');
      if (onLayerClick) {
        emptyRect.style.cursor = 'pointer';
        emptyRect.addEventListener('click', () => onLayerClick('empty'));
      }
      svg.appendChild(emptyRect);
    }

    // طبقة خبز النحل (جوانب)
    if (result.beeBread && result.beeBread.svgData) {
      result.beeBread.svgData.forEach((grain) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', grain.cx.toString());
        circle.setAttribute('cy', grain.cy.toString());
        circle.setAttribute('r', grain.r.toString());
        circle.setAttribute('fill', grain.fill);
        circle.setAttribute('opacity', grain.opacity.toString());
        circle.setAttribute('data-layer', 'beebread');
        if (onLayerClick) {
          circle.style.cursor = 'pointer';
          circle.addEventListener('click', () => onLayerClick('beebread'));
        }
        svg.appendChild(circle);
      });
    }

    // طبقة الحضنة (وسط)
    if (result.brood && result.brood.svgData) {
      result.brood.svgData.forEach((cellData) => {
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', cellData.path);
        pathElement.setAttribute('fill', cellData.fill);
        pathElement.setAttribute('data-layer', 'brood');
        if (onLayerClick) {
          pathElement.style.cursor = 'pointer';
          pathElement.addEventListener('click', () => onLayerClick('brood'));
        }
        svg.appendChild(pathElement);
        
        // إضافة الرمز إذا كان موجوداً
        if (cellData.symbol) {
          const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textElement.setAttribute('x', cellData.symbol.x.toString());
          textElement.setAttribute('y', cellData.symbol.y.toString());
          textElement.setAttribute('font-size', cellData.symbol.size.toString());
          textElement.setAttribute('text-anchor', 'middle');
          textElement.setAttribute('dominant-baseline', 'middle');
          textElement.setAttribute('fill', '#000000');
          textElement.setAttribute('data-layer', 'brood');
          textElement.textContent = cellData.symbol.text;
          if (onLayerClick) {
            textElement.style.cursor = 'pointer';
            textElement.addEventListener('click', () => onLayerClick('brood'));
          }
          svg.appendChild(textElement);
        }
      });
    }

    // طبقة العسل (أعلى)
    if (result.honey && result.honey.svgPaths) {
      result.honey.svgPaths.forEach((path: string) => {
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('fill', 'url(#honey-gradient)');
        pathElement.setAttribute('data-layer', 'honey');
        if (onLayerClick) {
          pathElement.style.cursor = 'pointer';
          pathElement.addEventListener('click', () => onLayerClick('honey'));
        }
        svg.appendChild(pathElement);
      });
    }
  }, [currentData, onLayerClick]);

  return (
    <svg
      ref={svgRef}
      id={id}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
      }}
      data-testid="frame-renderer"
    />
  );
});

FrameRenderer.displayName = 'FrameRenderer';
