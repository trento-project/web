import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';

import { personalAccessTokenFactory } from '@lib/test-utils/factories';

import PersonalAccessTokens from './PersonalAccessTokens';

export default {
  title: 'Components/PersonalAccessTokens',
  component: PersonalAccessTokens,
  argTypes: {
    className: {
      description: 'CSS classes',
      control: { type: 'text' },
    },
    personalAccessTokens: {
      description: 'Current user personal access tokens',
      control: { type: 'object' },
    },
    generateTokenAvailable: {
      description: 'Generate Token button is available or not',
      control: { type: 'boolean' },
    },
    generatedAccessToken: {
      description:
        'Generated personal access token. Used to display the GeneratedAccessTokenModal modal',
      control: { type: 'text' },
    },
    onDeleteToken: {
      description: 'Deletes personal access token',
      action: 'onDeleteToken',
    },
    onGenerateToken: {
      description: 'Generates personal access token',
      action: 'onGenerateToken',
    },
    onCloseGeneratedTokenModal: {
      description: 'Closes new personal access token modal',
      action: 'onCloseGeneratedTokenModal',
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    personalAccessTokens: personalAccessTokenFactory.buildList(3),
    generatedAccessToken: null,
    generateTokenAvailable: true,
    className: '',
    onDeleteToken: () => {},
    onGenerateToken: () => {},
    onCloseGeneratedTokenModal: () => {},
    timezone: 'Etc/UTC',
  },
};

export const Empty = {
  args: {
    ...Default.args,
    personalAccessTokens: [],
  },
};

export const ExpiredToken = {
  args: {
    ...Default.args,
    personalAccessTokens: personalAccessTokenFactory.buildList(1, {
      expires_at: formatISO(faker.date.past()),
    }),
  },
};

export const TokenNeverExpires = {
  args: {
    ...Default.args,
    personalAccessTokens: personalAccessTokenFactory.buildList(1, {
      expires_at: null,
    }),
  },
};

export const TokenGenerationDisabled = {
  args: {
    ...Default.args,
    generateTokenAvailable: false,
  },
};
