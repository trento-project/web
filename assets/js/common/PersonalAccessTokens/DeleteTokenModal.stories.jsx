import DeleteTokenModal from './DeleteTokenModal';

import { action } from 'storybook/actions';
export default {
  title: 'Components/PersonalAccessTokens/DeleteTokenModal',
  component: DeleteTokenModal,
  argTypes: {
    name: {
      description: 'Name of the token',
      control: { type: 'text' },
    },
    isOpen: {
      description: 'Opens the modal',
      control: { type: 'boolean' },
    },
    onDelete: {
      description: 'Deletes the personal access token',
      action: 'onDelete',
    },
    onClose: {
      description: 'Closes the modal',
      action: 'onClose',
    },
  },
};

export const Default = {
  args: {
    name: 'Trento PAT',
    isOpen: true,
    onDelete: action('onDelete'),
    onClose: action('onClose'),
  },
};
