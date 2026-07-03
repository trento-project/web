// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';
import { aiConfigurationFactory } from '@lib/test-utils/factories';

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
      type: 'function',
      description: 'Creates or updates AI configuration',
    },
    onUpdate: {
      type: 'function',
      description: 'Updates AI configuration',
    },
    onClear: {
      type: 'function',
      description: 'Clears AI configuration',
    },
  },
  args: {
    aiConfiguration: {},
    onClear: action('Clear button clicked!'),
  },
};

export const Configured = {
  args: {
    aiConfiguration: aiConfigurationFactory.build(),
  },
};

export const WithUnmappedModel = {
  args: {
    aiConfiguration: aiConfigurationFactory.build({
      provider: 'custom_provider',
      model: 'custom_model',
    }),
  },
};

export const WithoutAIConfiguration = {};
