import posthog from 'posthog-js';

import { getFromConfig } from '@lib/config/config';

const analyticsEnabled = getFromConfig('analyticsEnabled');
const analyticsKey = getFromConfig('analyticsKey');
const analyticsUrl = getFromConfig('analyticsUrl');
const installationID = getFromConfig('installationID');

if (analyticsEnabled) {
  posthog.init(analyticsKey, {
    api_host: analyticsUrl,
    capture_pageview: false,
  });
}

export const capture = (event, payload) => {
  if (!analyticsEnabled) {
    return;
  }
  posthog.capture(event, { ...payload, installationID });
};
