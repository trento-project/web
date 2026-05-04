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
      action: 'onClearSettings',
    },
    onCancel: {
      description: 'Callback used to cancel the clearing of settings',
      action: 'onCancel',
    },
  },
};

export const Default = {
  args: {
    open: false,
  },
};
