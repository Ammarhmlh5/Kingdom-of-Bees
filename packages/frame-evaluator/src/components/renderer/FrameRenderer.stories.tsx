/**
 * قصص Storybook لمكون FrameRenderer
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FrameRenderer } from './FrameRenderer';
import { FrameData, BroodAge } from '../../types';

const meta: Meta<typeof FrameRenderer> = {
  title: 'Components/FrameRenderer',
  component: FrameRenderer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'مكون عرض الإطار - يرسم الإطار بصرياً مع دعم الرسوم المتحركة',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number', min: 200, max: 800, step: 50 },
      description: 'عرض الإطار بالبكسل',
    },
    height: {
      control: { type: 'number', min: 300, max: 1000, step: 50 },
      description: 'ارتفاع الإطار بالبكسل',
    },
    animated: {
      control: 'boolean',
      description: 'تفعيل الرسوم المتحركة',
    },
    animationDuration: {
      control: { type: 'number', min: 100, max: 1000, step: 100 },
      description: 'مدة الرسوم المتحركة بالمللي ثانية',
    },
    cellSize: {
      control: { type: 'number', min: 5, max: 20, step: 1 },
      description: 'حجم الخلية السداسية',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FrameRenderer>;

// البيانات الافتراضية
const defaultData: FrameData = {
  side: 'A',
  honeyPercentage: 30,
  broodPercentage: 40,
  beeBreadPercentage: 20,
  emptyPercentage: 10,
  broodAge: 'MIXED',
  isValid: true,
};

/**
 * القصة الأساسية
 */
export const Default: Story = {
  args: {
    data: defaultData,
    width: 400,
    height: 600,
    animated: true,
    animationDuration: 300,
    cellSize: 10,
  },
};

/**
 * إطار مليء بالعسل
 */
export const FullHoney: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 90,
      broodPercentage: 5,
      beeBreadPercentage: 5,
      emptyPercentage: 0,
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * إطار مليء بالحضنة
 */
export const FullBrood: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 5,
      broodPercentage: 85,
      beeBreadPercentage: 10,
      emptyPercentage: 0,
      broodAge: 'CAPPED',
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * إطار فارغ
 */
export const Empty: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 0,
      broodPercentage: 0,
      beeBreadPercentage: 0,
      emptyPercentage: 100,
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * إطار متوازن
 */
export const Balanced: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 33,
      broodPercentage: 33,
      beeBreadPercentage: 34,
      emptyPercentage: 0,
      broodAge: 'MIXED',
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * حضنة بيض
 */
export const EggsBrood: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 20,
      broodPercentage: 60,
      beeBreadPercentage: 15,
      emptyPercentage: 5,
      broodAge: 'EGGS',
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * حضنة يرقات صغيرة
 */
export const YoungLarvaeBrood: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 20,
      broodPercentage: 60,
      beeBreadPercentage: 15,
      emptyPercentage: 5,
      broodAge: 'YOUNG_LARVAE',
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * حضنة مغلقة
 */
export const CappedBrood: Story = {
  args: {
    data: {
      ...defaultData,
      honeyPercentage: 20,
      broodPercentage: 60,
      beeBreadPercentage: 15,
      emptyPercentage: 5,
      broodAge: 'CAPPED',
    },
    width: 400,
    height: 600,
    animated: false,
  },
};

/**
 * أحجام مختلفة
 */
export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <h3>صغير (300x450)</h3>
        <FrameRenderer data={defaultData} width={300} height={450} animated={false} />
      </div>
      <div>
        <h3>متوسط (400x600)</h3>
        <FrameRenderer data={defaultData} width={400} height={600} animated={false} />
      </div>
      <div>
        <h3>كبير (500x750)</h3>
        <FrameRenderer data={defaultData} width={500} height={750} animated={false} />
      </div>
    </div>
  ),
};

/**
 * مع الرسوم المتحركة
 */
export const WithAnimation: Story = {
  render: () => {
    const [data, setData] = useState<FrameData>(defaultData);

    const changeData = () => {
      setData({
        ...data,
        honeyPercentage: Math.random() * 60 + 10,
        broodPercentage: Math.random() * 60 + 10,
        beeBreadPercentage: Math.random() * 30 + 5,
        emptyPercentage: 0,
      });
    };

    return (
      <div>
        <FrameRenderer 
          data={data} 
          width={400} 
          height={600} 
          animated={true}
          animationDuration={500}
        />
        <button 
          onClick={changeData}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          تغيير البيانات
        </button>
      </div>
    );
  },
};

/**
 * مع معالج النقر
 */
export const WithClickHandler: Story = {
  render: () => {
    const [clickedLayer, setClickedLayer] = useState<string>('');

    return (
      <div>
        <FrameRenderer 
          data={defaultData} 
          width={400} 
          height={600} 
          animated={false}
          onLayerClick={(layer) => setClickedLayer(layer)}
        />
        {clickedLayer && (
          <div style={{ marginTop: '20px', fontSize: '18px' }}>
            تم النقر على طبقة: <strong>{clickedLayer}</strong>
          </div>
        )}
      </div>
    );
  },
};

/**
 * مقارنة أعمار الحضنة
 */
export const BroodAgeComparison: Story = {
  render: () => {
    const broodAges: BroodAge[] = ['EGGS', 'YOUNG_LARVAE', 'OLD_LARVAE', 'CAPPED', 'MIXED'];
    
    return (
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {broodAges.map(age => (
          <div key={age}>
            <h3>{age}</h3>
            <FrameRenderer 
              data={{
                ...defaultData,
                broodPercentage: 60,
                broodAge: age,
              }} 
              width={300} 
              height={450} 
              animated={false}
            />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * تفاعلي - تحكم كامل
 */
export const Interactive: Story = {
  render: () => {
    const [data, setData] = useState<FrameData>(defaultData);

    return (
      <div style={{ display: 'flex', gap: '40px' }}>
        <FrameRenderer 
          data={data} 
          width={400} 
          height={600} 
          animated={true}
          animationDuration={300}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>
              العسل: {data.honeyPercentage}%
              <input
                type="range"
                min="0"
                max="100"
                value={data.honeyPercentage}
                onChange={(e) => setData({
                  ...data,
                  honeyPercentage: Number(e.target.value),
                  emptyPercentage: 100 - (Number(e.target.value) + data.broodPercentage + data.beeBreadPercentage),
                })}
                style={{ width: '200px', marginLeft: '10px' }}
              />
            </label>
          </div>
          <div>
            <label>
              الحضنة: {data.broodPercentage}%
              <input
                type="range"
                min="0"
                max="100"
                value={data.broodPercentage}
                onChange={(e) => setData({
                  ...data,
                  broodPercentage: Number(e.target.value),
                  emptyPercentage: 100 - (data.honeyPercentage + Number(e.target.value) + data.beeBreadPercentage),
                })}
                style={{ width: '200px', marginLeft: '10px' }}
              />
            </label>
          </div>
          <div>
            <label>
              خبز النحل: {data.beeBreadPercentage}%
              <input
                type="range"
                min="0"
                max="100"
                value={data.beeBreadPercentage}
                onChange={(e) => setData({
                  ...data,
                  beeBreadPercentage: Number(e.target.value),
                  emptyPercentage: 100 - (data.honeyPercentage + data.broodPercentage + Number(e.target.value)),
                })}
                style={{ width: '200px', marginLeft: '10px' }}
              />
            </label>
          </div>
          <div>
            <label>
              عمر الحضنة:
              <select
                value={data.broodAge}
                onChange={(e) => setData({ ...data, broodAge: e.target.value as BroodAge })}
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value="EGGS">بيض</option>
                <option value="YOUNG_LARVAE">يرقات صغيرة</option>
                <option value="OLD_LARVAE">يرقات كبيرة</option>
                <option value="CAPPED">مغلقة</option>
                <option value="MIXED">مختلطة</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  },
};
