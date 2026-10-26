// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import ScheduleFields, {
  initialScheduleForm,
  isScheduleFormValid,
  toScheduleRequest,
} from '@common/OperationModals/ScheduleFields';

const startForm = (timezone) => ({
  ...initialScheduleForm(timezone),
  type: 'one_time',
});

/**
 * Schedules the same operation on several targets. Requesting it now on all
 * of them is the bulk operation itself, not a schedule.
 */
function BulkScheduleModal({
  isOpen = false,
  operationLabel,
  targetsLabel,
  timezone = 'Etc/UTC',
  onSchedule = noop,
  onCancel = noop,
}) {
  const [form, setForm] = useState(() => startForm(timezone));

  useEffect(() => {
    if (isOpen) setForm(startForm(timezone));
  }, [isOpen, timezone]);

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={`Schedule ${operationLabel} on ${targetsLabel}`}
      open={isOpen}
      onClose={onCancel}
    >
      <p className="text-gray-500 text-sm">
        Each target gets its own schedule. They can be changed and cancelled one
        by one.
      </p>
      <ScheduleFields form={form} allowNow={false} onChange={setForm} />
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          size="small"
          disabled={!isScheduleFormValid(form)}
          onClick={() => onSchedule(toScheduleRequest(form, timezone))}
        >
          Schedule
        </Button>
        <Button type="primary-white-fit" size="small" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default BulkScheduleModal;
