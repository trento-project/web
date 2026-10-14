// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';

const alertingPath = '/settings/alerting';

export const getSettings = () => networkClient.get(alertingPath);

export const saveSettings = (settings) =>
  networkClient.post(alertingPath, settings);

export const updateSettings = (settings) =>
  networkClient.patch(alertingPath, settings);

export const sendTestEmail = () => networkClient.post(`${alertingPath}/test`);
