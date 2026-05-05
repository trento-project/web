/*
 * SPDX-FileCopyrightText: SUSE LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { networkClient } from '@lib/network';

const alertingPath = '/settings/alerting';

export const getSettings = () => networkClient.get(alertingPath);

export const saveSettings = (settings) =>
  networkClient.post(alertingPath, settings);

export const updateSettings = (settings) =>
  networkClient.patch(alertingPath, settings);
