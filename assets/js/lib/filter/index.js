// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

const regularizeString = (str) => str.normalize().trim().toLowerCase();

export const containsSubstring = (str = '', substring = '') =>
  regularizeString(str).includes(regularizeString(substring));
