// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';

const settingsPath = '/settings/checks_execution';

const targetSchedulePath = (targetType, targetID) =>
  `/${targetType}s/${targetID}/checks/schedule`;

export const getChecksExecutionSettings = () => networkClient.get(settingsPath);

export const updateChecksExecutionSettings = (settings) =>
  networkClient.put(settingsPath, settings);

export const getChecksSchedule = (targetType, targetID) =>
  networkClient.get(targetSchedulePath(targetType, targetID));

export const updateChecksSchedule = (targetType, targetID, schedule) =>
  networkClient.put(targetSchedulePath(targetType, targetID), schedule);
