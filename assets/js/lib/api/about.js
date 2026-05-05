// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { get } from '@lib/network';

export const getAboutData = () => get('/about');
