import DeletePersonalAccessTokenModal from './DeletePersonalAccessTokenModal';

export default {
  title: 'Components/DeletePersonalAccessTokenModal',
  component: DeletePersonalAccessTokenModal,
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
