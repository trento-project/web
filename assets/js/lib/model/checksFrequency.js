// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

// The values the API accepts for each unit of the checks frequency
export const CHECKS_FREQUENCY_UNITS = {
  minute: [5, 15, 30],
  hour: [1, 6, 12, 24],
  week: [1, 2, 4],
};

const isFrequency = (frequency) =>
  typeof frequency === 'object' &&
  frequency !== null &&
  Number.isInteger(frequency.value) &&
  frequency.value > 0 &&
  Object.keys(CHECKS_FREQUENCY_UNITS).includes(frequency.unit);

/**
 * How often the checks run, like "Every 5 mins" or "Every 6 hours".
 * Undefined when the frequency is not a positive whole value with a known unit.
 *
 * @param {{value: number, unit: "minute"|"hour"|"week"}} frequency
 */
export const describeChecksFrequency = (frequency) => {
  if (!isFrequency(frequency)) {
    return undefined;
  }

  const { value, unit } = frequency;
  if (unit === 'minute') {
    return `Every ${value} mins`;
  }
  return value === 1 ? `Every ${unit}` : `Every ${value} ${unit}s`;
};
