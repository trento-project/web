import AIProviderLabel from '.';

export default {
  title: 'Components/AIProviderLabel',
  component: AIProviderLabel,
  argTypes: {
    provider: {
      control: 'select',
      options: ['googleai', 'openai', 'anthropic', 'unmapped_provider'],
    },
  },
};

export const GoogleAI = {
  args: {
    provider: 'googleai',
  },
};

export const OpenAI = {
  args: {
    provider: 'openai',
  },
};

export const Anthropic = {
  args: {
    provider: 'anthropic',
  },
};

export const UnmappedProvider = {
  args: {
    provider: 'unmapped_provider',
  },
};
