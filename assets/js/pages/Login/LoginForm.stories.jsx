import Login from '.';
import { action } from 'storybook/actions';
import { userFactory } from '@lib/test-utils/factories';

const mockUser = userFactory.build();

export default {
  title: 'Components/LoginForm',
  component: Login,
  argTypes: {
    authError: {
      description: 'The authError prop',
      control: { type: 'text' },
    },
    authInProgress: {
      description: 'The authInProgress prop',
      control: { type: 'boolean' },
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
      control: { type: 'boolean' },
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
    authInProgress: false,
    isUnauthorized: false,
    password: '',
    totpCodeRequested: false,
    totpCode: '',
    username: '',
    handleLoginSubmit: action('handleLoginSubmit'),
    setPassword: action('setPassword'),
    setTotpCode: action('setTotpCode'),
    setUsername: action('setUsername'),
  },
};

export const FilledForm = {
  args: {
    ...Default.args,
    username: mockUser.username,
    password: 'ExamplePassword123!',
  },
};

export const WithTotpCode = {
  args: {
    ...FilledForm.args,
    totpCodeRequested: true,
    totpCode: '123456',
  },
};

export const WithAuthError = {
  args: {
    ...Default.args,
    username: mockUser.username,
    authError: 'Invalid username or password',
    isUnauthorized: true,
  },
};

export const SubmittingForm = {
  args: {
    ...FilledForm.args,
    authInProgress: true,
  },
};
