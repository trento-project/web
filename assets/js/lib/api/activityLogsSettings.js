/*
 * SPDX-FileCopyrightText: SUSE LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { networkClient } from '@lib/network';

export const getSettings = () => networkClient.get(`/settings/activity_log`);

export const updateSettings = (settings) =>
  networkClient.put(`/settings/activity_log`, settings);
