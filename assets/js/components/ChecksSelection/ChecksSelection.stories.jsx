import { faker } from '@faker-js/faker';

import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksSelection from './ChecksSelection';

const catalog = [
  catalogCheckFactory.build({ group: 'Corosync' }),
  catalogCheckFactory.build({ group: 'Corosync' }),
  catalogCheckFactory.build({ group: 'Corosync' }),
  catalogCheckFactory.build({ group: 'Corosync' }),
  catalogCheckFactory.build({ group: 'Corosync' }),
  catalogCheckFactory.build({ group: 'SBD' }),
  catalogCheckFactory.build({ group: 'SBD' }),
  catalogCheckFactory.build({ group: 'Miscellaneous' }),
  catalogCheckFactory.build({ group: 'Miscellaneous' }),
];

const selectedChecks = [
  catalog[0].id,
  catalog[1].id,
  catalog[5].id,
  catalog[6].id,
];

const targetID = faker.datatype.uuid();

export default {
  title: 'ChecksSelection',
  component: ChecksSelection,
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS classes',
      table: {
        type: { summary: 'string' },
      },
    },
    catalog: {
      control: 'object',
      description: 'Catalog data',
      table: {
        type: { summary: 'object' },
      },
    },
    resourceID: {
      control: 'text',
      description: 'Resource ID',
      table: {
        type: { summary: 'string' },
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
    saving: {
      control: { type: 'boolean' },
      description: 'Saving state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    error: {
      control: { type: 'string' },
      description: 'Saving error',
      table: {
        type: { summary: 'string' },
      },
    },
    success: {
      control: { type: 'boolean' },
      description: 'Was the saving successful?',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    onUpdateCatalog: { action: 'Update catalog' },
    onStartExecution: { action: 'Start execution' },
    onSave: { action: 'Save' },
    onClear: {
      action: 'Clear',
      description:
        'Gets called on mount and when checks are selected. It can be used to clear any external state.',
    },
  },
};

export const Default = {
  args: {
    catalog,
    targetID,
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
    selected: selectedChecks,
  },
};

export const WithError = {
  args: {
    ...WithSelection.args,
    error: 'Error saving checks selection',
  },
};

export const Saving = {
  args: {
    ...WithSelection.args,
    saving: true,
  },
};
