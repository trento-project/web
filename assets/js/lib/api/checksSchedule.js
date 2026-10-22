// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';

const settingsPath = '/settings/checks_execution';

const targetChecksPath = (targetType, targetID) =>
  `/${targetType}s/${targetID}/checks`;

export const getChecksExecutionSettings = () => networkClient.get(settingsPath);

export const updateChecksExecutionSettings = (settings) =>
  networkClient.put(settingsPath, settings);

export const getChecksSchedule = (targetType, targetID) =>
  networkClient.get(`${targetChecksPath(targetType, targetID)}/schedule`);

export const updateChecksSchedule = (targetType, targetID, schedule) =>
  networkClient.put(
    `${targetChecksPath(targetType, targetID)}/schedule`,
    schedule
  );
