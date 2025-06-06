import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import {
  SAPTUNE_SOLUTION_APPLY,
  SAPTUNE_SOLUTION_CHANGE,
} from '@lib/operations';

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
    arch: {
      control: 'text',
      description: 'The architecture of the host',
      table: {
        type: { summary: 'string' },
      },
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
    netmasks: {
      control: { type: 'array' },
      description: 'Netmasks associated to ip addresses',
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
    operationsEnabled: {
      control: { type: 'boolean' },
      description:
        'Operations framework enabled. Remove once it is ready to release',
    },
    runningOperation: {
      control: 'object',
      description: 'Currently running operation data',
    },
    cleanUpHost: {
      action: 'Deregister host',
      description: 'Deregister host',
    },
    requestHostChecksExecution: {
      action: 'Request host execution',
      description: 'Request checks execution',
    },
    requestOperation: {
      action: 'Request operation',
      description: 'Request operation',
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
    arch: host.arch,
    chartsEnabled: false,
    cluster,
    deregisterable: false,
    deregistering: false,
    exportersStatus: {},
    heartbeat: host.heartbeat,
    hostID: host.id,
    hostname: host.hostname,
    ipAddresses: host.ip_addresses,
    netmasks: host.netmasks,
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
    relevantPatches: 0,
    upgradablePackages: 0,
    softwareUpdatesLoading: false,
    softwareUpdatesTooltip: undefined,
    selectedChecks: [],
    slesSubscriptions: host.sles_subscriptions,
    userAbilities: [{ name: 'all', resource: 'all' }],
    operationsEnabled: true,
    runningOperations: {},
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
    netmasks: Array.from({ length: 10 }, () =>
      faker.helpers.arrayElement([8, 16, 24, 32])
    ),
  },
};

export const WithSotwareUpdates = {
  args: {
    ...Default.args,
    softwareUpdatesSettingsSaved: true,
    softwareUpdatesLoading: false,
    relevantPatches: 123,
    upgradablePackages: 456,
  },
};

export const WithSoftwareUpdatesLoading = {
  args: {
    ...Default.args,
    softwareUpdatesLoading: true,
  },
};

export const WithSoftwareUpdatesFailed = {
  args: {
    ...Default.args,
    softwareUpdatesSettingsSaved: true,
    relevantPatches: undefined,
    upgradablePackages: undefined,
    softwareUpdatesErrorMessage: 'Connection to SUMA not working',
    softwareUpdatesTooltip: 'Please review SUSE Manager settings',
  },
};

export const WithRunningOperation = {
  args: {
    ...Default.args,
    runningOperation: {
      operation: faker.helpers.arrayElement([
        SAPTUNE_SOLUTION_APPLY,
        SAPTUNE_SOLUTION_CHANGE,
      ]),
    },
  },
};

export const WithDisabledOperation = {
  args: {
    ...Default.args,
    saptuneStatus: {
      package_version: '3.0.0',
      enabled_solution: 'HANA',
    },
  },
};

export const WithForbiddenOperation = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
