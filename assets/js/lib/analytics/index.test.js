// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { getFromConfig } from '@lib/config/config';
import posthog from 'posthog-js';
import { optinCapturing } from '.';

describe('analytics', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation(() => null);
    jest.useRealTimers();
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
        before_send: expect.any(Function),
        opt_out_capturing_by_default: true,
      });
    });
  });

  it('should preserve the loaded callback across GTM config retries', () => {
    jest.useFakeTimers();

    const apiKey = 'my-key';
    global.config.analyticsEnabled = true;
    global.window.posthogConfig = undefined;

    const mockInit = jest.fn((_key, opts) => opts.loaded());

    jest.mock('posthog-js', () => ({
      init: mockInit,
    }));

    return import('.').then(({ init }) => {
      const loadedFunc = jest.fn();
      init(loadedFunc);

      expect(mockInit).not.toHaveBeenCalled();

      global.window.posthogConfig = { apiKey };
      jest.advanceTimersByTime(100);

      expect(mockInit).toHaveBeenCalledWith(
        apiKey,
        expect.objectContaining({ loaded: expect.any(Function) })
      );
      expect(loadedFunc).toHaveBeenCalled();
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
    const installationMethod = 'rpm';
    global.config.analyticsEnabled = true;

    global.config.installationID = installationID;
    global.config.installationMethod = installationMethod;
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
        { installationID, installationMethod }
      );
    });
  });

  it.each([
    {
      beforeEvent: {
        event: '$autocapture',
        properties: {
          $el_text: 'toBeMasked',
          $elements_chain: '<span class="ph-mask">"toBeMasked"</span>',
        },
      },
      updatedEvent: {
        event: '$autocapture',
        properties: {
          $el_text: '*****',
          $elements_chain: '<span class="ph-mask">"*****"</span>',
        },
      },
    },
    {
      beforeEvent: {
        event: '$autocapture',
        properties: {
          $el_text: 'goodToGo',
          $elements_chain: '<span>"goodToGo"</span>',
        },
      },
      updatedEvent: {
        event: '$autocapture',
        properties: {
          $el_text: 'goodToGo',
          $elements_chain: '<span>"goodToGo"</span>',
        },
      },
    },
    {
      beforeEvent: null,
      updatedEvent: null,
    },
    {
      beforeEvent: {
        event: '$snapshot',
        properties: {
          $el_text: 'toBeMasked',
          $elements_chain: '<span class="ph-mask">"toBeMasked"</span>',
        },
      },
      updatedEvent: {
        event: '$snapshot',
        properties: {
          $el_text: 'toBeMasked',
          $elements_chain: '<span class="ph-mask">"toBeMasked"</span>',
        },
      },
    },
  ])(
    'should mask event text before sending it',
    ({ beforeEvent, updatedEvent }) => {
      const mockInit = jest.fn();

      jest.mock('posthog-js', () => ({
        init: mockInit,
      }));

      return import('.').then(({ init }) => {
        init();
        const initArgs = mockInit.mock.calls[0];
        const config = initArgs[1];
        const beforeSend = config.before_send;
        expect(beforeSend(beforeEvent)).toStrictEqual(updatedEvent);
      });
    }
  );

  it('should not raw capture the event if the apiKey has not been loaded from GTM', () => {
    global.window.posthogConfig = {};

    return import('.').then(({ rawCapture }) => {
      rawCapture(1, 'eula_displayed', {});
      /* eslint-disable-next-line */
      expect(console.error).toHaveBeenCalledWith(
        'cannot load apiKey value from GTM'
      );
    });
  });

  it.each([
    {
      config: { api_host: 'https://eu.posthog.com' },
      expectedApiHost: 'https://eu.posthog.com',
    },
    {
      config: {},
      expectedApiHost: 'https://eu.posthog.com',
    },
  ])(
    'should raw capture the event with the expected payload',
    ({ config, expectedApiHost }) => {
      const apiKey = 'my-key';
      const userID = 1;
      const installationID = '1775ad46-43ca-4aaa-851a-bd3688702893';
      const installationMethod = 'container';
      const distinctUserID = 'ab156392-96c8-551b-a49b-f071c1cdcf21';

      global.config.webversion = '1.2.3';
      global.window.posthogConfig = {
        apiKey,
        config,
      };
      global.config.installationID = installationID;
      global.config.installationMethod = installationMethod;
      const mockApiCapture = jest.fn().mockResolvedValue();

      jest.mock('@lib/api/analytics', () => ({ capture: mockApiCapture }));

      return import('.').then(({ rawCapture }) => {
        rawCapture(userID, 'eula_displayed', { foo: 'bar' });

        expect(mockApiCapture).toHaveBeenCalledWith(
          expectedApiHost,
          apiKey,
          'eula_displayed',
          distinctUserID,
          {
            foo: 'bar',
            $lib: 'web',
            webversion: '1.2.3',
            $process_person_profile: true,
            $set_once: { installationID, installationMethod },
          }
        );
      });
    }
  );

  it('should log an error when the raw capture request fails', () => {
    global.window.posthogConfig = {
      apiKey: 'my-key',
      config: { api_host: 'https://eu.posthog.com' },
    };
    const mockApiCapture = jest
      .fn()
      .mockRejectedValue(new Error('network error'));

    jest.mock('@lib/api/analytics', () => ({ capture: mockApiCapture }));

    return import('.').then(async ({ rawCapture }) => {
      rawCapture(1, 'eula_displayed', {});
      await Promise.resolve();
      /* eslint-disable-next-line */
      expect(console.error).toHaveBeenCalledWith(
        'error capturing Posthog raw event: network error'
      );
    });
  });
});
