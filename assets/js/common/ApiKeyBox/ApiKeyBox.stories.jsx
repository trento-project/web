import Component from './ApiKeyBox';

export default {
  title: 'Components/ApiKeyBox',
  component: Component,
  argTypes: {
    apiKey: {
      description: 'The API key to be displayed.',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes for the component.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    apiKey: 'some-api-key',
    className: '',
  },
};
