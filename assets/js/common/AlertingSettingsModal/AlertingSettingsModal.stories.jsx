import AlertingSettingsModal from './AlertingSettingsModal';

export default {
  title: 'Components/AlertingSettingsModal',
  component: AlertingSettingsModal,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
  },
  argTypes: {
    settings: {
      description: 'Alerting settings that could be configured',
      control: {
        type: 'object',
      },
    },

    open: {
      description: 'Whether the dialog is open or not',
      type: 'boolean',
      control: {
        type: 'boolean',
      },
    },

    loading: {
      description: 'Whether the settings are loading or submitting',
      type: 'boolean',
      control: {
        type: 'boolean',
      },
    },

    errors: {
      description: 'OpenAPI errors coming from backend validation',
      type: "object",
    },

    onCancel: {
      description: 'Callback when the Cancel button is clicked',
      control: { type: 'function' },
    },
  },
};


export const Default = {
  args: {
    open: true,
  }
};


export const WithPreviousSettings = {
  args: {
    settings: {
      alertingEnabled: true,
      smtpServer: "smtp.testdomain.com",
      smtpPort: 587,
      smtpUsername: "testuser",
      senderEmail: "admin@testdomain.com",
      recipientEmail: "trentousers@testdomain.com",
    },
    open: true,
  }
};

export const WithErrors = {
  args: {
    settings: {
      alertingEnabled: true,
      smtpServer: "localhost",
      smtpPort: 70000,
      smtpUsername: "inv4!d name",
      senderEmail: "wrong_email.com",
      recipientEmail: "mailey.com",
    },
    open: true,
    errors: [
      {
        detail: "error from backend",
        source: { pointer: '/smtpServer' },
        title: 'Invalid value',
      },
      {
        detail: "error from backend",
        source: { pointer: '/smtpPort' },
        title: 'Invalid value',
      },
      {
        detail: "error from backend",
        source: { pointer: '/smtpUsername' },
        title: 'Invalid value',
      },
      {
        detail: "error from backend",
        source: { pointer: '/smtpPassword' },
        title: 'Invalid value',
      },
      {
        detail: "error from backend",
        source: { pointer: '/senderEmail' },
        title: 'Invalid value',
      },
      {
        detail: "error from backend",
        source: { pointer: '/recipientEmail' },
        title: 'Invalid value',
      },
    ],
  }
};

export const Loading = {
  args: {
    settings: {
      alertingEnabled: true,
      smtpServer: "smtp.testdomain.com",
      smptPort: 587,
      smtpUsername: "testuser",
      senderEmail: "admin@testdomain.com",
      recipientEmail: "trentousers@testdomain.com",
    },
    open: true,
    loading: true,
  }
};
