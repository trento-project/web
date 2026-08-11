// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { healthSummaryFactory } from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { faker } from '@faker-js/faker';

import HomeHealthSummary from './HomeHealthSummary';

const randomSummary = healthSummaryFactory.buildList(3);
const healthySummary = healthSummaryFactory.buildList(3, {
  application_cluster_health: 'passing',
  database_cluster_health: 'passing',
  application_health: 'passing',
  database_health: 'passing',
  hosts_health: 'passing',
  sapsystem_health: 'passing',
});
const unClusteredSummary = healthSummaryFactory.buildList(3, {
  application_cluster_id: null,
  database_cluster_id: null,
  application_cluster_health: 'unknown',
  database_cluster_health: 'unknown',
  application_health: 'passing',
  database_health: 'passing',
  hosts_health: 'passing',
  sapsystem_health: 'passing',
});
const staleSummary = healthSummaryFactory.buildList(3, {
  application_stale_at: faker.date.past(),
  database_stale_at: faker.date.past(),
  application_cluster_stale_at: faker.date.past(),
  database_cluster_stale_at: faker.date.past(),
  hosts_stale_at: faker.date.past(),
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
    sapSystemsHealth: [],
    loading: false,
  },
};

export const Healthy = {
  args: {
    sapSystemsHealth: healthySummary,
    loading: false,
  },
};

export const UnClustered = {
  args: {
    sapSystemsHealth: unClusteredSummary,
    loading: false,
  },
};

export const Stale = {
  args: {
    sapSystemsHealth: staleSummary,
    loading: false,
  },
};
