import React from 'react';

import Tags from '.';

export default {
  title: 'Tags',
  component: Tags,
  argTypes: { onChange: { action: 'tag changed' } },
};

export function Populated(args) {
  return <Tags tags={['carbonara', 'Amatriciana']} {...args} />;
}

export function Empty(args) {
  return <Tags tags={[]} {...args} />;
}
