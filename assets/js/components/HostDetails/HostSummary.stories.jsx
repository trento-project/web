import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import { CLUSTER_TYPES } from '@lib/model';
import HostSummary from './HostSummary';

const clusterType = CLUSTER_TYPES[0];
export default {
  title: 'Components/HostSummary',
  component: HostSummary,
  argTypes: {
    agentVersion: {
      control: 'text',
      description: 'The version of the agent',
    },
    cluster: {
      control: 'object',
      description: 'Cluster information',
    },
    ipAddresses: {
      control: 'array',
      description: 'Array of IP addresses',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  args: {
    agentVersion: faker.system.semver(),
    cluster: {
      name: faker.person.zodiacSign(),
    },
    ipAddresses: [faker.internet.ipv4(), faker.internet.ipv4()],
  },
};

export const ManyIpAddressesWithTooltip = {
  args: {
    ...Default.args,
    ipAddresses: Array.from({ length: 10 }, () => faker.internet.ipv4()),
  },
};

export const WithLink = {
  args: {
    ...Default.args,
    cluster: {
      name: faker.person.zodiacSign(),
      type: clusterType,
      id: faker.string.uuid(),
    },
  },
};

export const WithLinkAndTooltip = {
  args: {
    ...WithLink.args,
    ipAddresses: Array.from({ length: 10 }, () => faker.internet.ipv4()),
  },
};
