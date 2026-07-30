// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { objectTreeFactory } from '@lib/test-utils/factories';
import React from 'react';

import ObjectTree from './ObjectTree';

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
    ...Default.args,
    data: objectTreeFactory.build({ empty_array: [], empty_object: {} }),
    className: '',
  },
};
