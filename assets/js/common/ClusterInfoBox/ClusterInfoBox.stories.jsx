// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { AWS_PROVIDER, providers } from '@lib/model';
import {
  ANGI_ARCHITECTURE,
  CLASSIC_ARCHITECTURE,
  clusterTypes,
  COST_OPT_SCENARIO,
  HANA_SCALE_UP,
  hanaClusterScenarioTypes,
} from '@lib/model/clusters';

import ClusterInfoBox from './ClusterInfoBox';

export default {
  title: 'Components/ClusterInfoBox',
  component: ClusterInfoBox,
  argTypes: {
    clusterType: {
      description: 'Type of the cluster',
      control: { type: 'select' },
      options: clusterTypes,
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    architectureType: {
      description: 'Type of cluster architecture',
      control: { type: 'select' },
      options: [CLASSIC_ARCHITECTURE, ANGI_ARCHITECTURE],
    },
    scaleUpScenario: {
      description: 'Scale up scenario',
      control: { type: 'select' },
      options: [...hanaClusterScenarioTypes, ''],
    },
  },
};

export const Default = {
  args: {
    clusterType: HANA_SCALE_UP,
    provider: AWS_PROVIDER,
    architectureType: CLASSIC_ARCHITECTURE,
    scaleUpScenario: COST_OPT_SCENARIO,
  },
};
