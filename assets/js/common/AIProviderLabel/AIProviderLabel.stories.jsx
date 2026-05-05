import AIProviderLabel from '.';

export default {
  title: 'Components/AIProviderLabel',
  component: AIProviderLabel,
  argTypes: {
    provider: {
      description: 'AI provider name',
      control: { type: 'select' },
      options: ['googleai', 'openai', 'anthropic', 'unmapped_provider'],
    },
  },
};

export const Default = {
  args: {
    provider: 'anthropic',
  },
};

export const GoogleAI = {
  args: {
    ...Default.args,
    provider: 'googleai',
  },
};

export const OpenAI = {
  args: {
    ...Default.args,
    provider: 'openai',
  },
};

export const Anthropic = {
  args: {
    ...Default.args,
    provider: 'anthropic',
  },
};

export const UnmappedProvider = {
  args: {
    ...Default.args,
    provider: 'unmapped_provider',
  },
};
