// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { get } from 'lodash';

export const defaultRowKey = (item, index) => get(item, 'key', index);
