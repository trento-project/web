import React from 'react';

import { render } from '@testing-library/react';

import { withState } from '@lib/test-utils';
import * as analyticsService from './index';
import { PostHogInit, PostHogIdentify } from './effects';

describe('analytics effect', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('PostHogInit', () => {
    it('should init posthog on load', () => {
      const spyInit = jest.spyOn(analyticsService, 'init');

      render(<PostHogInit />);

      expect(spyInit).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('PostHogIdentify', () => {
    it('should not identify if analytics config is disabled', () => {
      jest
        .spyOn(analyticsService, 'getAnalyticsEnabledConfig')
        .mockReturnValue(false);
      const spyIsLoaded = jest
        .spyOn(analyticsService, 'isLoaded')
        .mockReturnValue(false);

      const [ComponentWithState] = withState(<PostHogIdentify />, {
        user: {
          id: 1,
          analytics_enabled: false,
        },
      });
      render(ComponentWithState);

      expect(spyIsLoaded).not.toHaveBeenCalled();
    });

    it('should not identify if user is not available', () => {
      jest
        .spyOn(analyticsService, 'getAnalyticsEnabledConfig')
        .mockReturnValue(true);
      const spyIsLoaded = jest
        .spyOn(analyticsService, 'isLoaded')
        .mockReturnValue(false);

      const [ComponentWithState] = withState(<PostHogIdentify />, {
        user: {
          id: undefined,
          analytics_enabled: undefined,
        },
      });
      render(ComponentWithState);

      expect(spyIsLoaded).not.toHaveBeenCalled();
    });

    it('should identify if posthog is loaded', () => {
      jest
        .spyOn(analyticsService, 'getAnalyticsEnabledConfig')
        .mockReturnValue(true);
      jest.spyOn(analyticsService, 'isLoaded').mockReturnValue(true);
      const spyIdentify = jest
        .spyOn(analyticsService, 'identify')
        .mockReturnValue();
      const spyoOptinCapturing = jest
        .spyOn(analyticsService, 'optinCapturing')
        .mockReturnValue();

      const userID = 1;
      const [ComponentWithState] = withState(<PostHogIdentify />, {
        user: {
          id: userID,
          analytics_enabled: true,
        },
      });
      render(ComponentWithState);

      expect(spyIdentify).toHaveBeenCalledWith(true, userID);
      expect(spyoOptinCapturing).toHaveBeenCalledWith(true);
    });

    it('should add loaded listener is posthog is not loaded', () => {
      jest
        .spyOn(analyticsService, 'getAnalyticsEnabledConfig')
        .mockReturnValue(true);
      jest.spyOn(analyticsService, 'isLoaded').mockReturnValue(false);
      const spyIdentify = jest
        .spyOn(analyticsService, 'identify')
        .mockReturnValue();
      const spyoOptinCapturing = jest
        .spyOn(analyticsService, 'optinCapturing')
        .mockReturnValue();

      const [ComponentWithState] = withState(<PostHogIdentify />, {
        user: {
          id: 1,
          analytics_enabled: true,
        },
      });
      render(ComponentWithState);

      expect(spyIdentify).not.toHaveBeenCalled();
      expect(spyoOptinCapturing).not.toHaveBeenCalled();
    });
  });
});
