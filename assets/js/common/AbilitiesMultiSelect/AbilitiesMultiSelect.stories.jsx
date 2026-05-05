// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { abilityFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import AbilitiesMultiSelect from './AbilitiesMultiSelect';

export default {
  title: 'Components/AbilitiesMultiSelect',
  component: AbilitiesMultiSelect,
  argTypes: {
    abilities: {
      description: 'Available abilities options (array of ability objects)',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'Current user abilities (array of ability objects)',
      control: { type: 'object' },
    },
    placeholder: {
      description: 'Placeholder text shown in the select when empty',
      control: { type: 'text' },
    },
    setAbilities: {
      description: 'Callback invoked when selected abilities change',
      action: 'setAbilities',
    },
    operationsEnabled: {
      description: 'Flag to enable operations-related grouped abilities',
      control: { type: 'boolean' },
    },
  },
};

const sampleAbilities = abilityFactory.buildList(7);
const userSelectedAbilities = abilityFactory.buildList(2);

export const Default = {
  args: {
    abilities: sampleAbilities,
    userAbilities: userSelectedAbilities,
    placeholder: 'Select abilities...',
    operationsEnabled: true,
    setAbilities: action('setAbilities'),
  },
};

export const NoAbilities = {
  args: {
    abilities: [],
    userAbilities: [],
    placeholder: 'Select abilities...',
    operationsEnabled: true,
    setAbilities: action('setAbilities'),
  },
};

export const OperationsDisabled = {
  args: {
    abilities: sampleAbilities,
    userAbilities: userSelectedAbilities,
    placeholder: 'Select abilities...',
    operationsEnabled: false,
    setAbilities: action('setAbilities'),
  },
};
