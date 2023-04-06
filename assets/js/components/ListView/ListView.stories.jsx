import React from 'react';

import ListView from '.';

export default {
  title: 'ListView',
  component: ListView,
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
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
