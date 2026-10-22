// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { isEmpty, noop } from 'lodash';
import { parseISO } from 'date-fns';

import Button from '@common/Button';
import Table from '@common/Table';
import { getOperationLabel } from '@lib/operations';
import { describeOccurrences } from '@lib/model/recurrence';
import { formatDateTime } from '@lib/timezones';

const tableConfig = ({ timezone, canCancel, onCancel }) => ({
  usePadding: false,
  columns: [
    {
      title: 'Operation',
      key: 'operation',
      render: (operation) => getOperationLabel(operation),
    },
    {
      title: 'Next Run',
      key: 'next_run_at',
      render: (nextRunAt) =>
        nextRunAt ? formatDateTime(parseISO(nextRunAt), timezone) : 'Ended',
    },
    {
      title: 'Repeats',
      key: 'frequency',
      render: (_frequency, schedule) => describeOccurrences(schedule, timezone),
    },
    {
      title: '',
      key: 'id',
      className: 'text-right',
      render: (id) => (
        <Button
          type="danger"
          size="small"
          aria-label="Cancel schedule"
          disabled={!canCancel}
          onClick={() => onCancel(id)}
        >
          Cancel
        </Button>
      ),
    },
  ],
});

/**
 * Scheduled operations of a target, with their next run in the user timezone
 */
function OperationSchedules({
  schedules = [],
  timezone = 'Etc/UTC',
  canCancel = true,
  onCancel = noop,
}) {
  if (isEmpty(schedules)) return null;

  return (
    <div className="mt-8">
      <h2 id="scheduled-operations" className="text-2xl font-bold">
        Scheduled Operations
      </h2>
      <Table
        className="pt-2"
        config={tableConfig({ timezone, canCancel, onCancel })}
        data={schedules}
        ariaLabelledBy="scheduled-operations"
      />
    </div>
  );
}

export default OperationSchedules;
