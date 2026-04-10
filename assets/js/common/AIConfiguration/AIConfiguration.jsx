import React from 'react';
import { get } from 'lodash';
import classNames from 'classnames';

import { EOS_HELP } from 'eos-icons-react';

import ListView from '@common/ListView';

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
  providerRenderingConfig[provider]?.label || provider;

function ProviderIcon({ provider }) {
  const providerIcon = providerRenderingConfig[provider]?.icon;

  if (providerIcon) {
    return (
      <img src={providerIcon} className="mr-2 h-4 inline" alt={provider} />
    );
  }

  return <EOS_HELP className="mr-2 h-4 inline" />;
}

function AIConfiguration({ className, aiConfiguration }) {
  const modelProvider = get(aiConfiguration, 'provider');
  const model = get(aiConfiguration, 'model');
  const hasAIConfiguration = modelProvider && model;

  const aiFields = [
    {
      title: 'Model Provider',
      content: modelProvider,
      render: (content) =>
        content ? (
          <>
            <ProviderIcon provider={modelProvider.toLowerCase()} />
            {getProviderLabel(modelProvider.toLowerCase())}
          </>
        ) : (
          'None'
        ),
    },
    {
      title: 'Model',
      content: model,
      render: (content) => content || 'None',
    },
    {
      title: 'API Key',
      content: hasAIConfiguration ? '••••••••' : 'Not set',
    },
  ];

  return (
    <>
      <div
        className={classNames(
          'container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg',
          className
        )}
      >
        <div>
          <h2 className="text-2xl font-bold inline-block">AI Configuration</h2>
        </div>
        <p className="mt-3 mb-3 text-gray-500">
          Settings used by Liz, your AI Assistant.
        </p>
        <ListView className="w-1/2" data={aiFields} />
      </div>
    </>
  );
}

export default AIConfiguration;
