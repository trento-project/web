// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import AttributesDetails from './AttributesDetails';

export default {
  title: 'Components/AttributesDetails',
  component: AttributesDetails,
  argTypes: {
    attributes: {
      description: 'The attributes prop',
      control: { type: 'object' },
    },
    title: {
      description: 'Title text for the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    attributes: {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    },
    title: 'Cluster Attributes',
  },
};
