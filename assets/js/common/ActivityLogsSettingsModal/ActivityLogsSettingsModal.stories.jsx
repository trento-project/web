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

export const WithErrors = {
  args: {
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: [
      {
        detail: "can't be blank",
        source: { pointer: '/retentionTime' },
        title: 'Invalid value',
      },
    ],
  },
};
