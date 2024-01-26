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

export const WithDisabled = {
  args: {
    ...WithValue.args,
    ...Disabled.args,
  },
};
