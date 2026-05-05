import { action } from 'storybook/actions';

import GenerateTokenModal from './GenerateTokenModal';

export default {
  title: 'Components/PersonalAccessTokens/GenerateTokenModal',
  component: GenerateTokenModal,
  argTypes: {
    isOpen: {
      description: 'Opens the modal',
      control: { type: 'boolean' },
    },
    onGenerate: {
      description: 'Generate personal access token',
      action: 'onGenerate',
    },
    onClose: {
      description: 'Closes the modal',
      action: 'onClose',
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    isOpen: true,
    onGenerate: action('onGenerate'),
    onClose: action('onClose'),
  },
};
