import React from 'react';

import { objectTreeFactory } from '@lib/test-utils/factories';

import ObjectTree from '.';

export default {
  title: 'ObjectTree',
  component: ObjectTree,
};

export function Normal(args) {
  return <ObjectTree data={objectTreeFactory.build()} {...args} />;
}
