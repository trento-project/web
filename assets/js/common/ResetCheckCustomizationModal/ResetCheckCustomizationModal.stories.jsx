import { faker } from '@faker-js/faker';
import { action } from 'storybook/actions';

import ResetCheckCustomizationModal from '.';

export default {
  title: 'Patterns/ResetCheckCustomizationModal',
  component: ResetCheckCustomizationModal,
  argTypes: {
    checkId: {
      description: 'The check ID for which the customization will be reset',
    },
    open: {
      description: 'Sets the visibility of the modal',
    },
    onReset: {
      description: 'Callback when the Reset button is clicked',
      action: 'onReset',
    },
    onCancel: {
      description: 'Callback when the Cancel button is clicked',
      action: 'onCancel',
    },
  },
};

export const Default = {
  args: {
    checkId: faker.lorem.word(),
    open: true,
    onReset: action('onReset'),
    onCancel: action('onCancel'),
  },
};

export const Closed = {
  args: {
    ...Default.args,
    open: false,
  },
};
