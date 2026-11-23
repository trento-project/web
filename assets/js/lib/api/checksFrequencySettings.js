// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';

export const getSettings = () =>
  networkClient.get(`/settings/checks_frequency`);

export const updateSettings = (settings) =>
  networkClient.patch(`/settings/checks_frequency`, settings);
