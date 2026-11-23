// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  getChecksFrequencySettings,
  getChecksFrequencySettingsErrors,
} from './checksFrequencySettings';

describe('Checks Frequency Settings selector', () => {
  const stateScenarios = [
    {
      loading: false,
      settings: {
        frequency: { value: 6, unit: 'hour' },
        enforced_from_env: false,
      },
      errors: [],
      editing: false,
      networkError: false,
    },
  ];

  it.each(stateScenarios)(
    'should return the checks frequency settings state',
    (checksFrequencySettings) => {
      expect(getChecksFrequencySettings({ checksFrequencySettings })).toEqual(
        checksFrequencySettings
      );
    }
  );

  it.each(stateScenarios)(
    'should return the checks frequency settings errors',
    (checksFrequencySettings) => {
      expect(
        getChecksFrequencySettingsErrors({ checksFrequencySettings })
      ).toEqual(checksFrequencySettings.errors);
    }
  );
});
