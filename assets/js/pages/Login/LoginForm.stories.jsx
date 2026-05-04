import Component from './LoginForm';

export default {
  title: 'Components/LoginForm',
  component: Component,
  argTypes: {
    authError: {
      description: 'The authError prop',
      control: { type: 'text' },
    },
    authInProgress: {
      description: 'The authInProgress prop',
      control: { type: 'text' },
    },
    handleLoginSubmit: {
      description: 'Callback function invoked when login submit',
      action: 'handleLoginSubmit',
    },
    isUnauthorized: {
      description: 'The isUnauthorized prop',
      control: { type: 'boolean' },
    },
    password: {
      description: 'The password prop',
      control: { type: 'text' },
    },
    setPassword: {
      description: 'Callback function invoked when password',
      action: 'setPassword',
    },
    setTotpCode: {
      description: 'Callback function invoked when totp code',
      action: 'setTotpCode',
    },
    setUsername: {
      description: 'Callback function invoked when username',
      action: 'setUsername',
    },
    totpCodeRequested: {
      description: 'The totpCodeRequested prop',
      control: { type: 'text' },
    },
    totpCode: {
      description: 'The totpCode prop',
      control: { type: 'text' },
    },
    username: {
      description: 'The username prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    authError: '',
    authInProgress: '',
    isUnauthorized: false,
    password: '',
    totpCodeRequested: '',
    totpCode: '',
    username: '',
  },
};
