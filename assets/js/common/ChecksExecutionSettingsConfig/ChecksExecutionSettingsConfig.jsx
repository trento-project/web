// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import Tooltip from '@common/Tooltip';
import { DISABLED, frequencyLabel } from '@lib/model/checksSchedule';

export const ENFORCED_FROM_ENV_MESSAGE =
  'The checks execution frequency is enforced by the CHECKS_INTERVAL environment variable';

const checksExecutionSettingsPermittedFor = ['all:checks_execution_settings'];

/**
 * Global checks execution settings. Editing is done in ChecksExecutionSettingsModal.
 */
function ChecksExecutionSettingsConfig({
  settings: { interval, enforced_from_env: enforcedFromEnv },
  userAbilities,
  onEditClick = noop,
}) {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h2 className="text-2xl font-bold inline-block">Check Executions</h2>
        <span className="float-right">
          <DisabledGuard
            userAbilities={userAbilities}
            permitted={checksExecutionSettingsPermittedFor}
          >
            <Tooltip
              isEnabled={enforcedFromEnv}
              content={ENFORCED_FROM_ENV_MESSAGE}
              place="bottom"
            >
              <Button
                type="primary-white-fit"
                size="small"
                disabled={enforcedFromEnv}
                onClick={onEditClick}
              >
                Edit Settings
              </Button>
            </Tooltip>
          </DisabledGuard>
        </span>
      </div>
      <p className="mt-3 mb-3 text-gray-500">
        Configure when the health checks are run.
      </p>

      <div className="grid grid-cols-6 mt-5 items-center">
        <div className="font-bold mb-3">Check Execution Frequency</div>
        <div
          aria-label="checks-execution-frequency"
          className="col-span-2 text-gray-500 mb-3 pr-12"
        >
          {interval === DISABLED
            ? 'Disabled'
            : `Every ${frequencyLabel(interval)}`}
        </div>
      </div>
    </div>
  );
}

export default ChecksExecutionSettingsConfig;
