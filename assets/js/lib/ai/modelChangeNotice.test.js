// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  MODEL_CHANGE_MARKER,
  parseModelChangeShape,
} from './modelChangeNotice';

describe('parseModelChangeShape', () => {
  it('parses a marker-tagged payload', () => {
    const text = `${MODEL_CHANGE_MARKER}${JSON.stringify({
      provider: 'googleai',
      model: 'gemini-2.5-pro',
    })}`;

    expect(parseModelChangeShape(text)).toEqual({
      provider: 'googleai',
      model: 'gemini-2.5-pro',
    });
  });

  it.each([
    ['plain text', 'Loud and clear!'],
    ['marker without json', MODEL_CHANGE_MARKER],
    ['marker with invalid json', `${MODEL_CHANGE_MARKER}not-json`],
    ['marker with incomplete payload', `${MODEL_CHANGE_MARKER}{"provider":"x"}`],
    ['non-string', 42],
    ['undefined', undefined],
  ])('returns null for %s', (_label, input) => {
    expect(parseModelChangeShape(input)).toBeNull();
  });
});
