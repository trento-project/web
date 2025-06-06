import { action } from 'storybook/actions';
import { faker } from '@faker-js/faker';

import ResetCheckCustomizationModal from '.';

export default {
  title: 'Patterns/ResetCheckCustomizationModal',
  component: ResetCheckCustomizationModal,
  argTypes: {
    checkId: {
      type: 'string',
      description: 'The check ID for which the customization will be reset',
    },
    open: {
      type: 'boolean',
      description: 'Sets the visibility of the modal',
    },
    onReset: {
      type: 'function',
      description: 'Callback when the Reset button is clicked',
    },
    onCancel: {
      type: 'function',
      description: 'Callback when the Cancel button is clicked',
    },
  },
};

export const Default = {
  args: {
    checkId: faker.lorem.word(),
    onReset: action('reset clicked'),
    onCancel: action('cancel clicked'),
  },
};
