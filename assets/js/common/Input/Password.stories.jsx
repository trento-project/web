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
    allowToggleVisibility: {
      description: 'Whether the password input should have a visibility toggle',
      control: {
        type: 'boolean',
      },
      table: {
        type: { summary: 'boolean' },
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
  },
};

export const Default = {};
export const WithValue = {
  args: {
    value: 'somepassword',
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

export const WithVisibilityToggle = {
  args: {
    allowToggleVisibility: true,
  },
};

export const WithVisibilityToggleAndValue = {
  args: {
    ...WithValue.args,
    ...WithVisibilityToggle.args,
  },
};

export const WithVisibilityToggleDisabled = {
  args: {
    ...WithVisibilityToggle.args,
    ...Disabled.args,
  },
};
