import { DEFAULT_TIMEZONE, getUtcOffset } from './index';

describe('timezones', () => {
  it('uses UTC as default timezone', () => {
    expect(DEFAULT_TIMEZONE).toBe('Etc/UTC');
  });

  it('calculates DST correctly for Europe/Berlin in winter vs summer', () => {
    const winterOffset = getUtcOffset(
      'Europe/Berlin',
      new Date('2024-01-01T12:00:00Z')
    );
    const summerOffset = getUtcOffset(
      'Europe/Berlin',
      new Date('2024-07-01T12:00:00Z')
    );

    expect(winterOffset).toBe('GMT+1');
    expect(summerOffset).toBe('GMT+2');
  });

  it('returns UTC for invalid timezone identifiers', () => {
    expect(
      getUtcOffset('Not/A_Timezone', new Date('2024-01-01T12:00:00Z'))
    ).toBe('UTC');
  });
});
