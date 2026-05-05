import Login from '.';

export default {
  title: 'Components/LoginSSO',
  component: Login,
  argTypes: {
    singleSignOnUrl: {
      description: 'The singleSignOnUrl prop',
      control: { type: 'text' },
    },
    error: {
      description: 'The error prop',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    singleSignOnUrl: 'https://sso.example.com/login',
    error: false,
  },
};
