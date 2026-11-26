// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';
import { TARGET_HOST } from '@lib/model';

const schedulePath = (targetType, targetID) =>
  `/${targetType === TARGET_HOST ? 'hosts' : 'clusters'}/${targetID}/checks/schedule`;

export const getSchedule = (targetType, targetID) =>
  networkClient.get(schedulePath(targetType, targetID));

export const updateSchedule = (targetType, targetID, schedule) =>
  networkClient.put(schedulePath(targetType, targetID), schedule);

export const deleteSchedule = (targetType, targetID) =>
  networkClient.delete(schedulePath(targetType, targetID));
