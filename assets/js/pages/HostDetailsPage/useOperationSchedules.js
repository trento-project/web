// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { get, noop } from 'lodash';

import { notify } from '@state/notifications';
import {
  createHostOperationSchedule,
  deleteHostOperationSchedule,
  getHostOperationSchedules,
} from '@lib/api/operationSchedules';

const errorDetail = (error) =>
  get(error, ['response', 'data', 'errors', 0, 'detail'], 'unexpected error');

export const useOperationSchedules = (hostID, enabled) => {
  const dispatch = useDispatch();
  const [schedules, setSchedules] = useState([]);

  const refresh = () =>
    getHostOperationSchedules(hostID)
      .then(({ data }) => setSchedules(data))
      .catch(noop);

  useEffect(() => {
    if (enabled && hostID) refresh();
  }, [hostID, enabled]);

  const scheduleOperation = (operation, params, schedule) =>
    createHostOperationSchedule(hostID, { operation, params, ...schedule })
      .then(() => {
        dispatch(notify({ text: 'Operation scheduled', icon: '✅' }));
        refresh();
      })
      .catch((error) =>
        dispatch(
          notify({
            text: `Unable to schedule the operation: ${errorDetail(error)}`,
            icon: '❌',
          })
        )
      );

  const cancelOperationSchedule = (scheduleID) =>
    deleteHostOperationSchedule(hostID, scheduleID)
      .then(refresh)
      .catch(() =>
        dispatch(notify({ text: 'Unable to cancel the schedule', icon: '❌' }))
      );

  return {
    operationSchedules: schedules,
    scheduleOperation,
    cancelOperationSchedule,
  };
};
