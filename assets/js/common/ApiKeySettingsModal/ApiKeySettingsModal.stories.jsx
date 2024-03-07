import ApiKeySettingsModal from './ApiKeySettingsModal';

export default {
  title: 'Components/ApiKeySettingsModal',
  component: ApiKeySettingsModal,
  argTypes: {
    open: {
      description: 'Whether the modal is open or not',
      control: {
        type: 'boolean',
      },
    },
    loading: {
      description: 'Whether the settings are loading or submitting',
      control: {
        type: 'boolean',
      },
    },
  },
};

export const Default = {
  args: {
    open: false,
  },
};
