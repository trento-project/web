import GenerateTokenModal from './GenerateTokenModal';

export default {
  title: 'Components/PersonalAccessTokens/GenerateTokenModal',
  component: GenerateTokenModal,
  argTypes: {
    isOpen: {
      description: 'Opens the modal',
      control: 'boolean',
    },
    onGenerate: {
      type: 'function',
      description: 'Generate personal access token',
    },
    onClose: {
      type: 'function',
      description: 'Closes the modal',
    },
  },
};

export const Default = {
  args: {
    isOpen: true,
  },
};
