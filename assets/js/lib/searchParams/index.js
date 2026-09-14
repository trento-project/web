// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/**
 * Helpers to work with the search params of a view.
 */

/**
 * Builds an updater for react router's `setSearchParams` which applies
 * `changes` on top of the current search params, leaving the other ones
 * untouched.
 *
 * A `null` or `undefined` value removes the param, so that a filter which is
 * not applied leaves no trace in the query string. An array value is written as
 * a repeated param.
 *
 * @example
 * setSearchParams(changeSearchParams({ advisoryType: 'security' }));
 * setSearchParams(changeSearchParams({ health: ['critical', 'warning'] }));
 *
 * @param {Object} changes - Params to change, keyed by param name
 * @returns {function(URLSearchParams): URLSearchParams}
 */
export const changeSearchParams = (changes) => (currentSearchParams) => {
  const updated = new URLSearchParams(currentSearchParams);

  Object.entries(changes).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      updated.delete(key);
      return;
    }

    if (Array.isArray(value)) {
      updated.delete(key);
      value.forEach((item) => updated.append(key, item));
      return;
    }

    updated.set(key, value);
  });

  return updated;
};
