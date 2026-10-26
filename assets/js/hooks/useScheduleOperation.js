// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { createOperationSchedule } from '@lib/api/operationSchedules';
import { notify } from '@state/notifications';

// Policy messages refer to their resources as {0}, {1}...
const warningText = ({ message, metadata = [] }) =>
  message.replace(/{(\d+)}/g, (_, index) => metadata[index]?.label ?? '');

/**
 * Schedules an operation and tells the outcome. The schedule is saved even
 * when its policies do not pass now: they run again at the scheduled time.
 */
function useScheduleOperation() {
  const dispatch = useDispatch();

  return useCallback(
    (target, schedule) =>
      createOperationSchedule({ ...target, ...schedule })
        .then(({ data }) => {
          const warnings = data.warnings || [];

          dispatch(
            warnings.length === 0
              ? notify({ text: 'Operation scheduled', icon: '📅' })
              : notify({
                  text: `Operation scheduled. It would not run now: ${warnings.map(warningText).join(', ')}`,
                  icon: '⚠️',
                })
          );

          return data;
        })
        .catch(() =>
          dispatch(
            notify({ text: 'Unable to schedule the operation', icon: '❌' })
          )
        ),
    [dispatch]
  );
}

export default useScheduleOperation;
