import React, { useState } from 'react';

import { EOS_SEARCH, EOS_VISIBILITY_OFF_OUTLINED } from 'eos-icons-react';

import Input from '.';

export default {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    id: {
      description: 'The id attribute of the input',
      control: {
        type: 'text',
      },
    },
    name: {
      description: 'The name attribute of the input',
      control: {
        type: 'text',
      },
    },
    type: {
      description: 'The type attribute of the input',
      control: {
        type: 'text',
      },
    },
    value: {
      description: 'The value attribute of the input',
      control: {
        type: 'text',
      },
    },
    prefix: {
      description: 'The prefix icon to render',
      control: {
        type: 'text',
      },
    },
    suffix: {
      description: 'The suffix icon to render',
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
    allowClear: {
      description: 'Whether the input should have a clear icon or not',
      control: {
        type: 'boolean',
      },
    },
    error: {
      description: 'Whether the field has an error',
      control: {
        type: 'boolean',
      },
    },
    disabled: {
      description: 'Whether the input should be disabled or not',
      control: {
        type: 'boolean',
      },
    },
  },
};

export const Default = {};

export const WithControlledValue = {
  args: {},
  render: () => {
    const [value, setValue] = useState('Value');
    return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
  },
};

export const WithInitialValue = {
  args: {
    initialValue: 'Initial Value',
  },
};

export const WithPlaceholder = {
  args: {
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
    type: 'checkbox',
  },
};

export const Date = {
  args: {
    type: 'date',
  },
};

export const DateTime = {
  args: {
    type: 'datetime-local',
  },
};

export const File = {
  args: {
    type: 'file',
  },
};
