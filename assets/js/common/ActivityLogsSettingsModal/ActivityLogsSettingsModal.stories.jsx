import ActivityLogsSettingsModal from '.';

export default {
  title: 'Components/ActivityLogsSettingsModal',
  component: ActivityLogsSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: {
        type: 'boolean',
      },
    },
    initialRetentionTime: {
      description:
        'A structured `{value,unit}` object that defines a retention time interval. `unit` is one of `day`, `week`, `month`, `year`.',
      control: {
        type: 'object',
      },
    },
    errors: {
      description: 'The validation error to be shown',
    },
  },
};

export const Default = {
  args: {
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: [],
  },
};

export const WithFieldValidationError = {
  args: {
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

export const WithGenericError = {
  args: {
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: ['any error'],
  },
};
