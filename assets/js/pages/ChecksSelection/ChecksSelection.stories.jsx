import { faker } from '@faker-js/faker';
import { action } from 'storybook/actions';
import { selectableCheckFactory } from '@lib/test-utils/factories';
import { providers } from '@lib/model';

import ChecksSelection from './ChecksSelection';
import { CUSTOMIZATION_STATUSES } from './hooks';

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
    groupID: {
      description: 'The ID of the group to which the selection refers to.',
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    catalog: {
      control: { type: 'object' },
      description: 'Catalog data',
    },
    selectedChecks: {
      control: { type: 'object' },
      description: 'Currently selected checks',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state',
    },
    catalogError: {
      control: { type: 'text' },
      description: 'Error occurred while loading the catalog',
    },
    userAbilities: {
      control: { type: 'object' },
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
    onSaveCheckCustomization: {
      action: 'Save check customization',
      description: 'Gets called when the user saves a customization.',
    },
    onResetCheckCustomization: {
      action: 'Reset check customization',
      description: 'Gets called when the user resets a customization.',
    },
    customizationStatus: {
      description: 'Current customization status',
      options: CUSTOMIZATION_STATUSES,
      control: { type: 'radio' },
    },
  },
};

export const Default = {
  args: {
    groupID: faker.string.uuid(),
    catalog,
    userAbilities: [{ name: 'all', resource: 'check_customization' }],
    provider: 'aws',
    loading: false,
    onUpdateCatalog: action('onUpdateCatalog'),
    onChange: action('onChange'),
    onSaveCheckCustomization: action('onSaveCheckCustomization'),
    onResetCheckCustomization: action('onResetCheckCustomization'),
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
