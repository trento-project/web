import posthog from 'posthog-js';
import { v5 as uuidv5 } from 'uuid';

import { getFromConfig } from '@lib/config/config';

const analyticsEnabledConfig = getFromConfig('analyticsEnabled');
const analyticsKey = getFromConfig('analyticsKey');
const analyticsUrl = getFromConfig('analyticsUrl');
const installationID = getFromConfig('installationID');

if (analyticsEnabledConfig) {
  posthog.init(analyticsKey, {
    api_host: analyticsUrl,
    opt_out_capturing_by_default: true,
    capture_pageview: false,
    disable_persistence: true,
  });
}

export const getAnalyticsEnabledConfig = () => analyticsEnabledConfig;

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
  if (analyticsEnabled && posthog.has_opted_out_capturing()) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
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
