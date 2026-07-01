// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { providers } from '@lib/model';
import {
  nonCustomizedValueFactory,
  selectableCheckFactory,
} from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import CheckCustomizationModal from './CheckCustomizationModal';

const singleValue = [
  nonCustomizedValueFactory.build({
    name: 'ValueName1',
    default_value: 'value1',
    customizable: true,
  }),
];

const singleBooleanValue = [
  nonCustomizedValueFactory.build({
    name: 'ValueName1',
    default_value: true,
    customizable: true,
  }),
];

const multipleValues = [
  nonCustomizedValueFactory.build({
    name: 'ValueName1',
    default_value: 'value1',
    customizable: true,
  }),
  nonCustomizedValueFactory.build({
    name: 'ValueName2',
    default_value: 'value2',
    customizable: true,
  }),
  nonCustomizedValueFactory.build({
    name: 'A very very very long name with to many characters',
    default_value: 'value3',
    customizable: true,
  }),
  nonCustomizedValueFactory.build({
    name: 'ValueName4',
    default_value: true,
    customizable: true,
  }),
  nonCustomizedValueFactory.build({
    name: 'ValueName5',
    default_value: false,
    customizable: true,
  }),
];

const partialCustomizableValues = [
  nonCustomizedValueFactory.build({
    name: 'ValueName1',
    default_value: 'value1',
    customizable: true,
  }),
  nonCustomizedValueFactory.build({
    name: 'ValueName2',
    default_value: 'value2',
    customizable: false,
  }),
  nonCustomizedValueFactory.build({
    name: 'ValueName3',
    default_value: true,
    customizable: true,
  }),
  nonCustomizedValueFactory.build({
    name: 'ValueName4',
    default_value: false,
    customizable: false,
  }),
];

const defaultCheck = selectableCheckFactory.build({
  id: 'Check001',
  name: 'Check Corosync max_messages during runtime',
  values: singleValue,
  description: 'This is a great check description',
});

const defaultProvider = 'aws';

export default {
  title: 'Components/CheckCustomizationModal',
  component: CheckCustomizationModal,
  argTypes: {
    open: {
      description: 'Opens the modal',
      control: { type: 'boolean' },
    },
    id: {
      description: 'Check ID',
      control: { type: 'text' },
    },
    groupID: {
      description: 'Target ID',
      control: { type: 'text' },
    },
    values: {
      description: 'Check values',
      control: { type: 'object' },
    },
    description: {
      description: 'Check description',
      control: { type: 'text' },
    },
    customized: {
      description: 'Describes if the check was customized',
      control: { type: 'boolean' },
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    onClose: {
      description: 'Closes the modal',
      action: 'onClose',
    },
    onSave: {
      description: 'Saves the customized checks values and closes the modal',
      action: 'onSave',
    },
    onReset: {
      description: 'Resets the customized checks values and closes the modal',
      action: 'onReset',
    },
    customizationStatus: {
      description: 'Status of the check customization operation',
      control: { type: 'select' },
      options: ['idle', 'ongoing', 'failed', 'invalid'],
    },
  },
};

export const Default = {
  args: {
    open: true,
    id: defaultCheck.id,
    values: defaultCheck.values,
    description: defaultCheck.description,
    provider: defaultProvider,
    customized: false,
    customizationStatus: 'idle',
    onClose: action('onClose'),
    onSave: action('onSave'),
    onReset: action('onReset'),
  },
};

export const SingleValue = {
  args: {
    ...Default.args,
    open: true,
    id: defaultCheck.id,
    values: defaultCheck.values,
    description: defaultCheck.description,
    provider: defaultProvider,
    customized: false,
    customizationStatus: 'idle',
    onClose: action('onClose'),
    onSave: action('onSave'),
    onReset: action('onReset'),
  },
};

export const SingleBooleanValue = {
  args: {
    ...SingleValue.args,
    values: singleBooleanValue,
  },
};

export const MultipleValues = {
  args: {
    ...SingleValue.args,
    values: multipleValues,
  },
};

export const PartialNonCustomizableValues = {
  args: {
    ...SingleValue.args,
    isChecked: true,
    values: partialCustomizableValues,
  },
};
