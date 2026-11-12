// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { CHECKS_FREQUENCY_UNITS } from '@lib/model/checksFrequency';

export const checksFrequencyFactory = Factory.define(({ params }) => {
  const unit = params.unit ?? faker.helpers.objectKey(CHECKS_FREQUENCY_UNITS);

  return {
    value: faker.helpers.arrayElement(CHECKS_FREQUENCY_UNITS[unit]),
    unit,
  };
});

export const checksFrequencySettingsFactory = Factory.define(() => ({
  enabled: true,
  frequency: checksFrequencyFactory.build(),
  enforced_from_env: false,
}));
