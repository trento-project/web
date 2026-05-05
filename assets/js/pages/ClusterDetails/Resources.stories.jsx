import { clusterResourceFactory } from '@lib/test-utils/factories';

import Resources from './Resources';

export default {
  title: 'Components/Resources',
  component: Resources,
  argTypes: {
    resources: {
      description: 'The resources prop',
      control: { type: 'object' },
    },
    hosts: {
      description: 'The hosts prop',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    operationsDisabled: {
      description: 'The operationsDisabled prop',
      control: { type: 'text' },
    },
    getResourceOperations: {
      description: 'The getResourceOperations prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    resources: clusterResourceFactory.buildList(5, { parent: null }),
    hosts: [],
    userAbilities: [],
    operationsDisabled: false,
    getResourceOperations: () => [],
  },
};
