// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  ANGI_ARCHITECTURE,
  CLASSIC_ARCHITECTURE,
  clusterTypes,
  HANA_SCALE_UP,
  hanaClusterScenarioTypes,
  PERFORMANCE_SCENARIO,
} from '@lib/model/clusters';

import ClusterTypeLabel from './ClusterTypeLabel';

export default {
  title: 'Components/ClusterTypeLabel',
  component: ClusterTypeLabel,
  argTypes: {
    clusterType: {
      description: 'Type of the cluster',
      control: { type: 'select' },
      options: clusterTypes,
    },
    clusterScenario: {
      description: 'Cluster deployment scenario',
      control: { type: 'select' },
      options: hanaClusterScenarioTypes,
    },
    architectureType: {
      description: 'Type of cluster architecture',
      control: { type: 'select' },
      options: [CLASSIC_ARCHITECTURE, ANGI_ARCHITECTURE],
    },
  },
};

export const Default = {
  args: {
    clusterType: HANA_SCALE_UP,
    clusterScenario: PERFORMANCE_SCENARIO,
    architectureType: CLASSIC_ARCHITECTURE,
  },
};
