// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';
import { action } from 'storybook/actions';

import NewTokenModal from './NewTokenModal';

export default {
  title: 'Components/PersonalAccessTokens/NewTokenModal',
  component: NewTokenModal,
  argTypes: {
    accessToken: {
      description: 'New personal access token',
      control: { type: 'text' },
    },
    isOpen: {
      description: 'Opens the modal',
      control: { type: 'boolean' },
    },
    onClose: {
      description: 'Closes the modal',
      action: 'onClose',
    },
  },
};

export const Default = {
  args: {
    accessToken: faker.internet.jwt(),
    isOpen: true,
    onClose: action('onClose'),
  },
};
