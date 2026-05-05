// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export const urlEncode = function urlEncode(params) {
  const str = [];
  Object.entries(params).forEach(([key, value]) => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  return str.join('&');
};
