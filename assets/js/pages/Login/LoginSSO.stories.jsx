import Component from './LoginSSO';

export default {
  title: 'Components/LoginSSO',
  component: Component,
  argTypes: {
    singleSignOnUrl: {
      description: 'The singleSignOnUrl prop',
      control: { type: 'text' },
    },
    error: {
      description: 'The error prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { singleSignOnUrl: '', error: '' },
};
