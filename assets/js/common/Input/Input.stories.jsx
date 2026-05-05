import { EOS_SEARCH, EOS_VISIBILITY_OFF_OUTLINED } from 'eos-icons-react';
import React, { useState } from 'react';
import { action } from 'storybook/actions';

import Input from './Input';

export default {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    id: {
      description: 'The id attribute of the input',
      control: { type: 'text' },
    },
    name: {
      description: 'The name attribute of the input',
      control: { type: 'text' },
    },
    type: {
      description: 'The type attribute of the input',
      control: { type: 'text' },
    },
    value: {
      description: 'The value attribute of the input',
      control: { type: 'text' },
    },
    prefix: {
      description: 'The prefix icon to render',
      control: { type: 'text' },
    },
    suffix: {
      description: 'The suffix icon to render',
      control: { type: 'text' },
    },
    placeholder: {
      description: 'The placeholder text to render',
      control: { type: 'text' },
    },
    allowClear: {
      description: 'Whether the input should have a clear icon or not',
      control: { type: 'boolean' },
    },
    error: {
      description: 'Whether the field has an error',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Whether the input should be disabled or not',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes to apply to the input wrapper',
      control: { type: 'text' },
    },
    initialValue: {
      description:
        'The initial default value to populate the input with when the component mounts',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Callback function invoked when the input value changes',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    id: 'input-1',
    name: 'default-input',
    prefix: undefined,
    suffix: undefined,
    placeholder: 'Enter text...',
    allowClear: false,
    error: false,
    disabled: false,
    className: '',
    initialValue: '',
    onChange: action('onChange'),
  },
};

export const WithControlledValue = {
  args: {
    ...Default.args,
  },
  render: () => {
    const [value, setValue] = useState('Value');
    return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
  },
};

export const WithInitialValue = {
  args: {
    ...Default.args,
    initialValue: 'Initial Value',
  },
};

export const WithPlaceholder = {
  args: {
    ...Default.args,
    placeholder: 'Placeholder',
  },
};

export const Disabled = {
  args: {
    ...WithPlaceholder.args,
    disabled: true,
  },
};

export const Clearable = {
  args: {
    ...WithPlaceholder.args,
    allowClear: true,
  },
};
export const ClearableDisabled = {
  args: {
    ...Clearable.args,
    disabled: true,
  },
};

export const WithError = {
  args: {
    ...WithInitialValue.args,
    error: true,
  },
};

export const WithPrefix = {
  args: {
    ...WithPlaceholder.args,
    prefix: <EOS_SEARCH size="l" />,
  },
};

export const WithPrefixDisabled = {
  args: {
    ...WithPrefix.args,
    disabled: true,
  },
};

export const WithSuffix = {
  args: {
    ...WithPlaceholder.args,
    suffix: <EOS_VISIBILITY_OFF_OUTLINED size="l" />,
  },
};

export const WithSuffixDisabled = {
  args: {
    ...WithSuffix.args,
    disabled: true,
  },
};

export const Checkbox = {
  args: {
    ...Default.args,
    type: 'checkbox',
  },
};

export const Date = {
  args: {
    ...Default.args,
    type: 'date',
  },
};

export const DateTime = {
  args: {
    ...Default.args,
    type: 'datetime-local',
  },
};

export const File = {
  args: {
    ...Default.args,
    type: 'file',
  },
};
