import { get } from 'lodash';

import GeminiIcon from '@static/gemini-logo.svg';
import OpenAIIcon from '@static/openai-logo.svg';
import AnthropicIcon from '@static/anthropic-logo.svg';

const providerRenderingConfig = {
  googleai: {
    icon: GeminiIcon,
    label: 'Google Gemini',
  },
  openai: {
    icon: OpenAIIcon,
    label: 'OpenAI GPT',
  },
  anthropic: {
    icon: AnthropicIcon,
    label: 'Anthropic Claude',
  },
};

export const getProviderLabel = (provider) =>
  get(providerRenderingConfig, [provider, 'label'], provider);

export const getProviderIcon = (provider) =>
  get(providerRenderingConfig, [provider, 'icon']);
