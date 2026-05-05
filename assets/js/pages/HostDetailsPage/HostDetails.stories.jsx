import { faker } from '@faker-js/faker';
import { architectures, providers } from '@lib/model';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import {
  SAPTUNE_SOLUTION_APPLY,
  SAPTUNE_SOLUTION_CHANGE,
} from '@lib/operations';
import {
  abilityFactory,
  catalogFactory,
  clusterFactory,
  databaseInstanceFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import HostDetails from './HostDetails';

const host = hostFactory.build({ provider: 'azure', agent_version: '2.0.0' });
const cluster = clusterFactory.build({ id: host.cluster_id });
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
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
      control: { type: 'text' },
      description: 'The version of the installed agent',
    },
    cluster: {
      control: { type: 'object' },
      description: 'The cluster which this host belongs to',
    },
    arch: {
      control: { type: 'select' },
      options: architectures,
      description: 'The architecture of the host',
    },
    deregisterable: {
      control: { type: 'boolean' },
      description: 'The host is in deregisterable state',
    },
    deregistering: {
      control: { type: 'boolean' },
      description: 'The host is in deregistering state',
    },
    exportersStatus: {
      control: { type: 'object' },
      description: 'Status of the prometheus exporters',
    },
    heartbeat: {
      control: { type: 'radio' },
      options: ['passing', 'critical'],
      description: 'Host heartbeat state',
    },
    hostID: {
      control: { type: 'text' },
      description: 'The host identifier',
    },
    hostname: {
      control: { type: 'text' },
      description: 'The host name',
    },
    ipAddresses: {
      control: { type: 'object' },
      description: 'IP addresses',
    },
    netmasks: {
      control: { type: 'object' },
      description: 'Netmasks associated to ip addresses',
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    providerData: {
      control: { type: 'object' },
      description: 'The discovered CSP data',
    },
    saptuneStatus: {
      control: { type: 'object' },
      description: 'Saptune status data',
    },
    savingChecks: {
      control: { type: 'boolean' },
      description: 'The checks are being saved',
    },
    selectedChecks: {
      control: { type: 'object' },
      description: 'The selected checks',
    },
    slesSubscriptions: {
      control: { type: 'object' },
      description: 'Registered SLES subscriptions on the host',
    },
    catalog: {
      control: { type: 'object' },
      description: 'Catalog data',
    },
    lastExecution: {
      control: { type: 'object' },
      description: 'Last execution data',
    },
    userAbilities: {
      control: { type: 'object' },
      description: 'Current user abilities',
    },
    operationsEnabled: {
      control: { type: 'boolean' },
      description:
        'Operations framework enabled. Remove once it is ready to release',
    },
    runningOperation: {
      control: { type: 'object' },
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
      action: 'navigate',
    },
    chartsEnabled: {
      description:
        'Whether to render system performance charts (CPU, memory, disk space)',
      control: { type: 'boolean' },
    },
    lastBootTimestamp: {
      description: 'Timestamp of when the host was last rebooted',
      control: { type: 'text' },
    },
    sapInstances: {
      description:
        'List of SAP application and database instances running on the host',
      control: { type: 'object' },
    },
    relevantPatches: {
      description: 'Patches available for installation on the host',
      control: { type: 'number' },
    },
    upgradablePackages: {
      description: 'Packages on the host that have newer versions available',
      control: { type: 'number' },
    },
    softwareUpdatesLoading: {
      description: 'Whether software update data is currently being loaded',
      control: { type: 'boolean' },
    },
    softwareUpdatesSettingsSaved: {
      description:
        "Whether the host's software update settings have been saved",
      control: { type: 'boolean' },
    },
    softwareUpdatesErrorMessage: {
      description: 'Error message displayed when software updates fail',
      control: { type: 'text' },
    },
    softwareUpdatesTooltip: {
      description:
        'Tooltip text providing additional information about software updates',
      control: { type: 'text' },
    },
    cleanForbiddenOperation: {
      description:
        'Callback function to close the operation forbidden error modal',
      action: 'Clean forbidden operation',
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
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
    cleanUpHost: action('cleanUpHost'),
    cleanForbiddenOperation: action('cleanForbiddenOperation'),
    cluster,
    deregisterable: false,
    deregistering: false,
    exportersStatus: {},
    heartbeat: host.heartbeat,
    hostID: host.id,
    hostname: host.hostname,
    ipAddresses: host.ip_addresses,
    navigate: action('navigate'),
    netmasks: host.netmasks,
    provider: host.provider,
    providerData: host.provider_data,
    requestHostChecksExecution: action('requestHostChecksExecution'),
    requestOperation: action('requestOperation'),
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
    userAbilities: [allAbility],
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
    hostname: 'my-host.example.com',
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

export const WithRebootEnabled = {
  args: {
    ...Default.args,
    operationsEnabled: true,
    sapInstances: sapInstances.map((instance) => ({
      ...instance,
      health: 'unknown',
    })),
    cluster: undefined,
    heartbeat: 'passing',
  },
};
