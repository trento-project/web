import GenerateTokenModal from './GenerateTokenModal';

export default {
  title: 'Components/PersonalAccessTokens/GenerateTokenModal',
  component: GenerateTokenModal,
  argTypes: {
    isOpen: {
      description: 'Opens the modal',
      control: { type: 'boolean' },
    },
    onGenerate: {
      description: 'Generate personal access token',
      action: 'onGenerate',
    },
    onClose: {
      description: 'Closes the modal',
      action: 'onClose',
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
    },
  },
};

export const Default = {
  args: {
    isOpen: true,
  },
};
