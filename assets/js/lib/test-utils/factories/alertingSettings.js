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

export const alertingSettingsSendFactory = baseAlertingSettingsFactory.params({
  smtpPassword: faker.animal.dog(),
});
