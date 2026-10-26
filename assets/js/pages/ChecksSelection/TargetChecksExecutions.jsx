// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { capitalize, noop } from 'lodash';
import { EOS_INFO_OUTLINED } from 'eos-icons-react';

import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import Tooltip from '@common/Tooltip';
import PremiumPill from '@common/PremiumPill';
import {
  DISABLED,
  describeWindow,
  frequencyLabel,
} from '@lib/model/checksSchedule';

/**
 * Checks execution frequency and exception window of a host or a cluster.
 * Editing is done in TargetChecksExecutionsModal.
 */
function TargetChecksExecutions({
  targetType,
  schedule: {
    interval,
    effective_interval: effectiveInterval,
    global_interval: globalInterval,
    exception_window: exceptionWindow,
  },
  timezone = 'Etc/UTC',
  userAbilities,
  permittedFor = [],
  onEditClick = noop,
}) {
  return (
    <div className="mt-4 mb-4 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold inline-block">
          {capitalize(targetType)} Check Executions
        </h2>
        <PremiumPill className="ml-3 align-middle" />
        <span className="float-right">
          <DisabledGuard userAbilities={userAbilities} permitted={permittedFor}>
            <Button type="primary-white-fit" size="small" onClick={onEditClick}>
              Edit Settings
            </Button>
          </DisabledGuard>
        </span>
      </div>
      <p className="mt-3 mb-5 text-gray-500">
        Configure when health checks are run for this {targetType}.
      </p>

      <div className="grid grid-cols-6 gap-y-5 items-center">
        <div className="font-bold">Check Execution Frequency</div>
        <div className="col-span-5 text-gray-500">
          <div>
            {effectiveInterval === DISABLED
              ? 'Disabled'
              : `Every ${frequencyLabel(effectiveInterval)}`}
          </div>
          {interval && (
            <div>
              (Overrides system setting: {frequencyLabel(globalInterval)})
            </div>
          )}
        </div>

        <div className="font-bold flex items-center">
          Exception Window
          <Tooltip
            content="Configure when checks should not be run."
            place="top"
          >
            <span aria-label="exception-window-info" className="ml-2">
              <EOS_INFO_OUTLINED className="inline-block" />
            </span>
          </Tooltip>
        </div>
        <div className="col-span-5 text-gray-500">
          {describeWindow(exceptionWindow, timezone)}
        </div>
      </div>
    </div>
  );
}

export default TargetChecksExecutions;
