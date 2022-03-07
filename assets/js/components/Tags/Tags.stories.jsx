import React from 'react';

import Tags from './';

export default {
  title: 'Tags',
  component: Tags,
  argTypes: { onChange: { action: 'tag changed' } },
};

export const Populated = (args) => (
  <Tags tags={['carbonara', 'Amatriciana']} {...args} />
);

export const Empty = (args) => <Tags tags={[]} {...args} />;
