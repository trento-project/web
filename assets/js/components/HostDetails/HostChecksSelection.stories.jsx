import React from 'react';
import { faker } from '@faker-js/faker';
import { MemoryRouter } from 'react-router-dom';

import { catalogCheckFactory, hostFactory } from '@lib/test-utils/factories';
import HostChecksSelection from './HostChecksSelection';

const catalog = [
  ...catalogCheckFactory.buildList(3, { group: faker.animal.cat() }),
  ...catalogCheckFactory.buildList(6, { group: faker.animal.dog() }),
  ...catalogCheckFactory.buildList(2, { group: faker.lorem.word() }),
];

const selectedChecks = [
  catalog[0].id,
  catalog[1].id,
  catalog[2].id,
  catalog[5].id,
  catalog[6].id,
];

const host = hostFactory.build({
  provider: 'azure',
  selected_checks: selectedChecks,
});

export default {
  title: 'HostChecksSelection',
  component: HostChecksSelection,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    hostID: {
      control: 'string',
      description: 'The host identifier',
      table: {
        type: { summary: 'string' },
      },
    },
    hostName: {
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
    agentVersion: {
      control: 'string',
      description: 'The version of the installed agent',
      table: {
        type: { summary: 'string' },
      },
    },
    selectedChecks: {
      control: 'array',
      description: 'The check selection',
    },
    catalog: {
      control: 'object',
      description: 'Catalog data',
      table: {
        type: { summary: 'object' },
      },
    },
    catalogError: {
      control: 'text',
      description: 'Error occurred while loading the relevant checks catalog',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: null },
      },
    },
    catalogLoading: {
      control: { type: 'boolean' },
      description: 'Whether the catalog is loading',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    onUpdateCatalog: {
      description: 'Updates the catalog',
    },

    isSavingSelection: {
      description:
        'Whether Save Checks Selection button is enabled or disabled',
    },

    onSaveSelection: {
      description: 'Updates the selected checks on save',
    },
    onSelectedChecksChange: {
      description: 'Updates the selected checks',
    },
    hostChecksExecutionEnabled: {
      description: 'Whether start execution button is enabled or disabled',
    },
    onStartExecution: {
      description: 'Starts the host checks execution',
    },
  },
};

export const Default = {
  args: {
    hostID: host.id,
    hostName: host.hostname,
    provider: host.provider,
    agentVersion: host.agent_version,
    selectedChecks: host.selected_checks,
    catalog,
    catalogError: null,
    catalogLoading: false,
    isSavingSelection: false,
    hostChecksExecutionEnabled: false,
  },
};
