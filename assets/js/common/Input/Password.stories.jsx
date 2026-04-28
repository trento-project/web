import { Password } from '.';

export default {
  title: 'Components/Input/Password',
  component: Password,
  argTypes: {
    placeholder: {
      description: 'The placeholder text to render',
      control: {
        type: 'text',
        defaultValue: 'Password',
      },
      table: {
        type: { summary: 'string' },
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
      table: {
        type: { summary: 'boolean' },
      },
    },
    className: {
      description: "Additional CSS classes to apply to the password input wrapper"
    },
    id: {
      description: "The id attribute of the underlying input element"
    },
    name: {
      description: "The name attribute of the underlying input element"
    },
    type: {
      description: "The type attribute of the input, toggled between password and text"
    },
    value: {
      description: "The controlled value of the password input"
    },
    initialValue: {
      description: "The initial default value to populate the password input with on mount"
    },
    prefix: {
      description: "An icon or element to display at the start of the input field"
    },
    suffix: {
      description: "An icon or element to display at the end of the input field"
    },
    allowClear: {
      description: "Whether to display a clear icon that empties the input when clicked"
    },
    onChange: {
      description: "Callback function invoked when the password input value changes"
    }
  },
};

export const Default = {};
export const WithValue = {
  args: {
    initialValue: 'somepassword',
  },
};

export const WithError = {
  args: {
    initialValue: 'someotherpassword',
    error: true,
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

export const DisabledWithInitialValue = {
  args: {
    ...WithValue.args,
    ...Disabled.args,
  },
};
