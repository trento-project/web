// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';

const hostSchedulesPath = (hostID) => `/hosts/${hostID}/operation_schedules`;

export const getHostOperationSchedules = (hostID) =>
  networkClient.get(hostSchedulesPath(hostID));

export const createHostOperationSchedule = (hostID, schedule) =>
  networkClient.post(hostSchedulesPath(hostID), schedule);

export const deleteHostOperationSchedule = (hostID, scheduleID) =>
  networkClient.delete(`${hostSchedulesPath(hostID)}/${scheduleID}`);
