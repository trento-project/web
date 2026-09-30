// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';

export const getSettings = () => networkClient.get(`/settings/smlm`);

export const saveSettings = (settings) =>
  networkClient.post(`/settings/smlm`, settings);

export const updateSettings = (settings) =>
  networkClient.patch(`/settings/smlm`, settings);

export const clearSettings = () =>
  networkClient.delete(`/settings/smlm`);

export const testConnection = () =>
  networkClient.post(`/settings/smlm/test`);
