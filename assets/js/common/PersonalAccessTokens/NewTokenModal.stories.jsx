import { faker } from '@faker-js/faker';

import NewTokenModal from './NewTokenModal';

export default {
  title: 'Components/PersonalAccessTokens/NewTokenModal',
  component: NewTokenModal,
  argTypes: {
    accessToken: {
      description: 'New personal access token',
      control: 'text',
    },
    isOpen: {
      description: 'Opens the modal',
      control: 'boolean',
    },
    onClose: {
      type: 'function',
      description: 'Closes the modal',
    },
  },
};

export const Default = {
  args: {
    accessToken: faker.internet.jwt(),
    isOpen: true,
  },
};
