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

const host = hostFactory.build({ provider: 'azure' });

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
    host: {
      control: 'object',
      description: 'The host for which to select checks',
      table: {
        type: { summary: 'object' },
      },
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
      description: 'Error occurred while loading che relevant checks catalog',
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
      action: 'Update catalog',
      description: 'Called on mount to load the catalog for the host.',
    },
  },
};

export const Default = {
  args: {
    host: { ...host, selected_checks: selectedChecks },
    catalog,
    catalogError: null,
    catalogLoading: false,
    onUpdateCatalog: () => {},
  },
};
