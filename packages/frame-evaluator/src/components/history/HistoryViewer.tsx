import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { FrameData } from '../../types';
import type { DatabaseAdapter } from '../../database/DatabaseAdapter';

/**
 * خصائص مكون HistoryViewer
 */
export interface HistoryViewerProps {
  /** معرف الإطار */
  frameId: string;
  
  /** جانب الإطار */
  side: 'A' | 'B';
  
  /** محول قاعدة البيانات */
  databaseAdapter: DatabaseAdapter;
  
  /** دالة يتم استدعاؤها عند تحميل تقييم سابق */
  onLoadEvaluation?: (data: FrameData) => void;
  
  /** دالة يتم استدعاؤها عند حذف تقييم */
  onDeleteEvaluation?: (id: string) => void;
  
  /** عدد التقييمات المراد عرضها (افتراضي: 10) */
  limit?: number;
  
  /** حجم المكون */
  size?: 'small' | 'medium' | 'large';
  
  /** اللغة */
  language?: 'ar' | 'en';
  
  /** تخصيص الألوان */
  colors?: {
    background?: string;
    border?: string;
    text?: string;
    hover?: string;
    selected?: string;
  };
}

/**
 * مكون HistoryViewer - يعرض قائمة التقييمات السابقة
 * 
 * @example
 * ```tsx
 * <HistoryViewer
 *   frameId="frame-123"
 *   side="A"
 *   databaseAdapter={supabaseAdapter}
 *   onLoadEvaluation={(data) => console.log('Loaded:', data)}
 *   limit={10}
 * />
 * ```
 */
export const HistoryViewer: React.FC<HistoryViewerProps> = React.memo(({
  frameId,
  databaseAdapter,
  onLoadEvaluation,
  onDeleteEvaluation,
  limit = 10,
  size = 'medium',
  language = 'ar',
  colors = {}
}) => {
  const [history, setHistory] = useState<FrameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // النصوص حسب اللغة - memoized
  const texts = useMemo(() => ({
    ar: {
      title: 'سجل التقييمات',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ أثناء تحميل السجل',
      emptyList: 'لا توجد تقييمات سابقة',
      load: 'تحميل',
      delete: 'حذف',
      confirm: 'هل أنت متأكد من حذف هذا التقييم؟',
      honey: 'عسل',
      brood: 'حضنة',
      beeBread: 'خبز نحل',
      empty: 'فارغ',
      evaluatedBy: 'بواسطة',
      evaluatedAt: 'في',
      retry: 'إعادة المحاولة'
    },
    en: {
      title: 'Evaluation History',
      loading: 'Loading...',
      error: 'Error loading history',
      emptyList: 'No previous evaluations',
      load: 'Load',
      delete: 'Delete',
      confirm: 'Are you sure you want to delete this evaluation?',
      honey: 'Honey',
      brood: 'Brood',
      beeBread: 'Bee Bread',
      empty: 'Empty',
      evaluatedBy: 'By',
      evaluatedAt: 'At',
      retry: 'Retry'
    }
  }), []);
  
  const t = texts[language];
  
  // الألوان الافتراضية - memoized
  const finalColors = useMemo(() => {
    const defaultColors = {
      background: '#FFFFFF',
      border: '#E5E7EB',
      text: '#1F2937',
      hover: '#F3F4F6',
      selected: '#DBEAFE'
    };
    return { ...defaultColors, ...colors };
  }, [colors]);
  
  // الأحجام - memoized
  const sizeConfig = useMemo(() => ({
    small: {
      padding: '8px',
      fontSize: '12px',
      itemHeight: '60px',
      buttonSize: '28px'
    },
    medium: {
      padding: '12px',
      fontSize: '14px',
      itemHeight: '80px',
      buttonSize: '32px'
    },
    large: {
      padding: '16px',
      fontSize: '16px',
      itemHeight: '100px',
      buttonSize: '36px'
    }
  }[size]), [size]);
  
  // تحميل السجل
  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await databaseAdapter.getEvaluationHistory(
        { frameId },
        { limit, orderBy: { field: 'createdAt', direction: 'desc' } }
      );
      
      // تحويل السجلات إلى FrameData
      const frameDataList = result.data.map((record) => ({
        id: record.id,
        frameId: record.frameId,
        side: record.side,
        honeyPercentage: record.honeyPercentage,
        broodPercentage: record.broodPercentage,
        beeBreadPercentage: record.beeBreadPercentage,
        emptyPercentage: record.emptyPercentage,
        broodAge: record.broodAge as 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED',
        isValid: record.isValid,
        evaluatedBy: record.metadata?.evaluatedBy || record.userId,
        evaluatedAt: record.createdAt,
        notes: record.notes
      }));
      
      setHistory(frameDataList);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [frameId, limit, databaseAdapter, t.error]);
  
  // تحميل السجل عند التحميل الأولي
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  
  // تحميل تقييم
  const handleLoad = useCallback((data: FrameData) => {
    setSelectedId(data.id || null);
    onLoadEvaluation?.(data);
  }, [onLoadEvaluation]);
  
  // حذف تقييم
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm(t.confirm)) {
      return;
    }
    
    try {
      const success = await databaseAdapter.deleteEvaluation(id);
      if (success) {
        setHistory(prev => prev.filter(item => item.id !== id));
        onDeleteEvaluation?.(id);
        
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.error('Error deleting evaluation:', err);
      alert(t.error);
    }
  }, [databaseAdapter, onDeleteEvaluation, selectedId, t.confirm, t.error]);
  
  // تنسيق التاريخ
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (language === 'ar') {
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // عرض حالة التحميل
  if (loading) {
    return (
      <div
        style={{
          padding: sizeConfig.padding,
          textAlign: 'center',
          color: finalColors.text,
          fontSize: sizeConfig.fontSize
        }}
        data-testid="history-viewer-loading"
      >
        {t.loading}
      </div>
    );
  }
  
  // عرض الخطأ
  if (error) {
    return (
      <div
        style={{
          padding: sizeConfig.padding,
          textAlign: 'center',
          color: '#EF4444',
          fontSize: sizeConfig.fontSize
        }}
        data-testid="history-viewer-error"
      >
        {error}
        <button
          onClick={loadHistory}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            fontSize: sizeConfig.fontSize,
            cursor: 'pointer'
          }}
        >
          {t.retry}
        </button>
      </div>
    );
  }
  
  // عرض قائمة فارغة
  if (history.length === 0) {
    return (
      <div
        style={{
          padding: sizeConfig.padding,
          textAlign: 'center',
          color: finalColors.text,
          fontSize: sizeConfig.fontSize
        }}
        data-testid="history-viewer-empty"
      >
        {t.emptyList}
      </div>
    );
  }
  
  // عرض القائمة
  return (
    <div
      style={{
        backgroundColor: finalColors.background,
        border: `1px solid ${finalColors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        direction: language === 'ar' ? 'rtl' : 'ltr'
      }}
      data-testid="history-viewer"
    >
      {/* العنوان */}
      <div
        style={{
          padding: sizeConfig.padding,
          borderBottom: `1px solid ${finalColors.border}`,
          fontWeight: 'bold',
          fontSize: sizeConfig.fontSize,
          color: finalColors.text
        }}
      >
        {t.title}
      </div>
      
      {/* القائمة */}
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {history.map((item) => (
          <div
            key={item.id}
            style={{
              padding: sizeConfig.padding,
              borderBottom: `1px solid ${finalColors.border}`,
              backgroundColor: selectedId === item.id ? finalColors.selected : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              minHeight: sizeConfig.itemHeight
            }}
            onMouseEnter={(e) => {
              if (selectedId !== item.id) {
                e.currentTarget.style.backgroundColor = finalColors.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            data-testid={`history-item-${item.id}`}
          >
            {/* التاريخ والوقت */}
            <div
              style={{
                fontSize: sizeConfig.fontSize,
                color: finalColors.text,
                marginBottom: '4px',
                fontWeight: '500'
              }}
            >
              {formatDate(item.evaluatedAt)}
            </div>
            
            {/* من قام بالتقييم */}
            {item.evaluatedBy && (
              <div
                style={{
                  fontSize: `calc(${sizeConfig.fontSize} * 0.85)`,
                  color: '#6B7280',
                  marginBottom: '8px'
                }}
              >
                {t.evaluatedBy}: {item.evaluatedBy}
              </div>
            )}
            
            {/* النسب المئوية */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '8px',
                fontSize: `calc(${sizeConfig.fontSize} * 0.9)`
              }}
            >
              <span>🍯 {item.honeyPercentage}%</span>
              <span>🐝 {item.broodPercentage}%</span>
              <span>🌼 {item.beeBreadPercentage}%</span>
            </div>
            
            {/* الأزرار */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoad(item);
                }}
                style={{
                  padding: '4px 12px',
                  fontSize: `calc(${sizeConfig.fontSize} * 0.9)`,
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  height: sizeConfig.buttonSize
                }}
                data-testid={`load-button-${item.id}`}
              >
                {t.load}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.id) handleDelete(item.id);
                }}
                style={{
                  padding: '4px 12px',
                  fontSize: `calc(${sizeConfig.fontSize} * 0.9)`,
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  height: sizeConfig.buttonSize
                }}
                data-testid={`delete-button-${item.id}`}
              >
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

HistoryViewer.displayName = 'HistoryViewer';

export default HistoryViewer;
