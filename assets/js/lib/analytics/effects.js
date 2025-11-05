import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  capture,
  getAnalyticsEnabledConfig,
  identify,
  init,
  isLoaded,
  optinCapturing,
} from '@lib/analytics';
import { getFromConfig } from '@lib/config';
import { useSelector } from 'react-redux';
import { getUserProfile } from '@state/selectors/user';

// Check if posthog is loaded properly before identifying the user. Based on:
// https://www.typekaizen.com/posts/posthog-remix/

const POSTHOG_LOADED_EVENT = 'posthog_loaded';

const dispatchPosthogLoadedEvent = () => {
  document.dispatchEvent(new CustomEvent(POSTHOG_LOADED_EVENT));
};

const addPostHogLoadedListener = (callback) => {
  document.addEventListener(POSTHOG_LOADED_EVENT, callback, { once: true });
  return {
    cleanup: () => {
      document.removeEventListener(POSTHOG_LOADED_EVENT, callback);
    },
  };
};

const identifyUser = (analyticsEnabled, userID) => {
  identify(analyticsEnabled, userID);
  optinCapturing(analyticsEnabled);
};

export function PostHogInit() {
  useEffect(() => {
    init(dispatchPosthogLoadedEvent);
  }, []);

  return null;
}

export function PostHogIdentify() {
  const { id: userID, analytics_enabled: analyticsEnabled } =
    useSelector(getUserProfile);

  useEffect(() => {
    if (!getAnalyticsEnabledConfig()) {
      return;
    }

    if (!userID && analyticsEnabled === undefined) {
      return;
    }

    if (isLoaded()) {
      identifyUser(analyticsEnabled, userID);
    } else {
      // If not loaded, set up a listener for the load event
      const onLoad = () => {
        identifyUser(analyticsEnabled, userID);
      };

      const { cleanup } = addPostHogLoadedListener(onLoad);
      return cleanup;
    }
  }, [userID, analyticsEnabled]);

  return null;
}

export function PostHogPageView() {
  const location = useLocation();
  const { analytics_enabled: analyticsEnabled } = useSelector(getUserProfile);
  const webversion = getFromConfig('webversion');

  // Track pageviews
  useEffect(() => {
    capture(analyticsEnabled, '$pageview', {
      $current_url: window.location.href,
      webversion,
    });
  }, [location]);

  return null;
}
