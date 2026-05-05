import { clusterFactory, hostFactory } from '@lib/test-utils/factories';

import TargetInfoBox from './TargetInfoBox';

const cluster = clusterFactory.build({
  provider: 'aws',
  type: 'hana_scale_up',
  details: {
    architecture_type: 'classic',
    hana_scenario: 'performance_optimized',
  },
});
const host = hostFactory.build({ cluster_id: cluster.id });

export default {
  title: 'Components/TargetInfoBox',
  component: TargetInfoBox,
  argTypes: {
    targetType: {
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
    },
    target: {
      description: 'Target object with id, name, and other properties',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    targetType: 'host',
    target: host,
  },
};

export const Cluster = {
  args: {
    targetType: 'cluster',
    target: cluster,
  },
};
