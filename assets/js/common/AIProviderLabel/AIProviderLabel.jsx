import React from 'react';
import { get } from 'lodash';

import { EOS_HELP } from 'eos-icons-react';

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

const getProviderLabel = (provider) =>
  get(providerRenderingConfig, [provider, 'label'], provider);

function ProviderIcon({ provider }) {
  const providerIcon = get(providerRenderingConfig, [provider, 'icon']);

  if (providerIcon) {
    return (
      <img src={providerIcon} className="mr-2 h-4 inline" alt={provider} />
    );
  }

  return <EOS_HELP className="mr-2 h-4 inline" />;
}

function AIProviderLabel({ provider }) {
  return (
    <span className="flex items-center">
      <ProviderIcon provider={provider} />
      {getProviderLabel(provider)}
    </span>
  );
}

export default AIProviderLabel;
