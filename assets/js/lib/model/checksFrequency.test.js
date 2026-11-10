// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { describeChecksFrequency } from './checksFrequency';

describe('checksFrequency', () => {
  it.each`
    frequency                        | expected
    ${{ value: 5, unit: 'minute' }}  | ${'Every 5 mins'}
    ${{ value: 30, unit: 'minute' }} | ${'Every 30 mins'}
    ${{ value: 1, unit: 'hour' }}    | ${'Every hour'}
    ${{ value: 6, unit: 'hour' }}    | ${'Every 6 hours'}
    ${{ value: 24, unit: 'hour' }}   | ${'Every 24 hours'}
    ${{ value: 1, unit: 'week' }}    | ${'Every week'}
    ${{ value: 2, unit: 'week' }}    | ${'Every 2 weeks'}
  `(
    'should describe the frequency $frequency as `$expected`',
    ({ frequency, expected }) => {
      expect(describeChecksFrequency(frequency)).toBe(expected);
    }
  );

  it.each`
    frequency
    ${undefined}
    ${null}
    ${'5m'}
    ${12345}
    ${{ value: 5 }}
    ${{ unit: 'minute' }}
    ${{ value: '5', unit: 'minute' }}
    ${{ value: 1, unit: 'day' }}
  `('should not describe the invalid frequency $frequency', ({ frequency }) => {
    expect(describeChecksFrequency(frequency)).toBeUndefined();
  });
});
