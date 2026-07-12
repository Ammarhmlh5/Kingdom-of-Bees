import type { Meta, StoryObj } from '@storybook/react';
import { BroodAgeSelector } from './BroodAgeSelector';
import { BroodAge } from '../types';
import { useState } from 'react';

/**
 * محدد عمر الحضنة - مكون تفاعلي لاختيار عمر الحضنة
 * 
 * يظهر على الجانب الأيمن من الإطار مع 5 مراحل منفصلة
 * من الأسفل للأعلى: بيض، يرقات صغيرة، مختلطة، يرقات كبيرة، مغلقة
 */
const meta = {
  title: 'Components/BroodAgeSelector',
  component: BroodAgeSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'محدد تفاعلي لاختيار عمر الحضنة. يدعم 5 مراحل منفصلة مع إمكانية النقر أو السحب للاختيار.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['EGGS', 'YOUNG_LARVAE', 'MIXED', 'OLD_LARVAE', 'CAPPED'],
      description: 'عمر الحضنة المحدد',
    },
    onChange: {
      action: 'changed',
      description: 'دالة تُستدعى عند تغيير العمر',
    },
    disabled: {
      control: 'boolean',
      description: 'تعطيل المحدد',
    },
    visible: {
      control: 'boolean',
      description: 'إظهار/إخفاء المحدد',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'حجم المحدد',
    },
    showLabel: {
      control: 'boolean',
      description: 'إظهار التسمية',
    },
  },
} satisfies Meta<typeof BroodAgeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * المحدد الافتراضي - حضنة مغلقة
 */
export const Default: Story = {
  args: {
    value: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * بيض (EGGS)
 */
export const Eggs: Story = {
  args: {
    value: 'EGGS',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * يرقات صغيرة (YOUNG_LARVAE)
 */
export const YoungLarvae: Story = {
  args: {
    value: 'YOUNG_LARVAE',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * مختلطة (MIXED)
 */
export const Mixed: Story = {
  args: {
    value: 'MIXED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * يرقات كبيرة (OLD_LARVAE)
 */
export const OldLarvae: Story = {
  args: {
    value: 'OLD_LARVAE',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * حضنة مغلقة (CAPPED)
 */
export const Capped: Story = {
  args: {
    value: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * محدد صغير
 */
export const Small: Story = {
  args: {
    value: 'YOUNG_LARVAE',
    onChange: () => {},
    size: 'small',
    showLabel: true,
    visible: true,
  },
};

/**
 * محدد كبير
 */
export const Large: Story = {
  args: {
    value: 'OLD_LARVAE',
    onChange: () => {},
    size: 'large',
    showLabel: true,
    visible: true,
  },
};

/**
 * محدد معطل
 */
export const Disabled: Story = {
  args: {
    value: 'CAPPED',
    onChange: () => {},
    disabled: true,
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * محدد مخفي
 */
export const Hidden: Story = {
  args: {
    value: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    visible: false,
  },
};

/**
 * محدد بدون تسمية
 */
export const NoLabel: Story = {
  args: {
    value: 'MIXED',
    onChange: () => {},
    size: 'medium',
    showLabel: false,
    visible: true,
  },
};

/**
 * محدد تفاعلي - يمكن تغيير العمر
 */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState<BroodAge>('CAPPED');
    
    const stageNames: Record<BroodAge, string> = {
      EGGS: 'بيض',
      YOUNG_LARVAE: 'يرقات صغيرة',
      MIXED: 'مختلطة',
      OLD_LARVAE: 'يرقات كبيرة',
      CAPPED: 'مغلقة',
    };
    
    return (
      <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <BroodAgeSelector
          {...args}
          value={value}
          onChange={setValue}
        />
        <div style={{ fontFamily: 'Arial' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            العمر المحدد: {stageNames[value]}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            انقر على أي مرحلة لتحديدها
          </div>
        </div>
      </div>
    );
  },
  args: {
    size: 'medium',
    showLabel: true,
    visible: true,
  },
};

/**
 * مقارنة الأحجام المختلفة
 */
export const SizeComparison: Story = {
  render: () => {
    const [value, setValue] = useState<BroodAge>('MIXED');
    
    return (
      <div style={{ display: 'flex', gap: '40px', padding: '20px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BroodAgeSelector
            value={value}
            onChange={setValue}
            size="small"
            showLabel={true}
            visible={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            صغير (Small)
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BroodAgeSelector
            value={value}
            onChange={setValue}
            size="medium"
            showLabel={true}
            visible={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            متوسط (Medium)
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BroodAgeSelector
            value={value}
            onChange={setValue}
            size="large"
            showLabel={true}
            visible={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            كبير (Large)
          </div>
        </div>
      </div>
    );
  },
};

/**
 * جميع المراحل - عرض تفصيلي
 */
export const AllStages: Story = {
  render: () => {
    const stages: BroodAge[] = ['EGGS', 'YOUNG_LARVAE', 'MIXED', 'OLD_LARVAE', 'CAPPED'];
    const stageNames: Record<BroodAge, string> = {
      EGGS: 'بيض 🥚',
      YOUNG_LARVAE: 'يرقات صغيرة 🐛',
      MIXED: 'مختلطة 🔄',
      OLD_LARVAE: 'يرقات كبيرة 🐛',
      CAPPED: 'مغلقة 🔒',
    };
    const stageColors: Record<BroodAge, string> = {
      EGGS: '#FFFBEB',
      YOUNG_LARVAE: '#FEF3C7',
      MIXED: 'linear-gradient',
      OLD_LARVAE: '#FDE68A',
      CAPPED: '#D97706',
    };
    
    return (
      <div style={{ display: 'flex', gap: '30px', padding: '20px', alignItems: 'flex-end' }}>
        {stages.map((stage) => (
          <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <BroodAgeSelector
              value={stage}
              onChange={() => {}}
              size="medium"
              showLabel={false}
              visible={true}
            />
            <div style={{ 
              fontFamily: 'Arial', 
              fontSize: '12px',
              textAlign: 'center',
              maxWidth: '80px'
            }}>
              {stageNames[stage]}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#666',
              fontFamily: 'monospace'
            }}>
              {stageColors[stage]}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * محاكاة الاستخدام الحقيقي - مع التحكم في الرؤية
 */
export const RealWorldUsage: Story = {
  render: () => {
    const [broodPercentage, setBroodPercentage] = useState(50);
    const [broodAge, setBroodAge] = useState<BroodAge>('CAPPED');
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', fontFamily: 'Arial' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            نسبة الحضنة: {broodPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={broodPercentage}
            onChange={(e) => setBroodPercentage(Number(e.target.value))}
            style={{ width: '300px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <BroodAgeSelector
            value={broodAge}
            onChange={setBroodAge}
            size="medium"
            showLabel={true}
            visible={broodPercentage > 0}
          />
          
          <div style={{ fontFamily: 'Arial' }}>
            {broodPercentage > 0 ? (
              <>
                <div style={{ fontWeight: 'bold' }}>عمر الحضنة المحدد:</div>
                <div style={{ marginTop: '5px' }}>{broodAge}</div>
              </>
            ) : (
              <div style={{ color: '#999', fontStyle: 'italic' }}>
                المحدد مخفي لأن نسبة الحضنة = 0%
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * التنقل بين المراحل - عرض متحرك
 */
export const StageNavigation: Story = {
  render: () => {
    const stages: BroodAge[] = ['EGGS', 'YOUNG_LARVAE', 'MIXED', 'OLD_LARVAE', 'CAPPED'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [value, setValue] = useState<BroodAge>(stages[0]);
    
    const stageNames: Record<BroodAge, string> = {
      EGGS: 'بيض',
      YOUNG_LARVAE: 'يرقات صغيرة',
      MIXED: 'مختلطة',
      OLD_LARVAE: 'يرقات كبيرة',
      CAPPED: 'مغلقة',
    };
    
    const handlePrevious = () => {
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);
      setValue(stages[newIndex]);
    };
    
    const handleNext = () => {
      const newIndex = Math.min(stages.length - 1, currentIndex + 1);
      setCurrentIndex(newIndex);
      setValue(stages[newIndex]);
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <BroodAgeSelector
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              setCurrentIndex(stages.indexOf(newValue));
            }}
            size="large"
            showLabel={true}
            visible={true}
          />
          
          <div style={{ fontFamily: 'Arial' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stageNames[value]}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              المرحلة {currentIndex + 1} من {stages.length}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{
              padding: '10px 20px',
              fontFamily: 'Arial',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1,
            }}
          >
            ← السابق
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === stages.length - 1}
            style={{
              padding: '10px 20px',
              fontFamily: 'Arial',
              cursor: currentIndex === stages.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === stages.length - 1 ? 0.5 : 1,
            }}
          >
            التالي →
          </button>
        </div>
      </div>
    );
  },
};

/**
 * محاكاة إطار كامل - مع جميع المؤشرات
 */
export const FullFrameSimulation: Story = {
  render: () => {
    const [broodAge, setBroodAge] = useState<BroodAge>('CAPPED');
    
    return (
      <div style={{ 
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ 
          width: '300px', 
          height: '400px', 
          border: '3px solid #8B4513',
          borderRadius: '8px',
          position: 'relative',
          backgroundColor: '#F5F5DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial',
          color: '#999',
          fontSize: '18px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div>إطار الخلية</div>
            <div style={{ fontSize: '14px', marginTop: '10px' }}>
              عمر الحضنة: {broodAge}
            </div>
          </div>
        </div>
        
        <BroodAgeSelector
          value={broodAge}
          onChange={setBroodAge}
          size="large"
          showLabel={true}
          visible={true}
        />
      </div>
    );
  },
};
