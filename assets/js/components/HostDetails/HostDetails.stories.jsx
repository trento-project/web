import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';
import HostDetails from './HostDetails';

const host = hostFactory.build({provider: "azure", agent_version: "2.0.0"});
const cluster = clusterFactory.build({ id: host.cluster_id });
const sapInstances = sapSystemApplicationInstanceFactory.buildList(2);

function ContainerWrapper({ children }) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
    );
  }

export default {
  title: 'HostDetails',
  component: HostDetails,
  argTypes: {
    agentVersion: {
      control: 'string',
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
    grafanaPublicUrl: {
      control: 'string',
      description: 'Grafana dashboard public URL',
      table: {
        type: { summary: 'string' },
      },
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
      control: 'string',
      description: 'The host identifier',
      table: {
        type: { summary: 'string' },
      },
    },
    hostname: {
      control: 'string',
      description: 'The host name',
      table: {
        type: { summary: 'string' },
      },
    },
    provider: {
      control: 'string',
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
    cleanUpHost: {
      action: 'Deregister host',
      description: 'Deregister host',
    },
    requestHostChecksExecution: {
      action: 'Request host execution',
      description: 'Request checks execution',
    },
    navigate: {
      description: 'Navagate function',
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
    cluster,
    deregisterable: false,
    deregistering: false,
    exportersStatus: {},
    grafanaPublicUrl: 'some-url',
    heartbeat: host.heartbeat,
    hostID: host.id,
    hostname: host.hostname,
    provider: host.provider,
    providerData: host.provider_data,
    sapInstances,
    savingChecks: false,
    selectedChecks: [],
    slesSubscriptions: host.sles_subscriptions,
  },
};

export const AgentWarning = {
  args: {
    ...Default.args,
    agentVersion: "1.0.0"
  },
};

export const Deregisterable = {
  args: {
    ...Default.args,
    deregisterable: true
  },
};

export const ChecksSelected = {
  args: {
    ...Default.args,
    selectedChecks: ["some-check"]
  },
};
