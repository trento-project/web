import Component from './ProviderDetails';

export default {
  title: 'Components/ProviderDetails',
  component: Component,
  argTypes: {
    provider: {
      description: 'Identifier for the provider',
      control: { type: 'text' },
    },
    provider_data: {
      description: 'Identifier for the provider_data',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { provider: '', provider_data: '' },
};
