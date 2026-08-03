// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ClusterStatePill from './ClusterStatePill';

export default {
  title: 'Components/ClusterStatePill',
  component: ClusterStatePill,
  argTypes: {
    state: {
      description: 'The cluster state',
      control: { type: 'select' },
      options: ['S_IDLE', 'S_TRANSITION_ENGINE', 'unknown', 'stopped'],
    },
  },
};

export const Default = {
  args: {
    state: 'S_IDLE',
  },
};

export const Transition = {
  args: {
    state: 'S_TRANSITION_ENGINE',
  },
};

export const Unknown = {
  args: {
    state: 'unknown',
  },
};

export const Stopped = {
  args: {
    state: 'stopped',
  },
};
