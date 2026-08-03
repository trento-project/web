// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';

export const getSettings = () => networkClient.get(`/settings/suse_multi_linux_manager`);

export const saveSettings = (settings) =>
  networkClient.post(`/settings/suse_multi_linux_manager`, settings);

export const updateSettings = (settings) =>
  networkClient.patch(`/settings/suse_multi_linux_manager`, settings);

export const clearSettings = () =>
  networkClient.delete(`/settings/suse_multi_linux_manager`);

export const testConnection = () =>
  networkClient.post(`/settings/suse_multi_linux_manager/test`);
