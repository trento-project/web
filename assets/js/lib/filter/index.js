// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

const regularizeString = (str) => str.normalize().trim().toLowerCase();

export const containsSubstring = (str = '', substring = '') =>
  regularizeString(str).includes(regularizeString(substring));
