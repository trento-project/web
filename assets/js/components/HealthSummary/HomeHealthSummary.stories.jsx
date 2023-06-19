import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { healthSummaryFactory } from '@lib/test-utils/factories';

import HomeHealthSummary from './HomeHealthSummary';

const randomSummary = healthSummaryFactory.buildList(3);
const healthySummary = healthSummaryFactory.buildList(3, {
  clustersHealth: 'passing',
  databaseHealth: 'passing',
  hostsHealth: 'passing',
  sapsystemHealth: 'passing',
});
const unClusteredSummary = healthSummaryFactory.buildList(3, {
  clusterId: null,
  clustersHealth: 'unknown',
  databaseHealth: 'passing',
  hostsHealth: 'passing',
  sapsystemHealth: 'passing',
});

export default {
  title: 'HomeHealthSummary',
  components: HomeHealthSummary,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export const Random = {
  args: {
    sapSystemsHealth: randomSummary,
    loading: false,
  },
  render: (args) => (
    <ContainerWrapper>
      <HomeHealthSummary {...args} />
    </ContainerWrapper>
  ),
};

export const Healthy = {
  args: {
    ...Random.args,
    sapSystemsHealth: healthySummary,
  },
  render: (args) => (
    <ContainerWrapper>
      <HomeHealthSummary {...args} />
    </ContainerWrapper>
  ),
};

export const UnClustered = {
  args: {
    ...Random.args,
    sapSystemsHealth: unClusteredSummary,
  },
  render: (args) => (
    <ContainerWrapper>
      <HomeHealthSummary {...args} />
    </ContainerWrapper>
  ),
};
