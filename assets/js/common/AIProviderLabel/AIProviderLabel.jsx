import React from 'react';

import { EOS_HELP } from 'eos-icons-react';

import { getProviderLabel, getProviderIcon } from '@lib/ai';

function ProviderIcon({ provider }) {
  const providerIcon = getProviderIcon(provider);

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
