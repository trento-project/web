import SuseManagerClearSettingsModal from './SuseManagerClearSettingsModal';
import { action } from 'storybook/actions';

export default {
  title: 'Components/SuseManagerClearSettingsModal',
  component: SuseManagerClearSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
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
    onClearSettings: action('onClearSettings'),
    onCancel: action('onCancel'),
  },
};
