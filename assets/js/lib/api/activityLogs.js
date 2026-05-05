// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';

export const getActivityLog = (params) =>
  networkClient.get(`/activity_log`, { params });
