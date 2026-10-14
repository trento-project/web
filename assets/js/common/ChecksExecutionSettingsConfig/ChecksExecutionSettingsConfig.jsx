// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { noop } from 'lodash';

import Tooltip from '@common/Tooltip';
import { CHECKS_INTERVALS, intervalLabel } from '@lib/model/checksSchedule';
import { isPermitted } from '@lib/model/users';

export const ENFORCED_FROM_ENV_MESSAGE =
  'The checks execution frequency is enforced by the CHECKS_INTERVAL environment variable';

const permittedFor = ['all:all', 'all:checks_execution_settings'];

function ChecksExecutionSettingsConfig({
  settings: { interval, enforced_from_env: enforcedFromEnv },
  userAbilities,
  onChange = noop,
}) {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold">Checks Execution</h2>
      <p className="mt-3 mb-3 text-gray-500">
        Default frequency of the periodic checks execution. Hosts and clusters
        can override it in their Check Settings.
      </p>

      <div className="grid grid-cols-6 mt-5 items-center">
        <div className="font-bold">Frequency</div>
        <div className="col-span-2 text-gray-500">
          {enforcedFromEnv ? (
            <Tooltip content={ENFORCED_FROM_ENV_MESSAGE} place="bottom">
              <span>Every {intervalLabel(interval)}</span>
            </Tooltip>
          ) : (
            <select
              aria-label="Global checks execution frequency"
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100"
              value={interval}
              disabled={!isPermitted(userAbilities, permittedFor)}
              onChange={({ target: { value } }) =>
                onChange({ interval: Number(value) })
              }
            >
              {CHECKS_INTERVALS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChecksExecutionSettingsConfig;
