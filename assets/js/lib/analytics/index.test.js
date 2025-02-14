import { getFromConfig } from '@lib/config/config';

describe('analytics config', () => {
  it('should check if analytics is enabled', () => {
    const analyticsEnabled = getFromConfig('analyticsEnabled');
    expect(analyticsEnabled).toBeFalsy();

    global.config.analyticsEnabled = true;

    expect(getFromConfig('analyticsEnabled')).toBeTruthy();
  });
});
