import React from 'react';
import { MemoryRouter } from 'react-router';

import { catalogCheckFactory } from '@lib/test-utils/factories';
import ChecksCatalog from './ChecksCatalog';

const groupName1 = 'group 1';
const groupName2 = 'group 2';
const groupName3 = 'group 3';

const clusterCheck = catalogCheckFactory.build({
  group: groupName1,
  metadata: { target_type: 'cluster', cluster_type: 'hana_scale_up' },
});

const hostCheck = catalogCheckFactory.build({
  group: groupName1,
  metadata: { target_type: 'host' },
});

const group1 = [
  clusterCheck,
  hostCheck,
  ...catalogCheckFactory.buildList(1, { group: groupName1 }),
];

const group2 = catalogCheckFactory.buildList(2, { group: groupName2 });
const group3 = catalogCheckFactory.buildList(2, { group: groupName3 });
const catalogData = [...group1, ...group2, ...group3];

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/ChecksCatalog',
  component: ChecksCatalog,
  argTypes: {
    completeCatalog: {
      control: 'object',
      description: 'The whole Catalog content',
    },
    filteredCatalog: {
      control: 'object',
      description: 'The filtered Catalog content',
    },
    catalogError: {
      control: 'text',
      description: 'Error message getting catalog data',
      table: {
        type: { summary: 'string' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Catalog data is being loaded',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    updateCatalog: {
      action: 'Update catalog',
      description: 'Update catalog content',
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
      <ChecksCatalog {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    completeCatalog: catalogData,
  },
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const Error = {
  args: {
    ...Default.args,
    catalogError: 'Error loading catalog',
  },
};

export const Empty = {
  args: {
    ...Default.args,
    filteredCatalog: [],
  },
};
