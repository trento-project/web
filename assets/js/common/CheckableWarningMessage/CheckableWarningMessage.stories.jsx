import React, { useState } from 'react';
import CheckableWarningMessage from '.';

export default {
  title: 'Components/CheckableWarningMessage',
  component: CheckableWarningMessage,
  argTypes: {
    hideCheckbox: {
      description: 'Hides the checkbox when set to true',
      control: 'boolean',
    },
    checked: {
      description: 'Checkbox state',
      control: 'boolean',
    },
    warningText: {
      description: 'Text displayed inside the warning message',
      control: 'text',
    },
    setChecked: {
      description: 'Function to toggle the checkbox state',
      action: 'setChecked',
    },
  },
  args: {
    hideCheckbox: false,
    checked: false,
    warningText:
      'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.',
  },
};

export function Default(args) {
  const [warningChecked, setWarningChecked] = useState(false);
  return (
    <CheckableWarningMessage
      {...args}
      checked={warningChecked}
      setChecked={setWarningChecked}
    />
  );
}

export function Checked(args) {
  const [checked, setChecked] = useState(true);
  return (
    <CheckableWarningMessage
      {...args}
      checked={checked}
      setChecked={setChecked}
    />
  );
}

export function WithoutCheckbox(args) {
  const [checked, setChecked] = useState(true);
  return (
    <CheckableWarningMessage
      {...args}
      checked={checked}
      setChecked={setChecked}
      hideCheckbox
    />
  );
}
