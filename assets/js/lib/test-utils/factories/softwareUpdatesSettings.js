/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';
import { Factory } from 'fishery';

export const softwareUpdatesSettingsFactory = Factory.define(() => ({
  url: faker.internet.url(),
  username: faker.internet.userName(),
  ca_uploaded_at: formatISO(faker.date.recent()),
}));
