// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import ChecksFrequencyInput from '@common/ChecksFrequencyInput';
import { InputNumber } from '@common/Input';
import Label from '@common/Label';
import Modal from '@common/Modal';
import Select from '@common/Select';
import {
  WEEKDAYS,
  formToWindow,
  windowToForm,
} from '@lib/model/checksSchedule';

const TYPES = [
  { value: 'none', label: 'None' },
  { value: 'periodic', label: 'Periodic' },
  { value: 'one_time', label: 'One Time' },
];

const DURATION_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
];

const REPEAT_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

const inputClassName =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700';

const optionOf = (options, value) =>
  options.find((option) => option.value === value);

function Row({ label, children }) {
  return (
    <>
      <Label className="col-span-2">{label}</Label>
      <div className="col-span-4">{children}</div>
    </>
  );
}

function ValueAndUnit({ label, value, unit, units, onChange }) {
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
 * Modal to edit the checks execution frequency and the exception window of a target
 */
function TargetChecksExecutionsModal({
  open = false,
  loading = false,
  schedule,
  timezone = 'Etc/UTC',
  onSave = noop,
  onCancel = noop,
}) {
  const [interval, setInterval] = useState(schedule.interval);
  const [form, setForm] = useState(
    windowToForm(schedule.exception_window, timezone)
  );

  const set = (changes) => setForm({ ...form, ...changes });

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Check Executions Settings"
      open={open}
      onClose={onCancel}
    >
      <div className="text-gray-500">Configure when health checks are run.</div>
      <div className="grid grid-cols-6 my-5 gap-6 items-center">
        <Row label="Frequency">
          <ChecksFrequencyInput
            value={interval}
            allowSystemSetting
            onChange={setInterval}
          />
        </Row>
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-bold">Exception Window</h3>
      <div className="text-gray-500">
        Configure when checks <span className="font-bold">should not</span> be
        run.
      </div>
      <div className="grid grid-cols-6 my-5 gap-6 items-center">
        <Row label="Type">
          <Select
            aria-label="Exception window type"
            options={TYPES}
            value={optionOf(TYPES, form.type)}
            onChange={(type) => set({ type })}
          />
        </Row>

        {form.type !== 'none' && (
          <>
            <Row label="Date">
              <input
                type="date"
                aria-label="Date"
                className={inputClassName}
                value={form.date}
                onChange={({ target: { value } }) => set({ date: value })}
              />
            </Row>
            <Row label="Start Time">
              <input
                type="time"
                aria-label="Start Time"
                className={inputClassName}
                value={form.time}
                onChange={({ target: { value } }) => set({ time: value })}
              />
            </Row>
            <Row label="Duration">
              <ValueAndUnit
                label="Duration"
                value={form.durationValue}
                unit={form.durationUnit}
                units={DURATION_UNITS}
                onChange={({ value, unit }) =>
                  set({ durationValue: value, durationUnit: unit })
                }
              />
            </Row>
          </>
        )}

        {form.type === 'periodic' && (
          <Row label="Repeat every">
            <ValueAndUnit
              label="Repeat every"
              value={form.repeatValue}
              unit={form.repeatUnit}
              units={REPEAT_UNITS}
              onChange={({ value, unit }) =>
                set({ repeatValue: value, repeatUnit: unit })
              }
            />
          </Row>
        )}

        {form.type === 'periodic' && form.repeatUnit === 'weeks' && (
          <Row label="Day/s">
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
              onChange={(weekdays) => set({ weekdays: weekdays.sort() })}
            />
          </Row>
        )}
      </div>

      <div className="flex flex-row w-80 space-x-2">
        <Button
          disabled={loading}
          onClick={() =>
            onSave({ interval, exception_window: formToWindow(form, timezone) })
          }
        >
          Save Settings
        </Button>
        <Button type="primary-white" onClick={onCancel}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default TargetChecksExecutionsModal;
