// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { get } from 'lodash';

export const defaultRowKey = (item, index) => get(item, 'key', index);
