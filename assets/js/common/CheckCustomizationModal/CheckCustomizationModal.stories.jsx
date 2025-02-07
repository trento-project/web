import React from 'react';
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
      description: 'Closes the modal',
    },
    onSave: {
      description: 'Saves the customized checks values and closes the modal',
    },
  },
  args: {
    open: false,
    id: defaultCheck.id,
    values: defaultCheck.values,
    description: defaultCheck.description,
    provider: defaultProvider,
  },
};

export function SingleValue(args) {
  return <CheckCustomizationModal {...args} />;
}

export function MultipleValues(args) {
  return <CheckCustomizationModal {...args} values={multipleValues} />;
}

export function PartialNonCustomizableValues(args) {
  return (
    <CheckCustomizationModal
      {...args}
      isChecked
      values={partialCustomizableValues}
    />
  );
}
