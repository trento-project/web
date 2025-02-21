import { action } from '@storybook/addon-actions';
import CheckCustomizationModal from '.';

const singleValue = [
  {
    name: 'ValueName1',
    current_value: 'value1',
    customizable: true,
  },
];
const multipleValues = [
  {
    name: 'ValueName1',
    current_value: 'value1',
    customizable: true,
  },
  {
    name: 'ValueName2',
    current_value: 'value2',
    customizable: true,
  },
  {
    name: 'A very very very long name with to many characters',
    current_value: 'value3',
    customizable: true,
  },
];

const partialCustomizableValues = [
  {
    name: 'ValueName1',
    current_value: 'value1',
    customizable: true,
  },
  {
    name: 'ValueName2',
    current_value: 'value2',
    customizable: false,
  },
];
const defaultCheck = {
  id: 'Check001',
  name: 'Check Corosync max_messages during runtime',
  values: singleValue,
  description: 'This is a great check description',
};

const defaultProvider = 'aws';

export default {
  title: 'Components/CheckCustomizationModal',
  component: CheckCustomizationModal,
  argTypes: {
    open: {
      description: 'Opens the modal',
      control: 'boolean',
    },
    id: {
      description: 'Check ID',
      control: 'text',
    },
    values: {
      description: 'Check values',
      control: 'array',
    },
    description: {
      description: 'Check description',
      control: 'string',
    },
    customized: {
      description: 'Describes if the check was customized',
      control: 'boolean',
    },
    provider: {
      description: 'Cloud or on-premises provider',
      control: 'text',
    },
    onClose: {
      type: 'function',
      description: 'Closes the modal',
    },
    onSave: {
      type: 'function',
      description: 'Saves the customized checks values and closes the modal',
    },
    onReset: {
      type: 'function',
      description: 'Resets the customized checks values and closes the modal',
    },
  },
};

export const SingleValue = {
  args: {
    open: false,
    id: defaultCheck.id,
    values: defaultCheck.values,
    description: defaultCheck.description,
    provider: defaultProvider,
    onClose: action('onClose'),
    onSave: action('onSave'),
    onReset: action('onReset'),
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
