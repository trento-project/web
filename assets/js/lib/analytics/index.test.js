import { getFromConfig } from '@lib/config/config';
import posthog from 'posthog-js';
import { optinCapturing } from '.';

describe('analytics', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should check if analytics is enabled', () => {
    const analyticsEnabled = getFromConfig('analyticsEnabled');
    expect(analyticsEnabled).toBeFalsy();

    global.config.analyticsEnabled = true;

    expect(getFromConfig('analyticsEnabled')).toBeTruthy();
  });

  it('should allow analytics opt-in to be configurable', () => {
    optinCapturing(false);
    expect(posthog.has_opted_out_capturing()).toBeTruthy();

    optinCapturing(true);
    expect(posthog.has_opted_out_capturing()).toBeFalsy();
  });

  it('should fail the init process if the apiKey is not loaded from GTM', () => {
    global.config.analyticsEnabled = true;
    global.window.posthogConfig = {};

    return import('.').then(({ init }) => {
      posthog.__loaded = true;
      expect(init()).toEqual(undefined);
      /* eslint-disable-next-line */
      expect(console.error).toHaveBeenCalledWith(
        'cannot load apiKey value from GTM'
      );
    });
  });

  it('should init posthog with default opts if GTM data is available', () => {
    const apiKey = 'my-key';
    global.config.analyticsEnabled = true;
    global.window.posthogConfig = {
      apiKey,
    };
    const mockInit = jest.fn();

    jest.mock('posthog-js', () => ({
      init: mockInit,
    }));

    return import('.').then(({ init }) => {
      posthog.__loaded = true;
      expect(init()).toEqual(undefined);
      expect(mockInit).toHaveBeenCalledWith(apiKey, {
        api_host: 'https://eu.posthog.com',
        capture_pageview: false,
        disable_persistence: true,
        loaded: expect.any(Function),
        opt_out_capturing_by_default: true,
      });
    });
  });

  it('should not identify the user if analytics is disabled', () => {
    global.config.analyticsEnabled = true;
    const mockIdentify = jest.fn();

    jest.mock('posthog-js', () => ({
      identify: mockIdentify,
    }));

    return import('.').then(({ identify }) => {
      identify(false, 1);
      expect(mockIdentify).not.toHaveBeenCalled();
    });
  });

  it('should identify the user with the given userID', () => {
    // predictable Installation ID
    const installationID = '1775ad46-43ca-4aaa-851a-bd3688702893';
    global.config.analyticsEnabled = true;

    global.config.installationID = installationID;
    global.window.posthogConfig = {
      apiKey: 'my-key',
    };
    const mockIdentify = jest.fn();

    jest.mock('posthog-js', () => ({
      identify: mockIdentify,
    }));

    return import('.').then(({ identify }) => {
      identify(true, 1);
      expect(mockIdentify).toHaveBeenCalledWith(
        'ab156392-96c8-551b-a49b-f071c1cdcf21',
        { installationID }
      );
    });
  });
});
