import { fireEvent } from '@testing-library/react';
import { userEvent, within } from '@storybook/test';

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
    previousSettings: {
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

    onSave: {
      description: 'Callback that would run on submit',
      control: {type: 'function'},
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
  }
};


export const WithPreviousSettings = {
  args: {
    previousSettings: {
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

export const WithPreviousSettingsAndEditablePassword = {
  args: {
    previousSettings: {
      alertingEnabled: true,
      smtpServer: "smtp.testdomain.com",
      smtpPort: 587,
      smtpUsername: "testuser",
      senderEmail: "admin@testdomain.com",
      recipientEmail: "trentousers@testdomain.com",
    },
    open: true,
  },
  play: async ({ canvasElement}) => {
    const canvas = within(canvasElement.parentElement);
    await userEvent.click(canvas.getByRole('button', {name: "Remove"}))
  },
}

export const WithErrors = {
  args: {
    previousSettings: {
      alertingEnabled: true,
      smtpServer: "localhost",
      smtpPort: 70000,
      smtpUsername: "inv4!d name",
      senderEmail: "wrong_email.com",
      recipientEmail: "mailey.com",
    },
    // onSave: make_fake_return_errors_on_save({
    //   smtpServerError: "Error from backend",
    //   smtpPortError: "Error from backend",
    //   smtpUsernameError: "Error from backend",
    //   smttPasswordError: "Error from backend",
    //   senderEmailError: "Error from backend",
    //   recipientEmailError: "Error from backend",
    // }),
    onSave: (_settings) => {
      const errors = [
        {
          detail: "error from backend",
          source: { pointer: '/smtp_server' },
          title: 'Invalid value',
        },
        {
          detail: "error from backend",
          source: { pointer: '/smtp_port' },
          title: 'Invalid value',
        },
        {
          detail: "error from backend",
          source: { pointer: '/smtp_username' },
          title: 'Invalid value',
        },
        {
          detail: "error from backend",
          source: { pointer: '/smtp_password' },
          title: 'Invalid value',
        },
        {
          detail: "error from backend",
          source: { pointer: '/sender_email' },
          title: 'Invalid value',
        },
        {
          detail: "error from backend",
          source: { pointer: '/recipient_email' },
          title: 'Invalid value',
        },
      ]

      throw {
        response: {
          data: errors
        }
      }
    },
    open: true,
  },
  play: async ({ context, canvasElement }) => {
    const canvas = within(canvasElement.parentElement);

    await WithPreviousSettingsAndEditablePassword.play(context)
    // XXX: For some reason, this doesn't work, fallback to fireEvent.
    // userEvent.click(canvas.getByRole('button', {name: "Save Settings"}));
    fireEvent.click(canvas.getByRole('button', {name: "Save Settings"}));
  },
};

// TODO: try long-sleep equivalent
// export const WithLoading = {
//   args: {
//     previousSettings: {
//       alertingEnabled: true,
//       smtpServer: "smtp.testdomain.com",
//       smtpPort: 587,
//       smtpUsername: "testuser",
//       senderEmail: "admin@testdomain.com",
//       recipientEmail: "trentousers@testdomain.com",
//     },
//     onSave: {},
//     open: true,
//   },
//   play: async ({ canvasElement}) => {
//     const canvas = within(canvasElement.parentElement);
//   },
// }
