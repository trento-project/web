// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { get } from 'lodash';

const notLoaded = {
  loading: true,
  data: null,
  networkError: false,
  editing: false,
  errors: [],
};

export const getChecksSchedule = (targetType, targetID) => (state) =>
  get(state, ['checksSchedules', targetType, targetID], notLoaded);
