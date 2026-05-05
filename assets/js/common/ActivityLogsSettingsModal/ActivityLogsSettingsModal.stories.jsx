import ActivityLogsSettingsModal from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/ActivityLogsSettingsModal',
  component: ActivityLogsSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
    },
    initialRetentionTime: {
      description:
        'A structured `{value,unit}` object that defines a retention time interval. `unit` is one of `day`, `week`, `month`, `year`.',
      control: { type: 'object' },
    },
    errors: {
      description: 'The validation error to be shown',
      control: { type: 'object' },
    },
    loading: {
      type: 'boolean',
      description:
        'Boolean flag indicating whether a save operation is in progress to disable the Save Settings button',
      control: { type: 'boolean' },
    },
    onSave: {
      description:
        'Callback function invoked when the Save Settings button is clicked',
      action: 'onSave',
    },
    onCancel: {
      description:
        'Callback function invoked when the Cancel button is clicked or the modal is closed',
      action: 'onCancel',
    },
    onClearErrors: {
      description:
        'Callback function invoked when the retention time is modified to clear previous validation errors',
      action: 'onClearErrors',
    },
  },
};

export const Default = {
  args: {
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: [],
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    onClearErrors: action('onClearErrors'),
  },
};

export const WithFieldValidationError = {
  args: {
    ...Default.args,
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: [
      {
        detail: 'must be greater than or equal to 1',
        source: { pointer: '/retention_time/value' },
        title: 'Invalid value',
      },
    ],
  },
};

export const WithCompositeFieldValidationError = {
  args: {
    ...Default.args,
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: [
      {
        detail: 'must be greater than or equal to 1',
        source: { pointer: '/retention_time/value' },
        title: 'Invalid value',
      },
      {
        detail: 'invalid time unit',
        source: { pointer: '/retention_time/unit' },
        title: 'Invalid unit',
      },
    ],
  },
};

export const WithGlobalError = {
  args: {
    ...Default.args,
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: ['any error'],
  },
};
