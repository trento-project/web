import OperationModals from '.';

import { action } from 'storybook/actions';
export default {
  title: 'Components/OperationModal',
  component: OperationModals,
  argTypes: {
    dontShowAgainDisclaimerChecked: {
      description: 'Whether the dont show again disclaimer is checked',
      control: { type: 'boolean' },
    },
    setDontShowAgainDisclaimerChecked: {
      description:
        'Callback function invoked when dont show again disclaimer checked',
      action: 'setDontShowAgainDisclaimerChecked',
    },
    operationText: {
      description: 'Text label for the operation button',
      control: { type: 'text' },
    },
    title: {
      description: 'Title text for the component',
      control: { type: 'text' },
    },
    description: {
      description: 'Description text for the modal',
      control: { type: 'text' },
    },
    requestDisabled: {
      description: 'Whether the request button is disabled',
      control: { type: 'boolean' },
    },
    isOpen: {
      description: 'Whether the component is open or visible',
      control: { type: 'boolean' },
    },
    onRequest: {
      description: 'Callback function invoked when request',
      action: 'onRequest',
    },
    onCancel: {
      description: 'Callback function invoked when cancel',
      action: 'onCancel',
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    dontShowAgainDisclaimerChecked: false,
    operationText: 'Confirm',
    title: 'Confirm Operation',
    description: 'Are you sure you want to proceed?',
    requestDisabled: false,
    isOpen: true,
    children: 'Operation details will be displayed here',
    setDontShowAgainDisclaimerChecked: action(
      'setDontShowAgainDisclaimerChecked'
    ),
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};
