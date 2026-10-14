// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';
import { Factory } from 'fishery';

export const softwareUpdatesSettingsFactory = Factory.define(() => ({
  url: faker.internet.url(),
  username: faker.internet.username(),
  ca_uploaded_at: formatISO(faker.date.recent()),
}));
