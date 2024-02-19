import SuseManagerClearSettingsModal from './SuseManagerClearSettingsModal';

export default {
  title: 'Components/SuseManagerClearSettingsModal',
  component: SuseManagerClearSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: {
        type: 'boolean',
      },
    },
    onClearSettings: {
      description: 'Callback used to confirm the clearing of settings',
      control: {
        type: 'function',
      },
    },
    onCancel: {
      description: 'Callback used to cancel the clearing of settings',
      control: {
        type: 'function',
      },
    },
  },
};

export const Default = {
  args: {
    open: false,
  },
};
