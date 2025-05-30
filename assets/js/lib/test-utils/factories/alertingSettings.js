import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

const baseAlertingSettingsFactory = Factory.define(() => ({
  alertingEnabled: true,
  smtpServer: faker.internet.domainName(),
  smtpPort: faker.number.int({ min: 1, max: 65535 }),
  smtpUsername: faker.internet.username(),
  senderEmail: faker.internet.email(),
  recipientEmail: faker.internet.email(),
}));

export const alertingSettingsFactory = baseAlertingSettingsFactory.params({
  enforcedFromEnv: false,
});

export const alertingSettingsToApiData = (alertingSettings) => ({
  enabled: alertingSettings.alertingEnabled,
  smtp_server: alertingSettings.smtpServer,
  smtp_port: alertingSettings.smtpPort,
  smtp_username: alertingSettings.smtpUsername,
  sender_email: alertingSettings.senderEmail,
  recipient_email: alertingSettings.recipientEmail,
  enforced_from_env: alertingSettings.enforcedFromEnv,
});

export const alertingSettingsSaveRequestFactory =
  baseAlertingSettingsFactory.params({
    smtpPassword: faker.animal.dog(),
  });

export const alertingSettingsSaveRequestToApiData = (saveAlertingSettings) => ({
  enabled: saveAlertingSettings.alertingEnabled,
  smtp_server: saveAlertingSettings.smtpServer,
  smtp_port: saveAlertingSettings.smtpPort,
  smtp_username: saveAlertingSettings.smtpUsername,
  smtp_password: saveAlertingSettings.smtpPassword,
  sender_email: saveAlertingSettings.senderEmail,
  recipient_email: saveAlertingSettings.recipientEmail,
});
