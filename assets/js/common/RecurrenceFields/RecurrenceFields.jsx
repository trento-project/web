// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { noop } from 'lodash';

import { InputNumber } from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';
import { REPEAT_UNITS, WEEKDAYS } from '@lib/model/recurrence';

const inputClassName =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700';

export const optionOf = (options, value) =>
  options.find((option) => option.value === value);

// Label and field of a form laid out in a six columns grid
export function FieldRow({ label, children }) {
  return (
    <>
      <Label className="col-span-2">{label}</Label>
      <div className="col-span-4">{children}</div>
    </>
  );
}

export function ValueAndUnit({ label, value, unit, units, onChange = noop }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-32">
        <InputNumber
          aria-label={label}
          className="!h-9"
          min="1"
          value={value}
          onChange={(newValue) =>
            onChange({ value: String(newValue ?? ''), unit })
          }
        />
      </div>
      <div className="w-40">
        <Select
          aria-label={`${label} unit`}
          options={units}
          value={optionOf(units, unit)}
          onChange={(newUnit) => onChange({ value, unit: newUnit })}
        />
      </div>
    </div>
  );
}

/**
 * Rows of a one-time or periodic schedule, to be placed in a FieldRow grid:
 * date and start time, then repeat every and days of the week when periodic.
 * `afterTime` is rendered right after the start time.
 */
function RecurrenceFields({
  form,
  periodic,
  afterTime = null,
  onChange = noop,
}) {
  return (
    <>
      <FieldRow label="Date">
        <input
          type="date"
          aria-label="Date"
          className={inputClassName}
          value={form.date}
          onChange={({ target: { value } }) => onChange({ date: value })}
        />
      </FieldRow>
      <FieldRow label="Start Time">
        <input
          type="time"
          aria-label="Start Time"
          className={inputClassName}
          value={form.time}
          onChange={({ target: { value } }) => onChange({ time: value })}
        />
      </FieldRow>

      {afterTime}

      {periodic && (
        <FieldRow label="Repeat every">
          <ValueAndUnit
            label="Repeat every"
            value={form.repeatValue}
            unit={form.repeatUnit}
            units={REPEAT_UNITS}
            onChange={({ value, unit }) =>
              onChange({ repeatValue: value, repeatUnit: unit })
            }
          />
        </FieldRow>
      )}

      {periodic && form.repeatUnit === 'weeks' && (
        <FieldRow label="Day/s">
          <Select
            aria-label="Days of the week"
            isMulti
            closeMenuOnSelect={false}
            placeholder="Select days"
            options={WEEKDAYS}
            initialValues={WEEKDAYS.filter(({ value }) =>
              form.weekdays.includes(value)
            )}
            getOptionValue={(option) => option.value.toString()}
            onChange={(weekdays) => onChange({ weekdays: weekdays.sort() })}
          />
        </FieldRow>
      )}
    </>
  );
}

export default RecurrenceFields;
