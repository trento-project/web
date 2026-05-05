import { aiConfigurationFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import AIConfiguration from './AIConfiguration';

export default {
  title: 'Components/AIConfiguration',
  component: AIConfiguration,
  argTypes: {
    aiConfiguration: {
      description: 'Current user AI configuration',
      control: { type: 'object' },
    },
    onCreate: {
      description: 'Creates or updates AI configuration',
      action: 'onCreate',
    },
    onUpdate: {
      description: 'Updates AI configuration',
      action: 'onUpdate',
    },
    onEditClick: {
      description: 'Edit button click handler',
      action: 'onEditClick',
    },
    className: {
      type: 'string',
      description: 'CSS classes to apply to the AI configuration container',
      control: { type: 'text' },
    },
  },
  args: {
    aiConfiguration: {},
    onEditClick: action('onEditClick'),
  },
};

export const Default = {
  args: {
    aiConfiguration: aiConfigurationFactory.build(),
  },
};

export const WithUnmappedModel = {
  args: {
    ...Default.args,
    aiConfiguration: aiConfigurationFactory.build({
      provider: 'custom_provider',
      model: 'custom_model',
    }),
  },
};

export const WithoutAIConfiguration = {};
