// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import Tooltip from '@common/Tooltip';

import { describeChecksFrequency } from '@lib/model/checksFrequency';

const checksFrequencySettingsPermittedFor = ['all:checks_frequency_settings'];

export const ENFORCED_FROM_ENV_MESSAGE =
  'Check executions settings are enforced by the CHECKS_INTERVAL environment variable';

function FrequencyLabel({ enabled, frequency }) {
  if (!enabled) {
    return 'Disabled';
  }

  return describeChecksFrequency(frequency) ?? <em>invalid value</em>;
}

/**
 * Render the global checks frequency.
 * Editing is delegated to another component, opened by the Edit button
 *
 * @param {boolean} props.enabled Whether the checks run periodically
 * @param {{value: number, unit: "minute"|"hour"|"week"}} props.frequency How often
 * the checks run
 * @param {boolean} props.enforcedFromEnv Whether the CHECKS_INTERVAL environment
 * variable sets the frequency
 * @param {function} props.onEditClick Handles the edit button click
 */
function ChecksFrequencyConfig({
  enabled = true,
  frequency,
  enforcedFromEnv = false,
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
            permitted={checksFrequencySettingsPermittedFor}
          >
            <Tooltip
              isEnabled={enforcedFromEnv}
              content={ENFORCED_FROM_ENV_MESSAGE}
              place="bottom"
            >
              <Button
                type="primary-white-fit"
                size="small"
                aria-label="checks-frequency-edit-button"
                onClick={onEditClick}
                disabled={enforcedFromEnv}
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
          aria-label="checks-frequency"
          className="col-span-2 text-gray-500 mb-3 pr-12"
        >
          <FrequencyLabel enabled={enabled} frequency={frequency} />
        </div>
      </div>
    </div>
  );
}

export default ChecksFrequencyConfig;
