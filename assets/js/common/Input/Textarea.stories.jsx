import React, { useState } from 'react';

import Textarea from './Textarea';

export default {
  title: 'Components/Input/Textarea',
  component: Textarea,
  argTypes: {
    id: {
      description: 'The id attribute of the textarea',
      control: {
        type: 'text',
      },
    },
    name: {
      description: 'The name attribute of the textarea',
      control: {
        type: 'text',
      },
    },
    value: {
      description: 'The value attribute of the textarea',
      control: {
        type: 'text',
      },
    },
    placeholder: {
      description: 'The placeholder text to render',
      control: {
        type: 'text',
      },
    },
    disabled: {
      description: 'Whether the textarea should be disabled or not',
      control: {
        type: 'boolean',
      },
    },
  },
};

export const Default = {};

export const WithPlaceholder = {
  args: {
    placeholder: 'Placeholder text',
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

export const DisabledWithPlaceholder = {
  args: {
    ...WithPlaceholder.args,
    ...Disabled.args,
  },
};

export const WithInitialValue = {
  args: {
    initialValue: 'Initial value text',
  },
};

export const WithControlledValue = {
  args: {},
  render: () => {
    const [value, setValue] = useState('Value text');
    return (
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
    );
  },
};

export const DisabledWithValue = {
  args: {
    value: 'Value text',
    ...Disabled.args,
  },
};
