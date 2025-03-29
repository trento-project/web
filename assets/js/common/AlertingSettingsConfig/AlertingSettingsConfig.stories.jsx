import AlertingSettingsConfig from './AlertingSettingsConfig';


export default {
  title: "Components/AlertingSettingsConfig",
  component: AlertingSettingsConfig,
  argTypes: {
    settings: {
      description: 'Current alerting settings values',
      control: {
        type: 'object',
      },
    },

    userAbilities: {
      description: 'Abilities of the current user',
      control: {
        type: 'array',
      },
    },

    onEditClick: {
      description: 'Callback that would run on edit button being clicked',
      control: {type: 'function'},
    },
  },
};

export const Default = {};

export const WithFilledInValues = {
  args: {
    settings: {
      alertingEnabled: true,
      smtpServer: "smtp.testdomain.com",
      smtpPort: 587,
      smtpUsername: "testuser",
      senderEmail: "admin@testdomain.com",
      recipientEmail: "trentousers@testdomain.com",
    },
  }
};

export const WithEditButtonEnalbed = {
  args: {
    userAbilities: [{ name: 'all', resource: 'all' }],
  },
};
