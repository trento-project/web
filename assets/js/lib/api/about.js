// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { get } from '@lib/network';

export const getAboutData = () => get('/about');
