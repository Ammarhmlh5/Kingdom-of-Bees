import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HistoryViewer } from './HistoryViewer';
import type { FrameData, DatabaseAdapter } from '../../types';

// Mock data
const mockHistory: FrameData[] = [
  {
    id: 'eval-1',
    frameId: 'frame-123',
    side: 'A',
    honeyPercentage: 40,
    broodPercentage: 50,
    beeBreadPercentage: 10,
    emptyPercentage: 0,
    broodAge: 'CAPPED',
    evaluatedBy: 'أحمد محمد',
    evaluatedAt: new Date('2024-01-15T10:30:00'),
    notes: 'إطار ممتاز، حضنة مغلقة بشكل جيد',
    isValid: true
  },
  {
    id: 'eval-2',
    frameId: 'frame-123',
    side: 'A',
    honeyPercentage: 35,
    broodPercentage: 45,
    beeBreadPercentage: 15,
    emptyPercentage: 5,
    broodAge: 'YOUNG_LARVAE',
    evaluatedBy: 'محمد علي',
    evaluatedAt: new Date('2024-01-14T14:20:00'),
    notes: 'يرقات صغيرة، تحتاج متابعة',
    isValid: true
  },
  {
    id: 'eval-3',
    frameId: 'frame-123',
    side: 'A',
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 20,
    emptyPercentage: 10,
    broodAge: 'EGGS',
    evaluatedBy: 'علي حسن',
    evaluatedAt: new Date('2024-01-13T09:15:00'),
    notes: 'بيض جديد، الملكة نشطة',
    isValid: true
  },
  {
    id: 'eval-4',
    frameId: 'frame-123',
    side: 'A',
    honeyPercentage: 60,
    broodPercentage: 30,
    beeBreadPercentage: 10,
    emptyPercentage: 0,
    broodAge: 'OLD_LARVAE',
    evaluatedBy: 'حسن أحمد',
    evaluatedAt: new Date('2024-01-12T16:45:00'),
    notes: 'عسل وفير، يرقات كبيرة',
    isValid: true
  },
  {
    id: 'eval-5',
    frameId: 'frame-123',
    side: 'A',
    honeyPercentage: 25,
    broodPercentage: 55,
    beeBreadPercentage: 15,
    emptyPercentage: 5,
    broodAge: 'MIXED',
    evaluatedBy: 'أحمد محمد',
    evaluatedAt: new Date('2024-01-11T11:00:00'),
    notes: 'حضنة مختلطة الأعمار',
    isValid: true
  }
];

// Mock DatabaseAdapter
const createMockAdapter = (
  history: FrameData[] = mockHistory,
  delay = 500
): DatabaseAdapter => ({
  async getEvaluationHistory(frameId: string, side: 'A' | 'B', limit?: number) {
    await new Promise(resolve => setTimeout(resolve, delay));
    return history.slice(0, limit);
  },
  
  async deleteEvaluation(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Deleted evaluation:', id);
  },
  
  async saveEvaluation(data: FrameData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'new-id';
  },
  
  async getEvaluation(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return history.find(item => item.id === id) || null;
  },
  
  async getLatestEvaluation(frameId: string, side: 'A' | 'B') {
    await new Promise(resolve => setTimeout(resolve, 300));
    return history[0] || null;
  },
  
  async updateEvaluation(id: string, data: Partial<FrameData>) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
});

const meta: Meta<typeof HistoryViewer> = {
  title: 'Components/History/HistoryViewer',
  component: HistoryViewer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# مكون HistoryViewer

مكون لعرض قائمة التقييمات السابقة للإطار مع إمكانية تحميل أو حذف أي تقييم.

## الميزات
- عرض قائمة التقييمات مع التاريخ والوقت
- عرض اسم من قام بالتقييم
- عرض النسب المئوية لكل تقييم
- تحميل تقييم سابق
- حذف تقييم مع تأكيد
- دعم اللغتين العربية والإنجليزية
- دعم RTL/LTR
- أحجام مختلفة (small, medium, large)
- تخصيص الألوان
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    frameId: {
      description: 'معرف الإطار',
      control: 'text'
    },
    side: {
      description: 'جانب الإطار',
      control: 'radio',
      options: ['A', 'B']
    },
    limit: {
      description: 'عدد التقييمات المراد عرضها',
      control: { type: 'number', min: 1, max: 20 }
    },
    size: {
      description: 'حجم المكون',
      control: 'radio',
      options: ['small', 'medium', 'large']
    },
    language: {
      description: 'اللغة',
      control: 'radio',
      options: ['ar', 'en']
    }
  }
};

export default meta;
type Story = StoryObj<typeof HistoryViewer>;

/**
 * الحالة الافتراضية - قائمة كاملة بالعربية
 */
export const Default: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    limit: 10,
    size: 'medium',
    language: 'ar'
  }
};

/**
 * قائمة بالإنجليزية
 */
export const English: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    limit: 10,
    size: 'medium',
    language: 'en'
  }
};

/**
 * حجم صغير
 */
export const SmallSize: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    size: 'small',
    language: 'ar'
  }
};

/**
 * حجم كبير
 */
export const LargeSize: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    size: 'large',
    language: 'ar'
  }
};

/**
 * قائمة محدودة (3 عناصر فقط)
 */
export const LimitedList: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    limit: 3,
    size: 'medium',
    language: 'ar'
  }
};

/**
 * قائمة فارغة
 */
export const EmptyList: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter([]),
    size: 'medium',
    language: 'ar'
  }
};

/**
 * حالة التحميل
 */
export const Loading: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(mockHistory, 5000), // تأخير 5 ثواني
    size: 'medium',
    language: 'ar'
  }
};

/**
 * حالة الخطأ
 */
export const Error: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: {
      async getEvaluationHistory() {
        await new Promise(resolve => setTimeout(resolve, 500));
        throw new Error('فشل الاتصال بقاعدة البيانات');
      },
      async deleteEvaluation() {},
      async saveEvaluation() { return 'id'; },
      async getEvaluation() { return null; },
      async getLatestEvaluation() { return null; },
      async updateEvaluation() {}
    },
    size: 'medium',
    language: 'ar'
  }
};

/**
 * مع معالجات الأحداث
 */
export const WithEventHandlers: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    onLoadEvaluation: (data) => {
      console.log('Loaded evaluation:', data);
      alert(`تم تحميل التقييم: ${data.id}`);
    },
    onDeleteEvaluation: (id) => {
      console.log('Deleted evaluation:', id);
      alert(`تم حذف التقييم: ${id}`);
    },
    size: 'medium',
    language: 'ar'
  }
};

/**
 * ألوان مخصصة - سمة داكنة
 */
export const DarkTheme: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    colors: {
      background: '#1F2937',
      border: '#374151',
      text: '#F9FAFB',
      hover: '#374151',
      selected: '#1E40AF'
    },
    size: 'medium',
    language: 'ar'
  }
};

/**
 * ألوان مخصصة - سمة زرقاء
 */
export const BlueTheme: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    colors: {
      background: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1E3A8A',
      hover: '#DBEAFE',
      selected: '#93C5FD'
    },
    size: 'medium',
    language: 'ar'
  }
};

/**
 * ألوان مخصصة - سمة خضراء
 */
export const GreenTheme: Story = {
  args: {
    frameId: 'frame-123',
    side: 'A',
    databaseAdapter: createMockAdapter(),
    colors: {
      background: '#F0FDF4',
      border: '#BBF7D0',
      text: '#14532D',
      hover: '#DCFCE7',
      selected: '#86EFAC'
    },
    size: 'medium',
    language: 'ar'
  }
};

/**
 * مقارنة الأحجام
 */
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <h3 style={{ marginBottom: '10px' }}>Small</h3>
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={createMockAdapter()}
          size="small"
          limit={3}
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>Medium</h3>
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={createMockAdapter()}
          size="medium"
          limit={3}
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>Large</h3>
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={createMockAdapter()}
          size="large"
          limit={3}
        />
      </div>
    </div>
  )
};

/**
 * مقارنة اللغات
 */
export const LanguageComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <h3 style={{ marginBottom: '10px' }}>العربية (RTL)</h3>
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={createMockAdapter()}
          language="ar"
          limit={3}
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '10px' }}>English (LTR)</h3>
        <HistoryViewer
          frameId="frame-123"
          side="A"
          databaseAdapter={createMockAdapter()}
          language="en"
          limit={3}
        />
      </div>
    </div>
  )
};

/**
 * تفاعلي - مع حالة
 */
export const Interactive: Story = {
  render: () => {
    const [selectedEvaluation, setSelectedEvaluation] = React.useState<FrameData | null>(null);
    const [deletedIds, setDeletedIds] = React.useState<string[]>([]);
    
    return (
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <HistoryViewer
            frameId="frame-123"
            side="A"
            databaseAdapter={createMockAdapter(
              mockHistory.filter(item => !deletedIds.includes(item.id || ''))
            )}
            onLoadEvaluation={(data) => {
              setSelectedEvaluation(data);
            }}
            onDeleteEvaluation={(id) => {
              setDeletedIds(prev => [...prev, id]);
              if (selectedEvaluation?.id === id) {
                setSelectedEvaluation(null);
              }
            }}
            size="medium"
            language="ar"
          />
        </div>
        
        <div style={{ flex: 1, padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>التقييم المحدد</h3>
          {selectedEvaluation ? (
            <div>
              <p><strong>المعرف:</strong> {selectedEvaluation.id}</p>
              <p><strong>التاريخ:</strong> {selectedEvaluation.evaluatedAt?.toLocaleString('ar-EG')}</p>
              <p><strong>المقيّم:</strong> {selectedEvaluation.evaluatedBy}</p>
              <p><strong>العسل:</strong> {selectedEvaluation.honeyPercentage}%</p>
              <p><strong>الحضنة:</strong> {selectedEvaluation.broodPercentage}%</p>
              <p><strong>خبز النحل:</strong> {selectedEvaluation.beeBreadPercentage}%</p>
              <p><strong>عمر الحضنة:</strong> {selectedEvaluation.broodAge}</p>
              {selectedEvaluation.notes && (
                <p><strong>ملاحظات:</strong> {selectedEvaluation.notes}</p>
              )}
            </div>
          ) : (
            <p style={{ color: '#6B7280' }}>لم يتم تحديد أي تقييم</p>
          )}
          
          {deletedIds.length > 0 && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '4px' }}>
              <strong>التقييمات المحذوفة:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingRight: '20px' }}>
                {deletedIds.map(id => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
};
