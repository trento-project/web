// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { isEmpty, noop } from 'lodash';
import { parseISO } from 'date-fns';

import Button from '@common/Button';
import Modal from '@common/Modal';
import Table from '@common/Table';
import { getOperationLabel } from '@lib/operations';
import { describeOccurrences } from '@lib/model/recurrence';
import { formatDateTime } from '@lib/timezones';

const tableConfig = ({ timezone, canChange, onEdit, onAskCancel }) => ({
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
      render: (nextRunAt) => formatDateTime(parseISO(nextRunAt), timezone),
    },
    {
      title: 'Repeats',
      key: 'recurrence',
      render: (_recurrence, schedule) =>
        describeOccurrences(schedule, timezone),
    },
    {
      title: '',
      key: 'id',
      className: 'text-right',
      render: (_id, schedule) => (
        <div className="flex justify-end space-x-2">
          <Button
            type="primary-white-fit"
            size="small"
            aria-label="Edit schedule"
            disabled={!canChange}
            onClick={() => onEdit(schedule)}
          >
            Edit
          </Button>
          <Button
            type="danger"
            size="small"
            aria-label="Cancel schedule"
            disabled={!canChange}
            onClick={() => onAskCancel(schedule)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ],
});

/**
 * Scheduled operations of a target, the next one first, in the user timezone
 */
function OperationSchedules({
  schedules = [],
  timezone = 'Etc/UTC',
  canChange = true,
  onEdit = noop,
  onCancel = noop,
}) {
  const [cancelling, setCancelling] = useState(null);

  if (isEmpty(schedules)) return null;

  return (
    <div className="mt-8">
      <h2 id="scheduled-operations" className="text-2xl font-bold">
        Scheduled Operations
      </h2>
      <Table
        className="pt-2"
        config={tableConfig({
          timezone,
          canChange,
          onEdit,
          onAskCancel: setCancelling,
        })}
        data={schedules}
        ariaLabelledBy="scheduled-operations"
      />
      <Modal
        title="Cancel Schedule"
        open={!!cancelling}
        onClose={() => setCancelling(null)}
      >
        <p className="text-gray-500">
          {cancelling &&
            `Cancel the schedule of ${getOperationLabel(cancelling.operation)}?`}
        </p>
        <div className="flex justify-start gap-2 mt-4">
          <Button
            type="danger"
            size="small"
            onClick={() => {
              onCancel(cancelling.id);
              setCancelling(null);
            }}
          >
            Yes, cancel it
          </Button>
          <Button
            type="primary-white-fit"
            size="small"
            onClick={() => setCancelling(null)}
          >
            Keep it
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default OperationSchedules;
