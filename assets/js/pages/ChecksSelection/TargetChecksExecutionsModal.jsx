// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import ChecksFrequencyInput from '@common/ChecksFrequencyInput';
import Modal from '@common/Modal';
import RecurrenceFields, {
  FieldRow,
  ValueAndUnit,
  optionOf,
} from '@common/RecurrenceFields';
import Select from '@common/Select';
import { formToWindow, windowToForm } from '@lib/model/checksSchedule';

const TYPES = [
  { value: 'none', label: 'None' },
  { value: 'periodic', label: 'Periodic' },
  { value: 'one_time', label: 'One Time' },
];

const DURATION_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
];

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
        <FieldRow label="Frequency">
          <ChecksFrequencyInput
            value={interval}
            allowSystemSetting
            onChange={setInterval}
          />
        </FieldRow>
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-bold">Exception Window</h3>
      <div className="text-gray-500">
        Configure when checks <span className="font-bold">should not</span> be
        run.
      </div>
      <div className="grid grid-cols-6 my-5 gap-6 items-center">
        <FieldRow label="Type">
          <Select
            aria-label="Exception window type"
            options={TYPES}
            value={optionOf(TYPES, form.type)}
            onChange={(type) => set({ type })}
          />
        </FieldRow>

        {form.type !== 'none' && (
          <RecurrenceFields
            form={form}
            periodic={form.type === 'periodic'}
            onChange={set}
            afterTime={
              <FieldRow label="Duration">
                <ValueAndUnit
                  label="Duration"
                  value={form.durationValue}
                  unit={form.durationUnit}
                  units={DURATION_UNITS}
                  onChange={({ value, unit }) =>
                    set({ durationValue: value, durationUnit: unit })
                  }
                />
              </FieldRow>
            }
          />
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
