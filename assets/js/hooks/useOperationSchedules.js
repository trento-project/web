// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { noop } from 'lodash';

import {
  deleteOperationSchedule,
  getOperationSchedules,
  updateOperationSchedule,
} from '@lib/api/operationSchedules';
import { notify } from '@state/notifications';
import { scheduledNotification } from '@hooks/useScheduleOperation';

/**
 * Schedules of a target: list, change and cancel them. The list is loaded
 * again when `refreshKey` changes, for example when an operation of the
 * target starts or completes.
 */
function useOperationSchedules(targetID, { refreshKey } = {}) {
  const dispatch = useDispatch();
  const [schedules, setSchedules] = useState([]);

  const refresh = useCallback(
    () =>
      getOperationSchedules(targetID)
        .then(({ data }) => setSchedules(data))
        .catch(noop),
    [targetID]
  );

  useEffect(() => {
    if (targetID) refresh();
  }, [targetID, refreshKey, refresh]);

  const updateSchedule = (scheduleID, schedule) =>
    updateOperationSchedule(scheduleID, schedule)
      .then(({ data }) => {
        dispatch(scheduledNotification('Schedule changed', data.warnings));
        return refresh();
      })
      .catch(() =>
        dispatch(notify({ text: 'Unable to change the schedule', icon: '❌' }))
      );

  const cancelSchedule = (scheduleID) =>
    deleteOperationSchedule(scheduleID)
      .then(() => {
        dispatch(notify({ text: 'Schedule cancelled', icon: '🗑️' }));
        return refresh();
      })
      .catch(() =>
        dispatch(notify({ text: 'Unable to cancel the schedule', icon: '❌' }))
      );

  return { schedules, refresh, updateSchedule, cancelSchedule };
}

export default useOperationSchedules;
