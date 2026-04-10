import React, { useState, useEffect } from 'react';
import { get, noop } from 'lodash';

import Button from '@common/Button';
import Input from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';
import Modal from '@common/Modal';
import { getError } from '@lib/api/validationErrors';
import { REQUIRED_FIELD_TEXT, errorMessage } from '@lib/forms';
import { getFromConfig } from '@lib/config';

import AIProviderLabel from '@common/AIProviderLabel';

const providerOptionRenderer = (option) => {
  const provider = get(option, 'value', option);
  if (!provider) {
    return 'Select an AI Provider';
  }
  return <AIProviderLabel provider={provider} />;
};

const modelOptionRenderer = (option) => {
  const model = get(option, 'value', option);
  if (!model) {
    return 'None';
  }
  return <span>{model}</span>;
};

const getProviderOptions = (aiProviders) => {
  return Object.keys(aiProviders).map((provider) => ({
    value: provider,
    label: <AIProviderLabel provider={provider} />,
  }));
};

const getModelOptions = (aiProviders, provider) => {
  const models = aiProviders[provider] || [];
  return models.map((model) =>
    typeof model === 'string' ? { value: model, label: model } : model
  );
};

const defaultEmptyArray = [];
const defaultEmptyObject = {};
const defaultAiProviders = getFromConfig('aiProviders') || defaultEmptyObject;

function AIConfigurationModal({
  open = false,
  aiProviders = defaultAiProviders,
  aiConfiguration = defaultEmptyObject,
  onCancel = noop,
  onSave = noop,
  onUpdate = noop,
  saving = false,
  errors = defaultEmptyArray,
}) {
  const { provider: initialProvider = null, model: initialModel = null } =
    aiConfiguration;

  const hasAIConfiguration = Boolean(initialProvider && initialModel);
  const apiKeySet = Boolean(initialProvider && initialModel);

  const [provider, setProvider] = useState(initialProvider);
  const [model, setModel] = useState(initialModel);
  const [apiKey, setApiKey] = useState('');

  const [apiKeyError, setApiKeyError] = useState(null);

  useEffect(() => {
    if (open) {
      setProvider(initialProvider);
      setModel(initialModel);
      setApiKey('');
      setApiKeyError(null);
    }
  }, [open, initialProvider, initialModel]);

  useEffect(() => {
    setApiKeyError(getError('api_key', errors));
  }, [errors]);

  const validateRequired = () => {
    if (!hasAIConfiguration && !apiKey) {
      setApiKeyError(REQUIRED_FIELD_TEXT);

      return false;
    }
    return true;
  };

  const onSaveClicked = () => {
    if (!validateRequired()) {
      return;
    }

    const finalProvider = provider || '';
    const finalModel = model || '';

    if (!hasAIConfiguration) {
      onSave(finalProvider, finalModel, apiKey);
    } else {
      onUpdate(
        finalProvider === initialProvider ? undefined : finalProvider,
        finalModel === initialModel ? undefined : finalModel,
        apiKey || undefined
      );
    }
  };

  const isUnchanged =
    provider === initialProvider && model === initialModel && apiKey === '';

  return (
    <Modal
      title="AI Configuration"
      className="!w-3/4 !max-w-3xl"
      open={open}
      onClose={onCancel}
    >
      <div className="flex flex-col gap-6 mt-4">
        <div className="grid grid-cols-8 gap-6">
          <Label className="col-start-1 col-span-2 pt-2" required>
            Select Provider
          </Label>
          <div className="col-start-3 col-span-6">
            <Select
              optionsName="ai-provider"
              value={provider}
              options={getProviderOptions(aiProviders)}
              renderOption={providerOptionRenderer}
              onChange={(value) => {
                setProvider(value);
                const newModelOptions =
                  value !== null ? getModelOptions(aiProviders, value) : [];
                setModel(newModelOptions?.[0]?.value || null);
              }}
              disabled={saving}
            />
          </div>

          <Label className="col-start-1 col-span-2 pt-2" required>
            Model
          </Label>
          <div className="col-start-3 col-span-6">
            <Select
              optionsName="ai-model"
              value={model}
              options={provider ? getModelOptions(aiProviders, provider) : []}
              renderOption={modelOptionRenderer}
              onChange={setModel}
              disabled={!provider || saving}
            />
          </div>

          <Label
            className="col-start-1 col-span-2 pt-2"
            required={!initialModel}
          >
            API Key
          </Label>
          <div className="col-start-3 col-span-6">
            <Input
              type="text"
              value={apiKey}
              placeholder={apiKeySet ? 'Change API Key' : 'Enter API key'}
              onChange={({ target: { value } }) => {
                setApiKey(value);
                setApiKeyError(null);
              }}
              disabled={!provider || saving}
              error={apiKeyError}
            />
            {apiKeyError && errorMessage(apiKeyError)}
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-2 mt-8">
        <Button
          disabled={saving || !provider || !model || isUnchanged}
          type="default-fit"
          onClick={onSaveClicked}
        >
          Save
        </Button>
        <Button type="primary-white-fit" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default AIConfigurationModal;
