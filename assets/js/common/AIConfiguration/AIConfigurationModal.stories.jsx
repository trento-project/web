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
    onUpdate: {
      description: 'Updates AI configuration',
      action: 'onUpdate',
    },
    onCancel: {
      description: 'Closes the modal',
      action: 'onCancel',
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
    onSave: {
      description:
        'Callback function triggered when saving a new AI configuration',
      action: 'onSave',
    },
  },
};

export const Default = {
  args: {
    open: true,
    aiProviders: {},
    aiConfiguration: {},
    saving: false,
    errors: [],
    onCancel: () => {},
    onSave: () => {},
    onUpdate: () => {},
  },
};

export const WithUnmappedProvider = {
  args: {
    open: true,
    aiProviders: {
      // eslint-disable-next-line no-undef
      ...config.aiProviders,
      custom_provider: ['custom_model'],
    },
    onCancel: () => {},
    onSave: () => {},
    onUpdate: () => {},
  },
};

const repeatedModel = faker.lorem.word();

export const WithModelForManyProviders = {
  args: {
    open: true,
    aiProviders: {
      // eslint-disable-next-line no-undef
      ...config.aiProviders,
      custom_provider: [repeatedModel],
      another_custom_provider: [repeatedModel],
    },
    onCancel: () => {},
    onSave: () => {},
    onUpdate: () => {},
  },
};

export const WithPreviouslySetConfiguration = {
  args: {
    open: true,
    aiConfiguration: aiConfigurationFactory.build(),
    onCancel: () => {},
    onSave: () => {},
    onUpdate: () => {},
  },
};

export const Saving = {
  args: {
    open: true,
    aiConfiguration: aiConfigurationFactory.build(),
    saving: true,
    onCancel: () => {},
    onSave: () => {},
    onUpdate: () => {},
  },
};

export const WithErrors = {
  args: {
    open: true,
    aiConfiguration: aiConfigurationFactory.build(),
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/api_key' },
        title: 'Invalid value',
      },
    ],
    onCancel: () => {},
    onSave: () => {},
    onUpdate: () => {},
  },
};
