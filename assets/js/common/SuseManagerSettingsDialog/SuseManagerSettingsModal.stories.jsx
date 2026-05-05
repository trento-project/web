import { action } from 'storybook/actions';

import SuseManagerSettingsModal from './SuseManagerSettingsModal';

export default {
  title: 'Components/SuseManagerSettingsModal',
  component: SuseManagerSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Whether the settings are loading or submitting',
      control: { type: 'boolean' },
    },
    initialUsername: {
      description: 'Initial SUSE Manager username',
      control: { type: 'text' },
    },
    initialUrl: {
      description: 'Initial SUSE Manager URL',
      control: { type: 'text' },
    },
    certUploadDate: {
      description: 'Certificate upload date',
      control: { type: 'date' },
    },
    errors: {
      description: 'OpenAPI errors coming from backend validation',
      control: { type: 'object' },
    },
    onSave: {
      description:
        'Callback function invoked when the settings form is submitted',
      action: 'onSave',
    },
    onCancel: {
      description:
        'Callback function invoked when the modal is closed or cancelled',
      action: 'onCancel',
    },
    onClearErrors: {
      description:
        'Callback function invoked to clear validation errors from form inputs',
      action: 'onClearErrors',
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    open: false,
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    onClearErrors: action('onClearErrors'),
  },
};

export const WithPreviousSettings = {
  args: {
    ...Default.args,
    open: false,
    initialUrl: 'https://demo.trento-project.io/suse_manager',
    initialUsername: 'trentorulez',
    certUploadDate: '2024-01-29T08:41:47.291734Z',
  },
};

export const WithErrors = {
  args: {
    ...Default.args,
    open: false,
    initialUrl: 'https://demo.trento-project.io/suse_manager',
    initialUsername: 'trentorulez',
    certUploadDate: '2024-01-29T08:41:47.291734Z',
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
    ],
  },
};

export const WithAllErrors = {
  args: {
    ...Default.args,
    open: false,
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/password' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
    ],
  },
};

export const Loading = {
  args: {
    ...Default.args,
    open: false,
    certUploadDate: '2024-01-29T08:41:47.291734Z',
    loading: true,
  },
};
