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
      control: 'test',
    },
    personalAccessTokens: {
      description: 'Current user personal access tokens',
      control: { type: 'array' },
    },
    generateTokenAvailable: {
      description: 'Generate Token button is available or not',
      control: 'boolean',
    },
    generatedAccessToken: {
      description:
        'Generated personal access token. Used to display the GeneratedAccessTokenModal modal',
      control: 'text',
    },
    onDeleteToken: {
      description: 'Deletes personal access token',
      control: 'boolean',
    },
    onGenerateToken: {
      type: 'function',
      description: 'Generates personal access token',
    },
    onCloseGeneratedTokenModal: {
      type: 'function',
      description: 'Closes new personal access token modal',
    },
  },
  args: {
    generatedAccessToken: null,
  },
};

export const Default = {
  args: {
    personalAccessTokens: personalAccessTokenFactory.buildList(3),
    generatedAccessToken: null,
    generateTokenAvailable: true,
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
