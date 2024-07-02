import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

import {
  clusterFactory,
  hostFactory,
  databaseInstanceFactory,
  sapSystemApplicationInstanceFactory,
  catalogFactory,
} from '@lib/test-utils/factories';
import HostDetails from './HostDetails';

const host = hostFactory.build({ provider: 'azure', agent_version: '2.0.0' });
const cluster = clusterFactory.build({ id: host.cluster_id });
const sapInstances = sapSystemApplicationInstanceFactory
  .buildList(1)
  .map((instance) => ({ ...instance, type: APPLICATION_TYPE }))
  .concat(
    databaseInstanceFactory
      .buildList(1)
      .map((instance) => ({ ...instance, type: DATABASE_TYPE }))
  );

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/HostDetails',
  component: HostDetails,
  argTypes: {
    agentVersion: {
      control: 'text',
      description: 'The version of the installed agent',
      table: {
        type: { summary: 'string' },
      },
    },
    cluster: {
      control: 'object',
      description: 'The cluster which this host belongs to',
    },
    deregisterable: {
      control: { type: 'boolean' },
      description: 'The host is in deregisterable state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    deregistering: {
      control: { type: 'boolean' },
      description: 'The host is in deregistering state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    exportersStatus: {
      control: 'object',
      description: 'Status of the prometheus exporters',
    },
    heartbeat: {
      control: { type: 'radio' },
      options: ['passing', 'critical'],
      description: 'Host heartbeat state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'passing' },
      },
    },
    hostID: {
      control: 'text',
      description: 'The host identifier',
      table: {
        type: { summary: 'string' },
      },
    },
    hostname: {
      control: 'text',
      description: 'The host name',
      table: {
        type: { summary: 'string' },
      },
    },
    ipAddresses: {
      control: { type: 'array' },
      description: 'IP addresses',
    },
    provider: {
      control: 'text',
      description: 'The discovered CSP where the host is running',
      table: {
        type: { summary: 'string' },
      },
    },
    providerData: {
      control: 'object',
      description: 'The discovered CSP data',
    },
    sapSystems: {
      control: { type: 'array' },
      description: 'SAP systems running on the host',
    },
    saptuneStatus: {
      control: 'object',
      description: 'Saptune status data',
    },
    savingChecks: {
      control: { type: 'boolean' },
      description: 'The checks are being saved',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    selectedChecks: {
      control: 'array',
      description: 'The selected checks',
    },
    slesSubscriptions: {
      control: { type: 'array' },
      description: 'Registered SLES subscriptions on the host',
    },
    catalog: {
      control: 'object',
      description: 'Catalog data',
    },
    lastExecution: {
      control: 'object',
      description: 'Last execution data',
    },
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    cleanUpHost: {
      action: 'Deregister host',
      description: 'Deregister host',
    },
    requestHostChecksExecution: {
      action: 'Request host execution',
      description: 'Request checks execution',
    },
    navigate: {
      description: 'Navigate function',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <HostDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    agentVersion: host.agent_version,
    chartsEnabled: false,
    cluster,
    deregisterable: false,
    deregistering: false,
    exportersStatus: {},
    heartbeat: host.heartbeat,
    hostID: host.id,
    hostname: host.hostname,
    ipAddresses: host.ip_addresses,
    provider: host.provider,
    providerData: host.provider_data,
    sapInstances,
    savingChecks: false,
    saptuneStatus: {
      package_version: '3.1.0',
      configured_version: '3',
      tuning_state: 'not tuned',
    },
    catalog: catalogFactory.build(),
    lastExecution: {
      data: {
        passing_count: faker.number.int(50),
        warning_count: faker.number.int(50),
        critical_count: faker.number.int(50),
        completed_at: faker.date.past().toISOString(),
      },
    },
    suseManagerEnabled: false,
    relevantPatches: 0,
    upgradablePackages: 0,
    softwareUpdatesLoading: false,
    softwareUpdatesTooltip: undefined,
    selectedChecks: [],
    slesSubscriptions: host.sles_subscriptions,
    userAbilities: [{ name: 'all', resource: 'all' }],
  },
};

export const Loading = {
  args: {
    ...Default.args,
    catalog: { loading: true },
  },
};

export const AgentWarning = {
  args: {
    ...Default.args,
    agentVersion: '1.0.0',
  },
};

export const Deregisterable = {
  args: {
    ...Default.args,
    deregisterable: true,
  },
};

export const CleanUpUnauthorized = {
  args: {
    ...Default.args,
    deregisterable: true,
    userAbilities: [],
  },
};

export const ChecksSelected = {
  args: {
    ...Default.args,
    selectedChecks: ['some-check'],
  },
};

export const SaptuneNotInstalled = {
  args: {
    ...Default.args,
    saptuneStatus: {
      package_version: null,
      configured_version: null,
      tuning_state: null,
    },
  },
};

export const SaptuneOldVersion = {
  args: {
    ...Default.args,
    saptuneStatus: {
      package_version: '3.0.0',
      configured_version: null,
      tuning_state: null,
    },
  },
};

export const WithoutLastExecutionData = {
  args: {
    ...Default.args,
    lastExecution: {},
  },
};

export const HostSummaryWithTooltip = {
  args: {
    ...Default.args,
    ipAddresses: Array.from({ length: 10 }, () => faker.internet.ipv4()),
  },
};

export const WithSuseManager = {
  args: {
    ...Default.args,
    suseManagerEnabled: true,
    relevantPatches: 123,
    upgradablePackages: 456,
  },
};

export const SuseManagerLoading = {
  args: {
    ...Default.args,
    suseManagerEnabled: true,
    softwareUpdatesLoading: true,
  },
};

export const SuseManagerUnknown = {
  args: {
    ...Default.args,
    suseManagerEnabled: true,
    relevantPatches: undefined,
    upgradablePackages: undefined,
    softwareUpdatesTooltip:
      'SUSE Manager was not able to retrieve the requested data',
  },
};
