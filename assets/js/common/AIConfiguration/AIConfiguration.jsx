import React, { useState } from 'react';
import { get, noop } from 'lodash';
import classNames from 'classnames';

import ListView from '@common/ListView';
import Button from '@common/Button';

import AIProviderLabel from '@common/AIProviderLabel';
import AIConfigurationModal from './AIConfigurationModal';

function AIConfiguration({
  className,
  aiConfiguration = {},
  onCreate = noop,
  onUpdate = noop,
  onEditClick = noop,
}) {
  const [aiConfigurationModalOpen, setAiConfigurationModalOpen] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const openEditModal =
    onEditClick === noop
      ? () => setAiConfigurationModalOpen(true)
      : onEditClick;

  const closeModal = () => setAiConfigurationModalOpen(false);

  const handleRequest = (handler) => (provider, model, apiKey) => {
    setSaving(true);
    handler(provider, model, apiKey)
      .then(closeModal)
      .catch((error) => {
        const apiErrors = error?.response?.data?.errors || [];
        setErrors(apiErrors);
      })
      .finally(() => setSaving(false));
  };

  const modelProvider = get(aiConfiguration, 'provider');
  const model = get(aiConfiguration, 'model');
  const hasAIConfiguration = modelProvider && model;

  const aiFields = [
    {
      title: 'Model Provider',
      content: modelProvider,
      render: (content) =>
        content ? <AIProviderLabel provider={content} /> : 'None',
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
      <AIConfigurationModal
        open={aiConfigurationModalOpen}
        aiConfiguration={aiConfiguration}
        onSave={handleRequest(onCreate)}
        onUpdate={handleRequest(onUpdate)}
        onCancel={closeModal}
        errors={errors}
        saving={saving}
      />
      <div
        className={classNames(
          'container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg',
          className
        )}
      >
        <div>
          <h2 className="text-2xl font-bold inline-block">AI Configuration</h2>
          <span className="float-right">
            <Button
              type="primary-white-fit"
              aria-label="ai-configuration-edit-button"
              onClick={openEditModal}
            >
              Edit Settings
            </Button>
          </span>
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
