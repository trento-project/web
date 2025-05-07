import { getFromConfig } from '@lib/config/config';
import posthog from 'posthog-js';
import { optinCapturing } from '.';

describe('analytics config', () => {
  it('should check if analytics is enabled', () => {
    const analyticsEnabled = getFromConfig('analyticsEnabled');
    expect(analyticsEnabled).toBeFalsy();

    global.config.analyticsEnabled = true;

    expect(getFromConfig('analyticsEnabled')).toBeTruthy();
  });

  it('it should allow analytics opt-in to be configurable', () => {
    optinCapturing(false);
    expect(posthog.has_opted_out_capturing()).toBeTruthy();

    optinCapturing(true);
    expect(posthog.has_opted_out_capturing()).toBeFalsy();
  });
});
