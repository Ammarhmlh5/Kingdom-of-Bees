import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ComparisonView } from './ComparisonView';
import { FrameData } from '../../types';

const meta: Meta<typeof ComparisonView> = {
  title: 'Components/ComparisonView',
  component: ComparisonView,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ComparisonView>;

const oldData: FrameData = {
  honeyPercentage: 25,
  broodPercentage: 45,
  beeBreadPercentage: 12,
  emptyPercentage: 18,
  broodAge: 'mixed',
};

const newData: FrameData = {
  honeyPercentage: 35,
  broodPercentage: 40,
  beeBreadPercentage: 10,
  emptyPercentage: 15,
  broodAge: 'mixed',
};

export const Default: Story = {
  args: {
    leftData: oldData,
    rightData: newData,
  },
};

export const WithCustomLabels: Story = {
  args: {
    leftData: oldData,
    rightData: newData,
    leftLabel: 'الأسبوع الماضي',
    rightLabel: 'هذا الأسبوع',
  },
};

export const WithoutDifferences: Story = {
  args: {
    leftData: oldData,
    rightData: newData,
    showDifferences: false,
  },
};

export const WithCloseButton: Story = {
  args: {
    leftData: oldData,
    rightData: newData,
    onClose: () => alert('Closed!'),
  },
};

export const SignificantChanges: Story = {
  args: {
    leftData: {
      honeyPercentage: 20,
      broodPercentage: 50,
      beeBreadPercentage: 15,
      emptyPercentage: 15,
      broodAge: 'mixed',
    },
    rightData: {
      honeyPercentage: 45,
      broodPercentage: 30,
      beeBreadPercentage: 8,
      emptyPercentage: 17,
      broodAge: 'eggs',
    },
  },
};
