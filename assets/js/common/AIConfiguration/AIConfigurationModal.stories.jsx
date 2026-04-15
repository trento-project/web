import { action } from 'storybook/actions';
import { faker } from '@faker-js/faker';
import { aiConfigurationFactory } from '@lib/test-utils/factories';

import AIConfigurationModal from './AIConfigurationModal';

export default {
  title: 'Components/AIConfiguration/AIConfigurationModal',
  component: AIConfigurationModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: {
        type: 'boolean',
      },
    },
    aiProviders: {
      description: 'Available AI providers and their models',
      control: {
        type: 'object',
      },
    },
    aiConfiguration: {
      description: 'Current user AI configuration',
      control: {
        type: 'object',
      },
    },
    onCreate: {
      type: 'function',
      description: 'Creates or updates AI configuration',
    },
    onUpdate: {
      type: 'function',
      description: 'Updates AI configuration',
    },
    onCancel: {
      type: 'function',
      description: 'Closes the modal',
    },
    saving: {
      description: 'Whether the settings are loading or submitting',
      control: {
        type: 'boolean',
      },
    },
    errors: {
      description: 'OpenAPI errors coming from backend validation',
      control: {
        type: 'object',
      },
    },
  },
  args: {
    open: false,
    onCreate: () => action('edit clicked'),
    onUpdate: () => action('update clicked'),
  },
};

export const Default = {};

export const WithUnmappedProvider = {
  args: {
    aiProviders: {
      // eslint-disable-next-line no-undef
      ...config.aiProviders,
      custom_provider: ['custom_model'],
    },
  },
};

const repeatedModel = faker.lorem.word();

export const WithModelForManyProviders = {
  args: {
    aiProviders: {
      // eslint-disable-next-line no-undef
      ...config.aiProviders,
      custom_provider: [repeatedModel],
      another_custom_provider: [repeatedModel],
    },
  },
};

export const WithPreviouslySetConfiguration = {
  args: {
    aiConfiguration: aiConfigurationFactory.build(),
  },
};

export const Saving = {
  args: {
    aiConfiguration: aiConfigurationFactory.build(),
    saving: true,
  },
};

export const WithErrors = {
  args: {
    aiConfiguration: aiConfigurationFactory.build(),
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/api_key' },
        title: 'Invalid value',
      },
    ],
  },
};
