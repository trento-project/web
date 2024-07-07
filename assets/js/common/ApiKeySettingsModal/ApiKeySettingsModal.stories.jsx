/* eslint-disable no-console, react/function-component-definition */
import React from 'react';
import { useArgs } from '@storybook/client-api';
import ApiKeySettingsModal from './ApiKeySettingsModal';

export default {
  title: 'Components/ApiKeySettingsModal',
  component: ApiKeySettingsModal,
  argTypes: {
    open: {
      description: 'Whether the modal is open or not',
      control: {
        type: 'boolean',
      },
    },
    userAbilities: {
      description: 'Users abilities that allow generating a new api key',
      control: 'array',
    },
    permitted: {
      description: 'Abilities that allow generating a new api key in the modal',
      control: 'array',
    },
    loading: {
      description: 'Whether the settings are loading or submitting',
      control: {
        type: 'boolean',
      },
    },
    generatedApiKeyExpiration: {
      description:
        'The new generated api key expiration expressed in ISO8601 Timestamp',
    },
    generatedApiKey: {
      description: 'The new generated api key',
    },
    onGenerate: {
      action: 'Generate key',
      description: 'New key is generated',
    },
  },
  args: {
    loading: false,
    open: false,
    generatedApiKeyExpiration: new Date().toISOString(),
    generatedApiKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBpX2tleSIsImV4cCI6MTcxMjE1MzE3MCwiaWF0IjoxNzA5NzMzOTcxLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiYmZmMjA0YjUtMzJmMS00YmVlLThiMGItY2IxZGQwNTlmNGRjIiwibmJmIjoxNzA5NzMzOTcxLCJ0eXAiOiJCZWFyZXIifQ.0Lz0MwZaFpIGbSohnkiJ6AN5FFb5Vg5ZVhqM3fdUf3M',
    userAbilities: [{ name: 'all', resource: 'all' }],
    permitted: ['all:api_key_settings'],
  },
};

export const Default = (args) => {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        {' '}
        Toggle modal{' '}
      </button>
      <ApiKeySettingsModal {...args} onClose={handleClose} />
    </>
  );
};

export const OnlyGenerationForm = (args) => {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        {' '}
        Toggle modal{' '}
      </button>
      <ApiKeySettingsModal
        {...args}
        generatedApiKeyExpiration={null}
        generatedApiKey={null}
        onClose={handleClose}
      />
    </>
  );
};

export const WithoutPermission = (args) => {
  const [{ open }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ open: !open });

  return (
    <>
      <button type="button" onClick={() => handleClose()}>
        {' '}
        Toggle modal{' '}
      </button>
      <ApiKeySettingsModal
        {...args}
        userAbilities={[{ name: '', resource: '' }]}
        onClose={handleClose}
      />
    </>
  );
};
