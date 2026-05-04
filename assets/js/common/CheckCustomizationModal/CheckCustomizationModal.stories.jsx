import { action } from 'storybook/actions';
import CheckCustomizationModal from '.';

const singleValue = [
  {
    name: 'ValueName1',
    default_value: 'value1',
    customizable: true,
  },
];
const singeBooleanValue = [
  {
    name: 'ValueName1',
    default_value: true,
    customizable: true,
  },
];

const multipleValues = [
  {
    name: 'ValueName1',
    default_value: 'value1',
    customizable: true,
  },
  {
    name: 'ValueName2',
    default_value: 'value2',
    customizable: true,
  },
  {
    name: 'A very very very long name with to many characters',
    default_value: 'value3',
    customizable: true,
  },

  {
    name: 'ValueName4',
    default_value: true,
    customizable: true,
  },
  {
    name: 'ValueName5',
    default_value: false,
    customizable: true,
  },
];

const partialCustomizableValues = [
  {
    name: 'ValueName1',
    default_value: 'value1',
    customizable: true,
  },
  {
    name: 'ValueName2',
    default_value: 'value2',
    customizable: false,
  },
  {
    name: 'ValueName3',
    default_value: true,
    customizable: true,
  },

  {
    name: 'ValueName4',
    default_value: false,
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
      description: 'Cloud or on-premises provider',
      control: { type: 'text' },
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
      description:
        'Status of the check customization operation (ongoing, failed, or invalid)',
      control: { type: 'text' },
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
    customizationStatus: '',
    onClose: () => {},
    onSave: () => {},
    onReset: () => {},
  },
};

export const SingleValue = {
  args: {
    open: true,
    id: defaultCheck.id,
    values: defaultCheck.values,
    description: defaultCheck.description,
    provider: defaultProvider,
    customized: false,
    customizationStatus: '',
    onClose: () => {},
    onSave: () => {},
    onReset: () => {},
  },
};

export const SingleBooleanValue = {
  args: {
    ...SingleValue.args,
    values: singeBooleanValue,
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
