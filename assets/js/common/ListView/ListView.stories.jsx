import React from 'react';

import ListView from '.';

export default {
  title: 'Components/ListView',
  component: ListView,
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    className: {
      description: "Additional CSS classes applied to the list view container"
    },
    data: {
      description: "Array of objects containing title, content, and rendering configuration for each list item"
    },
    titleClassName: {
      description: "CSS classes applied to individual item titles"
    }
  },
  args: {
    orientation: 'horizontal',
    className: '',
    titleClassName: '',
  },
};

export function Default(args) {
  return (
    <ListView
      data={[
        { title: 'Hostname', content: 'vmhdbdev01' },
        { title: 'Cluster', content: 'hana_cluster_1' },
        { title: 'SID', content: 'HDD' },
      ]}
      {...args}
    />
  );
}
