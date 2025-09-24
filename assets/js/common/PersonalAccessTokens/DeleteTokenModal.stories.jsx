import DeleteTokenModal from './DeleteTokenModal';

export default {
  title: 'Components/PersonalAccessTokens/DeleteTokenModal',
  component: DeleteTokenModal,
  argTypes: {
    name: {
      description: 'Name of the token',
      control: 'text',
    },
    isOpen: {
      description: 'Opens the modal',
      control: 'boolean',
    },
    onDelete: {
      type: 'function',
      description: 'Deletes the personal access token',
    },
    onClose: {
      type: 'function',
      description: 'Closes the modal',
    },
  },
};

export const Default = {
  args: {
    name: 'Trento PAT',
    isOpen: true,
  },
};
