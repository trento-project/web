import OperationForbiddenModal from './OperationForbiddenModal';
import { action } from 'storybook/actions';

export default {
  title: 'Components/OperationForbiddenModal',
  component: OperationForbiddenModal,
  argTypes: {
    operation: {
      type: 'string',
      description: 'Operation name',
      control: { type: 'text' },
    },
    errors: {
      description: 'Authorization errors as string',
      control: { type: 'object' },
    },
    isOpen: {
      description: 'Modal is open',
      control: { type: 'boolean' },
    },
    onCancel: {
      description: 'Closes the modal',
      action: 'onCancel',
    },
  },
  args: {
    operation: 'My operation',
    errors: ['Authorization error 1', 'Authorization error 2'],
    isOpen: true,
    onCancel: action('onCancel'),
  },
};

export const Default = {
  args: {
    operation: '',
    errors: [],
    isOpen: false,
    onCancel: action('onCancel'),
  },
};
