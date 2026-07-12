import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HistoryViewer } from './HistoryViewer';
import type { FrameData } from '../../types';
import type { DatabaseAdapter, FrameEvaluationRecord, QueryResult } from '../../database/DatabaseAdapter';

// Mock data - سجلات قاعدة البيانات
const mockRecords: FrameEvaluationRecord[] = [
  {
    id: 'eval-1',
    hiveId: 'hive-1',
    frameId: 'frame-123',
    userId: 'user-1',
    side: 'A',
    honeyPercentage: 40,
    broodPercentage: 50,
    beeBreadPercentage: 10,
    emptyPercentage: 0,
    broodAge: 'CAPPED',
    isValid: true,
    notes: 'تقييم جيد',
    images: [],
    metadata: { evaluatedBy: 'أحمد' },
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: 'eval-2',
    hiveId: 'hive-1',
    frameId: 'frame-123',
    userId: 'user-2',
    side: 'A',
    honeyPercentage: 35,
    broodPercentage: 45,
    beeBreadPercentage: 15,
    emptyPercentage: 5,
    broodAge: 'YOUNG_LARVAE',
    isValid: true,
    notes: '',
    images: [],
    metadata: { evaluatedBy: 'محمد' },
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-14T14:20:00')
  },
  {
    id: 'eval-3',
    hiveId: 'hive-1',
    frameId: 'frame-123',
    userId: 'user-3',
    side: 'A',
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 20,
    emptyPercentage: 10,
    broodAge: 'EGGS',
    isValid: true,
    notes: '',
    images: [],
    metadata: { evaluatedBy: 'علي' },
    createdAt: new Date('2024-01-13T09:15:00'),
    updatedAt: new Date('2024-01-13T09:15:00')
  }
];

// Mock DatabaseAdapter
const createMockAdapter = (
  records: FrameEvaluationRecord[] = mockRecords,
  shouldFail = false
): DatabaseAdapter => ({
  async getEvaluationHistory(
    _filters?: { hiveId?: string; frameId?: string; userId?: string },
    options?: { limit?: number; offset?: number }
  ): Promise<QueryResult<FrameEvaluationRecord>> {
    if (shouldFail) {
      throw new Error('Database error');
    }
    const limit = options?.limit || records.length;
    const offset = options?.offset || 0;
    const data = records.slice(offset, offset + limit);
    return {
      data,
      total: records.length,
      hasMore: offset + limit < records.length
    };
  },
  
  async deleteEvaluation(_id: string): Promise<boolean> {
    if (shouldFail) {
      throw new Error('Delete failed');
    }
    return true;
  },
  
  async saveEvaluation(_data: FrameData): Promise<FrameEvaluationRecord> {
    return mockRecords[0];
  },
  
  async getEvaluation(id: string): Promise<FrameEvaluationRecord | null> {
    return records.find(item => item.id === id) || null;
  },
  
  async getLatestEvaluation(): Promise<FrameEvaluationRecord | null> {
    return records[0] || null;
  },
  
  async updateEvaluation(_id: string, _data: Partial<FrameData>): Promise<FrameEvaluationRecord> {
    return mockRecords[0];
  },
  
  async searchEvaluations(): Promise<QueryResult<FrameEvaluationRecord>> {
    return {
      data: records,
      total: records.length,
      hasMore: false
    };
  },
  
  async getStatistics() {
    return {
      totalEvaluations: records.length,
      averageHoney: 35,
      averageBrood: 45,
      averageBeeBread: 15,
      mostCommonBroodAge: 'CAPPED'
    };
  }
});

describe('HistoryViewer', () => {
  // Mock window.confirm
  beforeAll(() => {
    global.confirm = jest.fn(() => true);
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
  });
  
  describe('عرض القائمة', () => {
    test('يعرض قائمة التقييمات بنجاح', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      // انتظار التحميل
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      // التحقق من عرض القائمة
      expect(screen.getByTestId('history-viewer')).toBeInTheDocument();
      expect(screen.getByText('سجل التقييمات')).toBeInTheDocument();
      
      // التحقق من عرض جميع العناصر
      expect(screen.getByTestId('history-item-eval-1')).toBeInTheDocument();
      expect(screen.getByTestId('history-item-eval-2')).toBeInTheDocument();
      expect(screen.getByTestId('history-item-eval-3')).toBeInTheDocument();
    });
    
    test('يعرض حالة التحميل', () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      expect(screen.getByTestId('history-viewer-loading')).toBeInTheDocument();
      expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
    });
    
    test('يعرض رسالة عند عدم وجود تقييمات', async () => {
      const adapter = createMockAdapter([]);
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('history-viewer-empty')).toBeInTheDocument();
      });
      
      expect(screen.getByText('لا توجد تقييمات سابقة')).toBeInTheDocument();
    });
    
    test('يعرض رسالة خطأ عند فشل التحميل', async () => {
      const adapter = createMockAdapter([], true);
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('history-viewer-error')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Database error/)).toBeInTheDocument();
    });
  });
  
  describe('عرض البيانات', () => {
    test('يعرض التاريخ والوقت بشكل صحيح', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      // التحقق من عرض التاريخ (بالعربية - يستخدم أرقام عربية)
      // التاريخ يظهر كـ "١٥ يناير ٢٠٢٤" بدلاً من "15 يناير 2024"
      const dates = screen.getAllByText(/يناير ٢٠٢٤/);
      expect(dates.length).toBeGreaterThan(0);
      expect(dates[0]).toBeInTheDocument();
    });
    
    test('يعرض اسم المقيّم', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText(/بواسطة: أحمد/)).toBeInTheDocument();
      expect(screen.getByText(/بواسطة: محمد/)).toBeInTheDocument();
      expect(screen.getByText(/بواسطة: علي/)).toBeInTheDocument();
    });
    
    test('يعرض النسب المئوية', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      // التحقق من عرض النسب المئوية للتقييم الأول
      const firstItem = screen.getByTestId('history-item-eval-1');
      expect(firstItem).toHaveTextContent('🍯 40%');
      expect(firstItem).toHaveTextContent('🐝 50%');
      expect(firstItem).toHaveTextContent('🌼 10%');
    });
  });
  
  describe('التفاعل', () => {
    test('يستدعي onLoadEvaluation عند النقر على زر التحميل', async () => {
      const adapter = createMockAdapter();
      const onLoad = jest.fn();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          onLoadEvaluation={onLoad}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      // النقر على زر التحميل
      const loadButton = screen.getByTestId('load-button-eval-1');
      fireEvent.click(loadButton);
      
      // التحقق من استدعاء الدالة مع السجل الصحيح
      expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({
        id: 'eval-1',
        honeyPercentage: 40,
        broodPercentage: 50,
        beeBreadPercentage: 10
      }));
    });
    
    test('يحذف التقييم عند النقر على زر الحذف', async () => {
      const adapter = createMockAdapter();
      const onDelete = jest.fn();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          onDeleteEvaluation={onDelete}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      // النقر على زر الحذف
      const deleteButton = screen.getByTestId('delete-button-eval-1');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('eval-1');
      });
    });
    
    test('يطلب تأكيد قبل الحذف', async () => {
      const adapter = createMockAdapter();
      const confirmSpy = jest.spyOn(window, 'confirm');
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      const deleteButton = screen.getByTestId('delete-button-eval-1');
      fireEvent.click(deleteButton);
      
      expect(confirmSpy).toHaveBeenCalled();
    });
    
    test('يلغي الحذف عند رفض التأكيد', async () => {
      const adapter = createMockAdapter();
      const onDelete = jest.fn();
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          onDeleteEvaluation={onDelete}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      const deleteButton = screen.getByTestId('delete-button-eval-1');
      fireEvent.click(deleteButton);
      
      expect(onDelete).not.toHaveBeenCalled();
    });
    
    test('يبرز العنصر المحدد', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      const loadButton = screen.getByTestId('load-button-eval-1');
      fireEvent.click(loadButton);
      
      const item = screen.getByTestId('history-item-eval-1');
      expect(item).toHaveStyle({ backgroundColor: '#DBEAFE' });
    });
  });
  
  describe('التخصيص', () => {
    test('يدعم الأحجام المختلفة', async () => {
      const adapter = createMockAdapter();
      
      const { rerender } = render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          size="small"
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      let item = screen.getByTestId('history-item-eval-1');
      expect(item).toHaveStyle({ minHeight: '60px' });
      
      rerender(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          size="large"
        />
      );
      
      await waitFor(() => {
        item = screen.getByTestId('history-item-eval-1');
        expect(item).toHaveStyle({ minHeight: '100px' });
      });
    });
    
    test('يدعم اللغة الإنجليزية', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          language="en"
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText('Evaluation History')).toBeInTheDocument();
      expect(screen.getByText(/By: أحمد/)).toBeInTheDocument();
    });
    
    test('يدعم تخصيص الألوان', async () => {
      const adapter = createMockAdapter();
      const customColors = {
        background: '#F0F0F0',
        border: '#CCCCCC',
        text: '#333333'
      };
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          colors={customColors}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      const viewer = screen.getByTestId('history-viewer');
      expect(viewer).toHaveStyle({
        backgroundColor: '#F0F0F0',
        border: '1px solid #CCCCCC'
      });
    });
    
    test('يحترم حد العرض (limit)', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          limit={2}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      expect(screen.getByTestId('history-item-eval-1')).toBeInTheDocument();
      expect(screen.getByTestId('history-item-eval-2')).toBeInTheDocument();
      expect(screen.queryByTestId('history-item-eval-3')).not.toBeInTheDocument();
    });
  });
  
  describe('معالجة الأخطاء', () => {
    test('يعرض زر إعادة المحاولة عند حدوث خطأ', async () => {
      const adapter = createMockAdapter([], true);
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('history-viewer-error')).toBeInTheDocument();
      });
      
      expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
    });
    
    test('يعيد المحاولة عند النقر على زر إعادة المحاولة', async () => {
      let shouldFail = true;
      const adapter: DatabaseAdapter = {
        async getEvaluationHistory() {
          if (shouldFail) {
            throw new Error('Database error');
          }
          return {
            data: mockRecords,
            total: mockRecords.length,
            hasMore: false
          };
        },
        async deleteEvaluation() { return true; },
        async saveEvaluation() { return mockRecords[0]; },
        async getEvaluation() { return null; },
        async getLatestEvaluation() { return null; },
        async updateEvaluation() { return mockRecords[0]; },
        async searchEvaluations() {
          return {
            data: mockRecords,
            total: mockRecords.length,
            hasMore: false
          };
        },
        async getStatistics() {
          return {
            totalEvaluations: 0,
            averageHoney: 0,
            averageBrood: 0,
            averageBeeBread: 0,
            mostCommonBroodAge: 'EGGS'
          };
        }
      };
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('history-viewer-error')).toBeInTheDocument();
      });
      
      // تغيير الحالة للنجاح
      shouldFail = false;
      
      const retryButton = screen.getByText('إعادة المحاولة');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('history-viewer')).toBeInTheDocument();
      });
    });
  });
  
  describe('اتجاه النص (RTL/LTR)', () => {
    test('يستخدم RTL للعربية', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          language="ar"
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      const viewer = screen.getByTestId('history-viewer');
      expect(viewer).toHaveStyle({ direction: 'rtl' });
    });
    
    test('يستخدم LTR للإنجليزية', async () => {
      const adapter = createMockAdapter();
      
      render(
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={adapter}
          language="en"
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('history-viewer-loading')).not.toBeInTheDocument();
      });
      
      const viewer = screen.getByTestId('history-viewer');
      expect(viewer).toHaveStyle({ direction: 'ltr' });
    });
  });
});
