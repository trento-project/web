import React from 'react';

import ListView from './ListView';

export default {
  title: 'Components/ListView',
  component: ListView,
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    className: {
      description: 'Additional CSS classes applied to the list view container',
      control: { type: 'text' },
    },
    data: {
      description:
        'Array of objects containing title, content, and rendering configuration for each list item',
      control: { type: 'object' },
    },
    titleClassName: {
      description: 'CSS classes applied to individual item titles',
      control: { type: 'text' },
    },
  },
  args: {
    orientation: 'horizontal',
    className: '',
    titleClassName: '',
  },
};

export const Default = {
  args: {
    data: [
      { title: 'Hostname', content: 'vmhdbdev01' },
      { title: 'Cluster', content: 'hana_cluster_1' },
      { title: 'SID', content: 'HDD' },
    ],
    orientation: 'horizontal',
    className: '',
    titleClassName: '',
  },
};

export const Vertical = {
  args: {
    ...Default.args,
    orientation: 'vertical',
  },
};
