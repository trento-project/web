import React from 'react';
import { noop } from 'lodash';

import DisabledGuard from '@common/DisabledGuard';
import Button from '@common/Button';

/**
 * Simplistic utility to transform a time interval in a readable string
 */
function TimeLabel({ time }) {
  if (typeof time === 'string') {
    return time;
  }
  if (
    typeof time === 'object' &&
    time !== null &&
    'value' in time &&
    'unit' in time
  ) {
    return `${time.value} ${time.unit}${time.value > 1 ? 's' : ''}`;
  }
  return <em>invalid value</em>;
}

/**
 * Render the saved configuration for the Activity Logs.
 * Editing is demanded to another component, activated by the Edit button
 *
 * @param {{value: number, unit: "day"|"week"|"month"|"year"}} props.retentionTime A structured `{value,unit}`
 * object that defines a retention time interval. `unit` is one of `day`, `week`, `month`, `year`.'
 * @param {function} props.onEditClick Handles the edit button click
 */
function ActivityLogsConfig({
  retentionTime,
  onEditClick = noop,
  userAbilities,
  settingsEditPermittedFor,
}) {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h2 className="text-2xl font-bold inline-block">Activity Logs</h2>
        <span className="float-right">
          <DisabledGuard
            userAbilities={userAbilities}
            permitted={settingsEditPermittedFor}
          >
            <Button type="primary-white-fit" size="small" onClick={onEditClick}>
              Edit Settings
            </Button>
          </DisabledGuard>
        </span>
      </div>
      <p className="mt-3 mb-3 text-gray-500">
        Configure data retention times for log entries.
      </p>

      <div className="grid grid-cols-6 mt-5 items-center">
        <div className="font-bold mb-3">Retention Time</div>
        <div
          aria-label="retention-time"
          className="col-span-2 text-gray-500 mb-3 pr-12"
        >
          <TimeLabel time={retentionTime} />
        </div>
      </div>
    </div>
  );
}

export default ActivityLogsConfig;
