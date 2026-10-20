// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSelector } from '@reduxjs/toolkit';

export const getCatalog = createSelector(
  [({ catalog }) => catalog],
  ({ data, error, loading }) => ({
    data,
    error,
    loading,
  })
);
