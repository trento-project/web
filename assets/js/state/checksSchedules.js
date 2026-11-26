// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { createAction, createSlice } from '@reduxjs/toolkit';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

const emptyEntry = {
  loading: false,
  data: null,
  networkError: false,
  editing: false,
  errors: [],
};

const initialState = {
  [TARGET_HOST]: {},
  [TARGET_CLUSTER]: {},
};

const updateEntry = (state, { targetType, targetID }, changes) => {
  state[targetType][targetID] = {
    ...emptyEntry,
    ...state[targetType][targetID],
    ...changes,
  };
};

export const checksSchedulesSlice = createSlice({
  name: 'checksSchedules',
  initialState,
  reducers: {
    startLoadingChecksSchedule: (state, { payload: target }) => {
      updateEntry(state, target, { loading: true });
    },
    setChecksSchedule: (state, { payload: { schedule, ...target } }) => {
      updateEntry(state, target, {
        loading: false,
        networkError: false,
        data: schedule,
      });
    },
    checksScheduleRefreshed: (state, { payload: { schedule, ...target } }) => {
      updateEntry(state, target, { networkError: false, data: schedule });
    },
    setChecksScheduleErrors: (state, { payload: { errors, ...target } }) => {
      updateEntry(state, target, {
        loading: false,
        networkError: false,
        errors,
      });
    },
    setEditingChecksSchedule: (state, { payload: { editing, ...target } }) => {
      updateEntry(state, target, { editing });
    },
    setChecksScheduleNetworkError: (
      state,
      { payload: { networkError, ...target } }
    ) => {
      updateEntry(state, target, { loading: false, networkError });
    },
  },
});

export const FETCH_CHECKS_SCHEDULE = 'FETCH_CHECKS_SCHEDULE';
export const UPDATE_CHECKS_SCHEDULE = 'UPDATE_CHECKS_SCHEDULE';
export const REFRESH_CHECKS_SCHEDULES = 'REFRESH_CHECKS_SCHEDULES';

export const fetchChecksSchedule = createAction(FETCH_CHECKS_SCHEDULE);
export const updateChecksSchedule = createAction(UPDATE_CHECKS_SCHEDULE);
export const refreshChecksSchedules = createAction(REFRESH_CHECKS_SCHEDULES);

export const {
  startLoadingChecksSchedule,
  setChecksSchedule,
  checksScheduleRefreshed,
  setChecksScheduleErrors,
  setEditingChecksSchedule,
  setChecksScheduleNetworkError,
} = checksSchedulesSlice.actions;

export default checksSchedulesSlice.reducer;
