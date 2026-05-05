import { healthSummaryFactory } from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';

import HomeHealthSummary from './HomeHealthSummary';

const randomSummary = healthSummaryFactory.buildList(3);
const healthySummary = healthSummaryFactory.buildList(3, {
  application_cluster_health: 'passing',
  database_cluster_health: 'passing',
  database_health: 'passing',
  hosts_health: 'passing',
  sapsystem_health: 'passing',
});
const unClusteredSummary = healthSummaryFactory.buildList(3, {
  application_cluster_id: null,
  database_cluster_id: null,
  application_cluster_health: 'unknown',
  database_cluster_health: 'unknown',
  database_health: 'passing',
  hosts_health: 'passing',
  sapsystem_health: 'passing',
});

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/HomeHealthSummary',
  component: HomeHealthSummary,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <HomeHealthSummary {...args} />
    </ContainerWrapper>
  ),
  argTypes: {
    sapSystemsHealth: {
      description: 'Health summary of SAP systems',
      control: { type: 'object' },
    },
    loading: {
      description: 'Loading state of the health summary',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    sapSystemsHealth: healthSummaryFactory.buildList(3),
    loading: false,
  },
};

export const Random = {
  args: {
    sapSystemsHealth: randomSummary,
    loading: false,
  },
};

export const Empty = {
  args: {
    ...Random.args,
    sapSystemsHealth: [],
  },
};

export const Healthy = {
  args: {
    ...Random.args,
    sapSystemsHealth: healthySummary,
  },
};

export const UnClustered = {
  args: {
    ...Random.args,
    sapSystemsHealth: unClusteredSummary,
  },
};
