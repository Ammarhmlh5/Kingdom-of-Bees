import type { Meta, StoryObj } from '@storybook/react';
import { BroodSlider } from './BroodSlider';
import { BroodAge } from '../types';
import { useState } from 'react';

/**
 * مؤشر الحضنة - مكون تفاعلي لتحديد نسبة الحضنة في الإطار
 * 
 * يظهر في الجزء السفلي من الإطار ويدعم السحب الأفقي
 * مع ألوان مختلفة حسب عمر الحضنة
 */
const meta = {
  title: 'Components/BroodSlider',
  component: BroodSlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'مؤشر تفاعلي لتحديد نسبة الحضنة في الإطار. يدعم السحب الأفقي مع ألوان مختلفة حسب عمر الحضنة.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'نسبة الحضنة (0-100%)',
    },
    broodAge: {
      control: 'select',
      options: ['EGGS', 'YOUNG_LARVAE', 'OLD_LARVAE', 'CAPPED', 'MIXED'],
      description: 'عمر الحضنة',
    },
    onChange: {
      action: 'changed',
      description: 'دالة تُستدعى عند تغيير القيمة',
    },
    disabled: {
      control: 'boolean',
      description: 'تعطيل المؤشر',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'حجم المؤشر',
    },
    color: {
      control: 'color',
      description: 'لون مخصص للمؤشر',
    },
    showLabel: {
      control: 'boolean',
      description: 'إظهار التسمية',
    },
    snapPoints: {
      control: 'object',
      description: 'نقاط الالتصاق',
    },
    hapticFeedback: {
      control: 'boolean',
      description: 'تفعيل الاهتزاز اللمسي',
    },
  },
} satisfies Meta<typeof BroodSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * المؤشر الافتراضي بقيمة 50% وحضنة مغلقة
 */
export const Default: Story = {
  args: {
    value: 50,
    broodAge: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    snapPoints: [0, 25, 50, 75, 100],
    hapticFeedback: true,
  },
};

/**
 * حضنة بيض (EGGS)
 */
export const Eggs: Story = {
  args: {
    value: 60,
    broodAge: 'EGGS',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * يرقات صغيرة (YOUNG_LARVAE)
 */
export const YoungLarvae: Story = {
  args: {
    value: 55,
    broodAge: 'YOUNG_LARVAE',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * يرقات كبيرة (OLD_LARVAE)
 */
export const OldLarvae: Story = {
  args: {
    value: 65,
    broodAge: 'OLD_LARVAE',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * حضنة مغلقة (CAPPED)
 */
export const Capped: Story = {
  args: {
    value: 70,
    broodAge: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * حضنة مختلطة (MIXED) - تدرج لوني
 */
export const Mixed: Story = {
  args: {
    value: 75,
    broodAge: 'MIXED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر فارغ (0%)
 */
export const Empty: Story = {
  args: {
    value: 0,
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر ممتلئ (100%)
 */
export const Full: Story = {
  args: {
    value: 100,
    broodAge: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر صغير
 */
export const Small: Story = {
  args: {
    value: 45,
    broodAge: 'YOUNG_LARVAE',
    onChange: () => {},
    size: 'small',
    showLabel: true,
  },
};

/**
 * مؤشر كبير
 */
export const Large: Story = {
  args: {
    value: 80,
    broodAge: 'CAPPED',
    onChange: () => {},
    size: 'large',
    showLabel: true,
  },
};

/**
 * مؤشر معطل
 */
export const Disabled: Story = {
  args: {
    value: 40,
    broodAge: 'OLD_LARVAE',
    onChange: () => {},
    disabled: true,
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر بلون مخصص
 */
export const CustomColor: Story = {
  args: {
    value: 55,
    onChange: () => {},
    color: '#8B5CF6',
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر بدون تسمية
 */
export const NoLabel: Story = {
  args: {
    value: 50,
    broodAge: 'CAPPED',
    onChange: () => {},
    size: 'medium',
    showLabel: false,
  },
};

/**
 * مؤشر تفاعلي - يمكن تغيير القيمة
 */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(50);
    const [broodAge, setBroodAge] = useState<BroodAge>('CAPPED');
    
    return (
      <div style={{ padding: '20px' }}>
        <BroodSlider
          {...args}
          value={value}
          broodAge={broodAge}
          onChange={setValue}
        />
        <div style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
          <div>القيمة الحالية: {value}%</div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ marginRight: '10px' }}>عمر الحضنة:</label>
            <select 
              value={broodAge} 
              onChange={(e) => setBroodAge(e.target.value as BroodAge)}
              style={{ padding: '5px', fontFamily: 'Arial' }}
            >
              <option value="EGGS">بيض</option>
              <option value="YOUNG_LARVAE">يرقات صغيرة</option>
              <option value="OLD_LARVAE">يرقات كبيرة</option>
              <option value="CAPPED">مغلقة</option>
              <option value="MIXED">مختلطة</option>
            </select>
          </div>
        </div>
      </div>
    );
  },
  args: {
    size: 'medium',
    showLabel: true,
    snapPoints: [0, 25, 50, 75, 100],
    hapticFeedback: true,
  },
};

/**
 * مقارنة أعمار الحضنة المختلفة
 */
export const BroodAgeComparison: Story = {
  render: () => {
    const [value, setValue] = useState(60);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            بيض (EGGS) - #FFFBEB
          </div>
          <BroodSlider
            value={value}
            broodAge="EGGS"
            onChange={setValue}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            يرقات صغيرة (YOUNG_LARVAE) - #FEF3C7
          </div>
          <BroodSlider
            value={value}
            broodAge="YOUNG_LARVAE"
            onChange={setValue}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            يرقات كبيرة (OLD_LARVAE) - #FDE68A
          </div>
          <BroodSlider
            value={value}
            broodAge="OLD_LARVAE"
            onChange={setValue}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            مغلقة (CAPPED) - #D97706
          </div>
          <BroodSlider
            value={value}
            broodAge="CAPPED"
            onChange={setValue}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            مختلطة (MIXED) - تدرج لوني
          </div>
          <BroodSlider
            value={value}
            broodAge="MIXED"
            onChange={setValue}
            size="medium"
            showLabel={true}
          />
        </div>
      </div>
    );
  },
};

/**
 * مقارنة الأحجام المختلفة
 */
export const SizeComparison: Story = {
  render: () => {
    const [smallValue, setSmallValue] = useState(30);
    const [mediumValue, setMediumValue] = useState(50);
    const [largeValue, setLargeValue] = useState(70);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            صغير (Small)
          </div>
          <BroodSlider
            value={smallValue}
            broodAge="CAPPED"
            onChange={setSmallValue}
            size="small"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            متوسط (Medium)
          </div>
          <BroodSlider
            value={mediumValue}
            broodAge="CAPPED"
            onChange={setMediumValue}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            كبير (Large)
          </div>
          <BroodSlider
            value={largeValue}
            broodAge="CAPPED"
            onChange={setLargeValue}
            size="large"
            showLabel={true}
          />
        </div>
      </div>
    );
  },
};
