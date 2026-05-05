import React from 'react';

import { objectTreeFactory } from '@lib/test-utils/factories';

import ObjectTree from '.';

export default {
  title: 'Components/ObjectTree',
  component: ObjectTree,
  argTypes: {
    data: {
      description: 'The object to display as a tree',
      control: { type: 'object' },
    },
    className: {
      description: 'Optional CSS class for the tree container',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    data: {},
    className: '',
  },
};

export const Normal = {
  args: {
    data: objectTreeFactory.build({ empty_array: [], empty_object: {} }),
    className: '',
  },
};
