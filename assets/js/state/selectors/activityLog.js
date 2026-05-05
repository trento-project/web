// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { createSelector } from '@reduxjs/toolkit';

export const getActivityLogUsers = createSelector(
  [(state) => state.activityLog],
  (activityLog) => activityLog.users
);
