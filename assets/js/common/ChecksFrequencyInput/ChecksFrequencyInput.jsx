// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { map, noop } from 'lodash';

import Select from '@common/Select';
import {
  DISABLED,
  FREQUENCY_UNITS,
  toFrequency,
  toInterval,
} from '@lib/model/checksSchedule';

const SYSTEM_SETTING = 'system';

const unitOptions = (allowSystemSetting) => [
  ...(allowSystemSetting
    ? [{ value: SYSTEM_SETTING, label: 'System setting' }]
    : []),
  ...map(FREQUENCY_UNITS, ({ label }, unit) => ({ value: unit, label })),
  { value: DISABLED, label: 'Disabled' },
];

const valueOption = (value) => ({ value: String(value), label: String(value) });

/**
 * Checks execution interval as a value and a unit, from the allowed intervals,
 * or disabled. With `allowSystemSetting`, null means that the target follows
 * the global interval.
 */
function ChecksFrequencyInput({
  value,
  allowSystemSetting = false,
  disabled = false,
  onChange = noop,
}) {
  const frequency = value ? toFrequency(value) : null;
  const units = unitOptions(allowSystemSetting);
  const currentUnit = frequency ? frequency.unit : SYSTEM_SETTING;

  return (
    <div className="flex items-center space-x-4">
      {frequency && frequency.unit !== DISABLED && (
        <div className="w-32">
          <Select
            aria-label="Frequency value"
            options={FREQUENCY_UNITS[frequency.unit].values.map(valueOption)}
            value={valueOption(frequency.value)}
            isDisabled={disabled}
            onChange={(newValue) =>
              onChange(
                toInterval({ value: Number(newValue), unit: frequency.unit })
              )
            }
          />
        </div>
      )}
      <div className="w-40">
        <Select
          aria-label="Frequency unit"
          options={units}
          value={units.find(({ value: unit }) => unit === currentUnit)}
          isDisabled={disabled}
          onChange={(unit) => {
            if (unit === SYSTEM_SETTING) return onChange(null);
            if (unit === DISABLED) return onChange(DISABLED);
            return onChange(
              toInterval({ value: FREQUENCY_UNITS[unit].values[0], unit })
            );
          }}
        />
      </div>
    </div>
  );
}

export default ChecksFrequencyInput;
