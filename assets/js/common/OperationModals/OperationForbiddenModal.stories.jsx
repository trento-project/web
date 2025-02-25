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
    isOpen: true,
  },
};

export function Default(args) {
  return (
    <OperationForbiddenModal {...args}>
      My operation forbidden description
    </OperationForbiddenModal>
  );
}

export function WithMarkdown(args) {
  return (
    <OperationForbiddenModal {...args} operation="With markdown">{`
The **OperationForbiddenModal** renders markdown. A list for example:
- Value 1
- Value 2`}</OperationForbiddenModal>
  );
}
