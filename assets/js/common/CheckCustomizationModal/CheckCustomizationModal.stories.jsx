import React from 'react';
import { useArgs } from '@storybook/preview-api';
import CheckCustomizationModal from '.';

const singleValue = [
  {
    name: 'ValueName1',
    current_value: 'value1',
    conditions: [],
    customizable: true,
  },
];
const multipleValues = [
  {
    name: 'ValueName1',
    current_value: 'value1',
    conditions: [],
    customizable: true,
  },
  {
    name: 'ValueName2',
    current_value: 'value2',
    conditions: [],
    customizable: true,
  },
  {
    name: 'A very very very long name with to many characters',
    current_value: 'value3',
    conditions: [],
    customizable: true,
  },
];

const partialCustomizableValues = [
  {
    name: 'ValueName1',
    current_value: 'value1',
    conditions: [],
    customizable: true,
  },
  {
    name: 'ValueName2',
    current_value: 'value2',
    conditions: [],
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
      description: 'Selected Check ID',
      control: 'text',
    },
    values: {
      description: 'Values provided by the selected check',
      control: 'array',
    },
    description: {
      description: 'Check Description provided by the selected check',
      control: 'string',
    },
    customized: {
      description: 'Enables the input fields for check customization',
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
      description: 'Saves the customized checks values',
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
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        Toggle CheckCustomizationModal
      </button>
      <CheckCustomizationModal {...args} onClose={handleClose} />
    </>
  );
}

export function MultipleValues(args) {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        Toggle CheckCustomizationModal
      </button>
      <CheckCustomizationModal
        {...args}
        values={multipleValues}
        onClose={handleClose}
      />
    </>
  );
}

export function PartialNonCustomizableValues(args) {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        Toggle CheckCustomizationModal
      </button>
      <CheckCustomizationModal
        {...args}
        isChecked
        values={partialCustomizableValues}
        onClose={handleClose}
      />
    </>
  );
}
