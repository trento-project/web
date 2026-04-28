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
    time: {
      description: "The initial retention time object with {value, unit} structure for the TimeSpan component"
    },
    error: {
      description: "Boolean flag indicating whether a validation error exists for the retention time input field"
    },
    onChange: {
      description: "Callback function invoked when the retention time value or unit is changed by the user"
    },
    text: {
      description: "The error message text to display in the Error component for validation or global errors"
    },
    loading: {
      description: "Boolean flag indicating whether a save operation is in progress to disable the Save Settings button"
    },
    onSave: {
      description: "Callback function invoked when the Save Settings button is clicked"
    },
    onCancel: {
      description: "Callback function invoked when the Cancel button is clicked or the modal is closed"
    },
    onClearErrors: {
      description: "Callback function invoked when the retention time is modified to clear previous validation errors"
    }
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

export const WithGlobalError = {
  args: {
    open: false,
    initialRetentionTime: { value: 1, unit: 'month' },
    errors: ['any error'],
  },
};
