// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { checksFrequencyFactory } from './checksFrequencySettings';

export const checksScheduleFactory = Factory.define(() => ({
  enabled: true,
  frequency: checksFrequencyFactory.build(),
  global: faker.datatype.boolean(),
  next_execution_at: faker.date.soon().toISOString(),
}));
