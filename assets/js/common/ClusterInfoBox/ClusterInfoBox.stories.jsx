import ClusterInfoBox from '.';
import { providers, AWS_PROVIDER } from '@lib/model';
import {
  clusterTypes,
  hanaClusterScenarioTypes,
  CLASSIC_ARCHITECTURE,
  ANGI_ARCHITECTURE,
  HANA_SCALE_UP,
  COST_OPT_SCENARIO,
} from '@lib/model/clusters';

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
