import React from 'react';
import { useArgs } from '@storybook/preview-api';
import CustomCheckModal from '.';

const singleValue = [
  { name: 'ValueName1', default: 'value1', conditions: [], customizable: true },
];
const multipleValues = [
  { name: 'ValueName1', default: 'value1', conditions: [], customizable: true },
  { name: 'ValueName2', default: 'value2', conditions: [], customizable: true },
  {
    name: 'A very very very long name with to many characters',
    default: 'value3',
    conditions: [],
    customizable: true,
  },
];

const partialCustomizableValues = [
  { name: 'ValueName1', default: 'value1', conditions: [], customizable: true },
  {
    name: 'ValueName2',
    default: 'value2',
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
  title: 'Components/CustomCheckModal',
  component: CustomCheckModal,
  argTypes: {
    open: {
      description: 'Opens the modal',
      control: 'boolean',
    },
    selectedCheckID: {
      description: 'Selected Check ID',
      control: 'text',
    },
    selectedCheckValues: {
      description: 'Values provided by the selected check',
      control: 'array',
    },
    selectedCheckDescription: {
      description: 'Check Description provided by the selected check',
      control: 'string',
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
    isChecked: {
      description: 'Enables the input fields for check customization',
      control: 'boolean',
    },
  },
  args: {
    open: false,
    selectedCheckID: defaultCheck.id,
    selectedCheckValues: defaultCheck.values,
    selectedCheckDescription: defaultCheck.description,
    provider: defaultProvider,
  },
};

export function SingleValue(args) {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        Toggle CustomCheckModal
      </button>
      <CustomCheckModal {...args} onClose={handleClose} />
    </>
  );
}

export function MultipleValues(args) {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        Toggle CustomCheckModal
      </button>
      <CustomCheckModal
        {...args}
        selectedCheckValues={multipleValues}
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
        Toggle CustomCheckModal
      </button>
      <CustomCheckModal
        {...args}
        isChecked
        selectedCheckValues={partialCustomizableValues}
        onClose={handleClose}
      />
    </>
  );
}
