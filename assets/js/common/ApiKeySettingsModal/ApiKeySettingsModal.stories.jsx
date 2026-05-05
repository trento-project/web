import React from 'react';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';
import ApiKeySettingsModal from './ApiKeySettingsModal';

export default {
  title: 'Components/ApiKeySettingsModal',
  component: ApiKeySettingsModal,
  argTypes: {
    open: {
      description: 'Whether the modal is open or not',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Whether the settings are loading or submitting',
      control: { type: 'boolean' },
    },
    onGenerate: {
      action: 'Generate key',
      description: 'New key is generated',
    },
    onClose: {
      action: 'Cancel key',
      description: 'Closes the modal',
    },
    generatedApiKeyExpiration: {
      description:
        'The new generated api key expiration expressed in ISO8601 Timestamp',
      control: { type: 'text' },
    },
    generatedApiKey: {
      description: 'The new generated api key',
      control: { type: 'text' },
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
    },
  },
  args: {
    loading: false,
    open: false,
    generatedApiKeyExpiration: new Date().toISOString(),
    generatedApiKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBpX2tleSIsImV4cCI6MTcxMjE1MzE3MCwiaWF0IjoxNzA5NzMzOTcxLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiYmZmMjA0YjUtMzJmMS00YmVlLThiMGItY2IxZGQwNTlmNGRjIiwibmJmIjoxNzA5NzMzOTcxLCJ0eXAiOiJCZWFyZXIifQ.0Lz0MwZaFpIGbSohnkiJ6AN5FFb5Vg5ZVhqM3fdUf3M',
  },
};

export const Default = {
  args: {
    loading: false,
    open: false,
    generatedApiKeyExpiration: new Date().toISOString(),
    generatedApiKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBpX2tleSIsImV4cCI6MTcxMjE1MzE3MCwiaWF0IjoxNzA5NzMzOTcxLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiYmZmMjA0YjUtMzJmMS00YmVlLThiMGItY2IxZGQwNTlmNGRjIiwibmJmIjoxNzA5NzMzOTcxLCJ0eXAiOiJCZWFyZXIifQ.0Lz0MwZaFpIGbSohnkiJ6AN5FFb5Vg5ZVhqM3fdUf3M',
    onGenerate: action('onGenerate'),
    onClose: action('onClose'),
  },
  render: (args) => {
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
  },
};

export const OnlyGenerationForm = {
  args: {
    loading: false,
    open: false,
    generatedApiKeyExpiration: null,
    generatedApiKey: null,
    onGenerate: action('onGenerate'),
    onClose: action('onClose'),
  },
  render: (args) => {
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
  },
};
