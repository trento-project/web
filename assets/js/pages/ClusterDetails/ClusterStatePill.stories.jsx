// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ClusterStatePill from './ClusterStatePill';

export default {
  title: 'Components/ClusterStatePill',
  component: ClusterStatePill,
  argTypes: {
    state: {
      description: 'The state prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    state: '',
  },
};
