/*
 * SPDX-FileCopyrightText: SUSE LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { get } from 'lodash';

export const getSelectedFilters =
  (resourceID) =>
  ({ checksResultsFilters }) =>
    get(checksResultsFilters, resourceID, []);
