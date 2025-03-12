import React from 'react';

import OperationForbiddenModal from './OperationForbiddenModal';

export default {
  title: 'Components/OperationForbiddenModal',
  component: OperationForbiddenModal,
  argTypes: {
    operation: {
      type: 'string',
      description: 'Operation name',
      control: {
        type: 'text',
      },
    },
    errors: {
      description: 'Authorization errors as string',
      control: 'array',
    },
    isOpen: {
      description: 'Modal is open',
      control: 'boolean',
    },
    onCancel: {
      description: 'Closes the modal',
    },
  },
  args: {
    operation: 'My operation',
    errors: ['Authorization error 1', 'Authorization error 2'],
    isOpen: true,
  },
};

export function Default(args) {
  return (
    <OperationForbiddenModal {...args}>
      My operation forbidden additional information
    </OperationForbiddenModal>
  );
}
