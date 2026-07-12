import type { Meta, StoryObj } from '@storybook/react';
import { HoneySlider } from './HoneySlider';
import { useState } from 'react';

/**
 * مؤشر العسل - مكون تفاعلي لتحديد نسبة العسل في الإطار
 * 
 * يظهر في الجزء العلوي من الإطار ويدعم السحب الأفقي
 * مع تدرج لوني من الفاتح إلى الداكن حسب النسبة
 */
const meta = {
  title: 'Components/HoneySlider',
  component: HoneySlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'مؤشر تفاعلي لتحديد نسبة العسل في الإطار. يدعم السحب الأفقي، نقاط الالتصاق، والاهتزاز اللمسي.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'نسبة العسل (0-100%)',
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
} satisfies Meta<typeof HoneySlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * المؤشر الافتراضي بقيمة 50%
 */
export const Default: Story = {
  args: {
    value: 50,
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    snapPoints: [0, 25, 50, 75, 100],
    hapticFeedback: true,
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
    value: 60,
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
    value: 75,
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
    value: 65,
    onChange: () => {},
    color: '#FF6B6B',
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر بدون تسمية
 */
export const NoLabel: Story = {
  args: {
    value: 55,
    onChange: () => {},
    size: 'medium',
    showLabel: false,
  },
};

/**
 * مؤشر بدون نقاط التصاق
 */
export const NoSnapPoints: Story = {
  args: {
    value: 42,
    onChange: () => {},
    size: 'medium',
    showLabel: true,
    snapPoints: [],
  },
};

/**
 * مؤشر تفاعلي - يمكن تغيير القيمة
 */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(50);
    
    return (
      <div style={{ padding: '20px' }}>
        <HoneySlider
          {...args}
          value={value}
          onChange={setValue}
        />
        <div style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
          القيمة الحالية: {value}%
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
          <HoneySlider
            value={smallValue}
            onChange={setSmallValue}
            size="small"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            متوسط (Medium)
          </div>
          <HoneySlider
            value={mediumValue}
            onChange={setMediumValue}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontWeight: 'bold' }}>
            كبير (Large)
          </div>
          <HoneySlider
            value={largeValue}
            onChange={setLargeValue}
            size="large"
            showLabel={true}
          />
        </div>
      </div>
    );
  },
};

/**
 * حالات حدية - قيم قريبة من الحدود
 */
export const EdgeCases: Story = {
  render: () => {
    const [value1, setValue1] = useState(1);
    const [value2, setValue2] = useState(99);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial' }}>
            قيمة قريبة من الصفر: {value1}%
          </div>
          <HoneySlider
            value={value1}
            onChange={setValue1}
            size="medium"
            showLabel={true}
          />
        </div>
        
        <div>
          <div style={{ marginBottom: '10px', fontFamily: 'Arial' }}>
            قيمة قريبة من المئة: {value2}%
          </div>
          <HoneySlider
            value={value2}
            onChange={setValue2}
            size="medium"
            showLabel={true}
          />
        </div>
      </div>
    );
  },
};
