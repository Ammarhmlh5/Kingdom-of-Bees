import type { Meta, StoryObj } from '@storybook/react';
import { BeeBreadSlider } from './BeeBreadSlider';
import { useState } from 'react';

/**
 * مؤشر خبز النحل - مكون تفاعلي لتحديد نسبة خبز النحل في الإطار
 * 
 * يظهر على الجانب الأيسر من الإطار ويدعم السحب العمودي
 * مع تدرج لوني من الفاتح إلى الداكن حسب النسبة
 */
const meta = {
  title: 'Components/BeeBreadSlider',
  component: BeeBreadSlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'مؤشر تفاعلي لتحديد نسبة خبز النحل في الإطار. يدعم السحب العمودي، نقاط الالتصاق، والاهتزاز اللمسي.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'نسبة خبز النحل (0-100%)',
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
} satisfies Meta<typeof BeeBreadSlider>;

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
    value: 35,
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
    value: 65,
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
    value: 55,
    onChange: () => {},
    color: '#10B981',
    size: 'medium',
    showLabel: true,
  },
};

/**
 * مؤشر بدون تسمية
 */
export const NoLabel: Story = {
  args: {
    value: 45,
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
    value: 38,
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
      <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <BeeBreadSlider
          {...args}
          value={value}
          onChange={setValue}
        />
        <div style={{ fontFamily: 'Arial' }}>
          <div>القيمة الحالية: {value}%</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            اسحب من الأسفل للأعلى لزيادة النسبة
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
 * مقارنة الأحجام المختلفة
 */
export const SizeComparison: Story = {
  render: () => {
    const [smallValue, setSmallValue] = useState(30);
    const [mediumValue, setMediumValue] = useState(50);
    const [largeValue, setLargeValue] = useState(70);
    
    return (
      <div style={{ display: 'flex', gap: '40px', padding: '20px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={smallValue}
            onChange={setSmallValue}
            size="small"
            showLabel={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            صغير (Small)
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={mediumValue}
            onChange={setMediumValue}
            size="medium"
            showLabel={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            متوسط (Medium)
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={largeValue}
            onChange={setLargeValue}
            size="large"
            showLabel={true}
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
 * حالات حدية - قيم قريبة من الحدود
 */
export const EdgeCases: Story = {
  render: () => {
    const [value1, setValue1] = useState(1);
    const [value2, setValue2] = useState(99);
    
    return (
      <div style={{ display: 'flex', gap: '40px', padding: '20px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={value1}
            onChange={setValue1}
            size="medium"
            showLabel={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            قيمة قريبة من الصفر: {value1}%
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={value2}
            onChange={setValue2}
            size="medium"
            showLabel={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            قيمة قريبة من المئة: {value2}%
          </div>
        </div>
      </div>
    );
  },
};

/**
 * مقارنة التدرج اللوني عند قيم مختلفة
 */
export const ColorGradient: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', gap: '30px', padding: '20px', alignItems: 'flex-end' }}>
        {[0, 25, 50, 75, 100].map((value) => (
          <div key={value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <BeeBreadSlider
              value={value}
              onChange={() => {}}
              size="medium"
              showLabel={true}
            />
            <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
              {value}%
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * مؤشرات متعددة - محاكاة استخدام في إطار حقيقي
 */
export const MultipleSliders: Story = {
  render: () => {
    const [value1, setValue1] = useState(20);
    const [value2, setValue2] = useState(40);
    const [value3, setValue3] = useState(60);
    
    return (
      <div style={{ display: 'flex', gap: '50px', padding: '20px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={value1}
            onChange={setValue1}
            size="medium"
            showLabel={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            الجانب الأيسر: {value1}%
          </div>
        </div>
        
        <div style={{ 
          width: '200px', 
          height: '300px', 
          border: '2px solid #ccc', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial',
          color: '#999'
        }}>
          الإطار
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <BeeBreadSlider
            value={value2}
            onChange={setValue2}
            size="medium"
            showLabel={true}
          />
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            الجانب الأيمن: {value2}%
          </div>
        </div>
      </div>
    );
  },
};
