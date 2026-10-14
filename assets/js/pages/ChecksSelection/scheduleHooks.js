// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { notify } from '@state/notifications';
import {
  createExceptionWindow,
  deleteExceptionWindow,
  getChecksSchedule,
  updateChecksSchedule,
} from '@lib/api/checksSchedule';

export const useChecksSchedule = (targetType, targetID) => {
  const dispatch = useDispatch();
  const [schedule, setSchedule] = useState(null);

  const notifyError = (text) => dispatch(notify({ text, icon: '❌' }));

  const refresh = () =>
    getChecksSchedule(targetType, targetID)
      .then(({ data }) => setSchedule(data))
      .catch(() => notifyError('Unable to load the checks schedule'));

  useEffect(() => {
    if (targetID) refresh();
  }, [targetType, targetID]);

  const changeInterval = (interval) =>
    updateChecksSchedule(targetType, targetID, interval)
      .then(({ data }) => setSchedule(data))
      .catch(() => notifyError('Unable to change the checks frequency'));

  const addWindow = (window) =>
    createExceptionWindow(targetType, targetID, window)
      .then(refresh)
      .catch(() => notifyError('Unable to add the exception window'));

  const deleteWindow = (windowID) =>
    deleteExceptionWindow(targetType, targetID, windowID)
      .then(refresh)
      .catch(() => notifyError('Unable to delete the exception window'));

  return { schedule, changeInterval, addWindow, deleteWindow };
};
