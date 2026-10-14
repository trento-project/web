// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSelector } from '@reduxjs/toolkit';

export const getActivityLogUsers = createSelector(
  [(state) => state.activityLog],
  (activityLog) => activityLog.users
);
