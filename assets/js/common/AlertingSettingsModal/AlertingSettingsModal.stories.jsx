import { userEvent, within } from '@storybook/test';

import AlertingSettingsModal from './AlertingSettingsModal';

const validSettings = {
  alertingEnabled: true,
  smtpServer: 'smtp.testdomain.com',
  smtpPort: 587,
  smtpUsername: 'testuser',
  senderEmail: 'admin@testdomain.com',
  recipientEmail: 'trentousers@testdomain.com',
};

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
    previousSettings: {
      description: 'Alerting settings that could be configured',
      control: {
        type: 'object',
      },
    },

    errors: {
      description: 'Errors from failed submission',
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
      description: 'Whether submission is in progress',
      control: {
        type: 'boolean',
      },
    },

    onSave: {
      description: 'Callback that would run on submit',
      control: { type: 'function' },
    },

    onCancel: {
      description: 'Callback that would run on Cancel button clicked',
      control: { type: 'function' },
    },
  },
};

export const Default = {
  args: {
    open: true,
  },
};

export const WithPreviousSettings = {
  args: {
    previousSettings: validSettings,
    open: true,
  },
};

export const WithPreviousSettingsAndEditablePassword = {
  args: {
    previousSettings: validSettings,
    open: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
  },
};

export const WithErrors = {
  args: {
    previousSettings: {
      alertingEnabled: true,
      smtpServer: 'localhost',
      smtpPort: 70000,
      smtpUsername: 'inv4!d name',
      senderEmail: 'wrong_email.com',
      recipientEmail: 'mailey.com',
    },
    errors: [
      {
        detail: 'error from backend',
        source: { pointer: '/smtp_server' },
        title: 'Invalid value',
      },
      {
        detail: 'error from backend',
        source: { pointer: '/smtp_port' },
        title: 'Invalid value',
      },
      {
        detail: 'error from backend',
        source: { pointer: '/smtp_username' },
        title: 'Invalid value',
      },
      {
        detail: 'error from backend',
        source: { pointer: '/smtp_password' },
        title: 'Invalid value',
      },
      {
        detail: 'error from backend',
        source: { pointer: '/sender_email' },
        title: 'Invalid value',
      },
      {
        detail: 'error from backend',
        source: { pointer: '/recipient_email' },
        title: 'Invalid value',
      },
    ],
    open: true,
  },
};

export const Loading = {
  args: {
    previousSettings: validSettings,
    open: true,
    loading: true,
  },
};
