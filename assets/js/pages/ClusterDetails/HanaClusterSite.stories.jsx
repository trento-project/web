import {
  abilityFactory,
  clusterResourceFactory,
  hanaClusterDetailsNodesFactory,
} from '@lib/test-utils/factories';

import HanaClusterSite from './HanaClusterSite';

const resources = clusterResourceFactory.buildList(2);
const nodes = hanaClusterDetailsNodesFactory.buildList(3, { resources });
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/HanaClusterSite',
  component: HanaClusterSite,
  argTypes: {
    name: {
      description: 'Name or label for the component',
      control: { type: 'text' },
    },
    nodes: {
      description: 'The nodes prop',
      control: { type: 'object' },
    },
    state: {
      description: 'The state prop',
      control: { type: 'text' },
    },
    srHealthState: {
      description: 'The srHealthState prop',
      control: { type: 'text' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    getClusterHostOperations: {
      description: 'The getClusterHostOperations prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    name: 'Site 1',
    nodes,
    state: 'primary',
    srHealthState: '4',
    userAbilities: [allAbility],
    getClusterHostOperations: () => [],
  },
};

export const Empty = {
  args: {
    ...Default.args,
    nodes: [],
  },
};
