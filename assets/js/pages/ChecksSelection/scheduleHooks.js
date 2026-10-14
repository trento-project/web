// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { notify } from '@state/notifications';
import {
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

  // Saves the interval and the exception window of the target together
  const saveSchedule = (newSchedule) =>
    updateChecksSchedule(targetType, targetID, newSchedule)
      .then(({ data }) => setSchedule(data))
      .catch(() => notifyError('Unable to save the checks execution settings'));

  return { schedule, saveSchedule };
};
