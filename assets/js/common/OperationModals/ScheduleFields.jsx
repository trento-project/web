// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { noop } from 'lodash';

import { InputNumber } from '@common/Input';
import RecurrenceFields, { FieldRow, optionOf } from '@common/RecurrenceFields';
import Select from '@common/Select';
import { formToRecurrence, todayIn } from '@lib/model/recurrence';

const TYPES = [
  { value: 'now', label: 'Now' },
  { value: 'one_time', label: 'One Time' },
  { value: 'periodic', label: 'Periodic' },
];

const ENDS = [
  { value: 'never', label: 'Never' },
  { value: 'on', label: 'On date' },
  { value: 'after', label: 'After' },
];

export const initialScheduleForm = (timezone) => ({
  type: 'now',
  date: todayIn(timezone),
  time: '00:00',
  repeatValue: '1',
  repeatUnit: 'days',
  weekdays: [],
  ends: 'never',
  endsOn: '',
  maxOccurrences: '1',
});

// Request payload of the schedule, or null to request the operation now
export const toScheduleRequest = (form, timezone) => {
  if (form.type === 'now') return null;

  const periodic = form.type === 'periodic';

  return {
    ...formToRecurrence(form, timezone, periodic),
    ends_on: periodic && form.ends === 'on' ? form.endsOn : null,
    max_occurrences:
      periodic && form.ends === 'after' ? Number(form.maxOccurrences) : null,
  };
};

export const isScheduleFormValid = (form) => {
  if (form.type === 'now') return true;
  if (!form.date || !form.time) return false;
  if (form.type === 'one_time') return true;

  return (
    Number(form.repeatValue) >= 1 &&
    (form.ends !== 'on' || form.endsOn !== '') &&
    (form.ends !== 'after' || Number(form.maxOccurrences) >= 1)
  );
};

const inputClassName =
  'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700';

/**
 * Schedule section of the operation modal: now, once or periodically
 */
function ScheduleFields({ form, onChange = noop }) {
  const set = (changes) => onChange({ ...form, ...changes });
  const periodic = form.type === 'periodic';

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-bold">Schedule</h3>
      <div className="text-gray-500">
        Request the operation now or at a later date and time.
      </div>
      <div className="grid grid-cols-6 my-5 gap-6 items-center">
        <FieldRow label="Type">
          <Select
            aria-label="Schedule type"
            options={TYPES}
            value={optionOf(TYPES, form.type)}
            onChange={(type) => set({ type })}
          />
        </FieldRow>

        {form.type !== 'now' && (
          <RecurrenceFields form={form} periodic={periodic} onChange={set} />
        )}

        {periodic && (
          <FieldRow label="Ends">
            <div className="flex items-center space-x-4">
              <div className="w-40">
                <Select
                  aria-label="Ends"
                  options={ENDS}
                  value={optionOf(ENDS, form.ends)}
                  onChange={(ends) => set({ ends })}
                />
              </div>
              {form.ends === 'on' && (
                <input
                  type="date"
                  aria-label="End date"
                  className={inputClassName}
                  value={form.endsOn}
                  onChange={({ target: { value } }) => set({ endsOn: value })}
                />
              )}
              {form.ends === 'after' && (
                <>
                  <div className="w-32">
                    <InputNumber
                      aria-label="Occurrences"
                      className="!h-9"
                      min="1"
                      value={form.maxOccurrences}
                      onChange={(value) =>
                        set({ maxOccurrences: String(value ?? '') })
                      }
                    />
                  </div>
                  <span className="text-gray-500">occurrences</span>
                </>
              )}
            </div>
          </FieldRow>
        )}
      </div>
    </div>
  );
}

export default ScheduleFields;
