// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { networkClient } from '@lib/network';

export const getActivityLog = (params) =>
  networkClient.get(`/activity_log`, { params });
