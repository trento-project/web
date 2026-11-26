// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { capitalize, noop } from 'lodash';

import Button from '@common/Button';
import DisabledGuard from '@common/DisabledGuard';
import { FrequencyLabel } from '@common/ChecksFrequencyConfig';

function FrequencySource({ global, systemSettings }) {
  if (global) {
    return 'Uses the system setting';
  }

  return (
    <>
      Overrides the system setting (
      <FrequencyLabel
        enabled={systemSettings.enabled}
        frequency={systemSettings.frequency}
      />
      )
    </>
  );
}

/**
 * Render the checks frequency of a host or a cluster, and whether it is the
 * system setting or its own one.
 * Editing is delegated to another component, opened by the Edit button
 *
 * @param {"host"|"cluster"} props.targetType The type of the target
 * @param {{enabled: boolean, frequency: {value: number, unit: "minute"|"hour"|"week"}, global: boolean}} props.schedule
 * The checks schedule of the target
 * @param {{enabled: boolean, frequency: {value: number, unit: "minute"|"hour"|"week"}}} props.systemSettings
 * The global checks frequency settings
 * @param {function} props.onEditClick Handles the edit button click
 */
function TargetChecksFrequencyConfig({
  targetType,
  schedule: { enabled, frequency, global },
  systemSettings,
  userAbilities,
  onEditClick = noop,
}) {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg px-8 py-4">
      <div>
        <h2 className="text-2xl font-bold inline-block">
          {capitalize(targetType)} Check Executions
        </h2>
        <span className="float-right">
          <DisabledGuard
            userAbilities={userAbilities}
            permitted={[`all:${targetType}_checks_frequency`]}
          >
            <Button type="primary-white-fit" size="small" onClick={onEditClick}>
              Edit Settings
            </Button>
          </DisabledGuard>
        </span>
      </div>
      <p className="mt-3 mb-3 text-gray-500">
        Configure when health checks are run for this {targetType}.
      </p>

      <div className="grid grid-cols-6 mt-5 items-center">
        <div className="font-bold mb-3">Check Execution Frequency</div>
        <div
          aria-label="checks-frequency"
          className="col-span-2 text-gray-500 mb-3 pr-12"
        >
          <FrequencyLabel enabled={enabled} frequency={frequency} />
        </div>
        <div
          aria-label="checks-frequency-source"
          className="col-span-3 text-gray-500 mb-3"
        >
          <FrequencySource global={global} systemSettings={systemSettings} />
        </div>
      </div>
    </div>
  );
}

export default TargetChecksFrequencyConfig;
