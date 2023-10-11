import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { healthSummaryFactory } from '@lib/test-utils/factories';

import HomeHealthSummary from './HomeHealthSummary';

const randomSummary = healthSummaryFactory.buildList(3);
const healthySummary = healthSummaryFactory.buildList(3, {
  applicationClusterHealth: 'passing',
  databaseClusterHealth: 'passing',
  databaseHealth: 'passing',
  hostsHealth: 'passing',
  sapsystemHealth: 'passing',
});
const unClusteredSummary = healthSummaryFactory.buildList(3, {
  applicationClusterId: null,
  databaseClusterId: null,
  applicationClusterHealth: 'unknown',
  databaseClusterHealth: 'unknown',
  databaseHealth: 'passing',
  hostsHealth: 'passing',
  sapsystemHealth: 'passing',
});

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/HomeHealthSummary',
  components: HomeHealthSummary,
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
