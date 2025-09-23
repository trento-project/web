import GeneratePersonalAccessTokenModal from './GeneratePersonalAccessTokenModal';

export default {
  title: 'Components/GeneratePersonalAccessTokenModal',
  component: GeneratePersonalAccessTokenModal,
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
