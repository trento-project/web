import posthog from 'posthog-js';
import { v5 as uuidv5 } from 'uuid';
import { get, has, noop } from 'lodash';

import { logError } from '@lib/log';
import { getFromConfig } from '@lib/config/config';

const DEFAULT_OPTS = {
  api_host: 'https://eu.posthog.com',
  opt_out_capturing_by_default: true,
  capture_pageview: false,
  disable_persistence: true,
};

const analyticsEnabledConfig = getFromConfig('analyticsEnabled');
const installationID = getFromConfig('installationID');

// window.posthogConfig is loaded from GTM snippet
const getGtmConfig = () => window.posthogConfig;

// TODO: Remove this when this feature is ready for production
export const getAnalyticsEnabledConfig = () => analyticsEnabledConfig;

export const isLoaded = () => posthog.__loaded;

// initialize posthog waiting until the required data is loaded from GTM
export const init = (loadedFunc = noop) => {
  if (!analyticsEnabledConfig) {
    return;
  }

  if (isLoaded()) {
    return;
  }

  const gtmConfig = getGtmConfig();

  if (gtmConfig) {
    if (!has(gtmConfig, 'apiKey')) {
      logError('cannot load apiKey value from GTM');
      return;
    }

    const analyticsKey = get(gtmConfig, 'apiKey');
    const opts = { ...DEFAULT_OPTS, ...get(gtmConfig, 'config', {}) };

    posthog.init(analyticsKey, {
      ...opts,
      loaded: (_posthog) => {
        loadedFunc();
      },
    });
  } else {
    setTimeout(init, 100);
  }
};

export const identify = (analyticsEnabled, userID) => {
  if (!analyticsEnabled) {
    return;
  }

  const distinctUserID = uuidv5(userID.toString(), installationID);
  posthog.identify(distinctUserID, {
    installationID,
  });
};

export const optinCapturing = (analyticsEnabled) => {
  if (!analyticsEnabled) {
    posthog.opt_out_capturing();
    return;
  }

  if (posthog.has_opted_out_capturing()) {
    posthog.opt_in_capturing();
  }
};

export const capture = (analyticsEnabled, event, payload) => {
  if (!analyticsEnabled) {
    return;
  }
  posthog.capture(event, { ...payload });
};

export const reset = () => {
  if (!analyticsEnabledConfig) {
    return;
  }

  posthog.reset();
};
