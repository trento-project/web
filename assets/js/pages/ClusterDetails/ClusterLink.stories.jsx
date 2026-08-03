// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import ClusterLink from './ClusterLink';

export default {
  title: 'Components/ClusterLink',
  component: ClusterLink,
  argTypes: {
    cluster: {
      description: 'Cluster object with id and name',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    cluster: {
      id: 'cluster_001',
      name: 'HANA-Cluster',
    },
  },
};

export const AnotherCluster = {
  args: {
    ...Default.args,
    cluster: {
      id: 'cluster_002',
      name: 'Corosync-Pacemaker',
    },
  },
};
