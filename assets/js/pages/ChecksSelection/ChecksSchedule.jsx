// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { noop } from 'lodash';
import { parseISO } from 'date-fns';

import Button from '@common/Button';
import { CHECKS_INTERVALS, intervalLabel } from '@lib/model/checksSchedule';
import { formatDateTime, parseDateTimeLocalToUtc } from '@lib/timezones';

const inputClassName =
  'rounded-md border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100';

function ChecksSchedule({
  schedule: {
    interval,
    effective_interval: effectiveInterval,
    exception_windows: exceptionWindows = [],
  },
  timezone = 'Etc/UTC',
  canEdit = false,
  onChangeInterval = noop,
  onAddWindow = noop,
  onDeleteWindow = noop,
}) {
  const [windowStart, setWindowStart] = useState('');
  const [windowDuration, setWindowDuration] = useState('60');

  const addWindow = () => {
    onAddWindow({
      starts_at: parseDateTimeLocalToUtc(windowStart, timezone).toISOString(),
      duration: Number(windowDuration),
    });
    setWindowStart('');
  };

  return (
    <div className="mt-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold">Checks Execution Schedule</h2>
      <p className="mt-1 mb-3 text-gray-500">
        Checks run every {intervalLabel(effectiveInterval)}
      </p>

      <label className="block mb-4" htmlFor="checks-execution-frequency">
        <span className="font-semibold mr-2">Frequency</span>
        <select
          id="checks-execution-frequency"
          aria-label="Checks execution frequency"
          className={inputClassName}
          value={interval ?? ''}
          disabled={!canEdit}
          onChange={({ target: { value } }) =>
            onChangeInterval(value === '' ? null : Number(value))
          }
        >
          <option value="">Global setting</option>
          {CHECKS_INTERVALS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <h3 className="font-semibold">Exception Windows</h3>
      <p className="mb-2 text-gray-500 text-sm">
        Checks are not executed during an exception window.
      </p>
      <table className="w-full text-sm mb-3">
        <thead>
          <tr className="text-left text-gray-500">
            <th>Start ({timezone})</th>
            <th>Duration</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {exceptionWindows.map(({ id, starts_at: startsAt, duration }) => (
            <tr key={id}>
              <td>{formatDateTime(parseISO(startsAt), timezone)}</td>
              <td>{duration} minutes</td>
              <td className="text-right">
                <Button
                  type="danger"
                  size="small"
                  aria-label="Delete window"
                  disabled={!canEdit}
                  onClick={() => onDeleteWindow(id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          aria-label="Window start"
          className={inputClassName}
          value={windowStart}
          disabled={!canEdit}
          onChange={({ target: { value } }) => setWindowStart(value)}
        />
        <input
          type="number"
          min="1"
          aria-label="Window duration in minutes"
          className={`${inputClassName} w-24`}
          value={windowDuration}
          disabled={!canEdit}
          onChange={({ target: { value } }) => setWindowDuration(value)}
        />
        <span className="text-sm text-gray-500">minutes</span>
        <Button
          type="primary-white-fit"
          size="small"
          disabled={!canEdit || !windowStart || Number(windowDuration) < 1}
          onClick={addWindow}
        >
          Add window
        </Button>
      </div>
    </div>
  );
}

export default ChecksSchedule;
