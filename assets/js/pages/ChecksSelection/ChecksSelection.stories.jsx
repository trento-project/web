import { selectableCheckFactory } from '@lib/test-utils/factories';

import ChecksSelection from './ChecksSelection';

const catalog = [
  selectableCheckFactory.build({ group: 'Corosync', customized: true }),
  selectableCheckFactory.build({ group: 'Corosync' }),
  selectableCheckFactory.build({ group: 'Corosync' }),
  selectableCheckFactory.build({ group: 'Corosync' }),
  selectableCheckFactory.build({ group: 'Corosync' }),
  selectableCheckFactory.build({ group: 'SBD' }),
  selectableCheckFactory.build({ group: 'SBD' }),
  selectableCheckFactory.build({ group: 'Miscellaneous' }),
  selectableCheckFactory.build({ group: 'Miscellaneous' }),
];

const selectedChecks = [
  catalog[0].id,
  catalog[1].id,
  catalog[5].id,
  catalog[6].id,
];

export default {
  title: 'Patterns/ChecksSelection',
  component: ChecksSelection,
  argTypes: {
    catalog: {
      control: 'object',
      description: 'Catalog data',
      table: {
        type: { summary: 'object' },
      },
    },
    selectedChecks: {
      control: 'array',
      description: 'Currently selected checks',
      table: {
        type: { summary: 'array' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    catalogError: {
      control: { type: 'string' },
      description: 'Error occurred while loading the catalog',
      table: {
        type: { summary: 'string' },
      },
    },
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    onUpdateCatalog: {
      action: 'Update catalog',
      description: 'Gets called to refresh the catalog.',
    },
    onChange: {
      action: 'Change',
      description:
        'Gets called when the selection changes. Used to propagate the new selected checks by the user.',
    },
  },
};

export const Default = {
  args: {
    catalog,
    userAbilities: [{ name: 'all', resource: 'check_customization' }],
  },
};

export const Empty = {
  args: {
    ...Default.args,
    catalog: [],
  },
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const WithSelection = {
  args: {
    ...Default.args,
    selectedChecks,
  },
};

export const WithError = {
  args: {
    ...WithSelection.args,
    catalogError: 'An error occurred while fetching the catalog.',
  },
};
