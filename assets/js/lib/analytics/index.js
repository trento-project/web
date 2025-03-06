import posthog from 'posthog-js';

import { getFromConfig } from '@lib/config/config';
import { getSettings } from '@lib/api/analyticsSettings';

const analyticsEnabled = getFromConfig('analyticsEnabled');
const analyticsKey = getFromConfig('analyticsKey');
const analyticsUrl = getFromConfig('analyticsUrl');
const installationID = getFromConfig('installationID');

// Check if Analytics is enabled
if (analyticsEnabled) {
  try {
    //Fetch Analytics settings from the API
    getSettings().then(({ data }) => {
      if (data.analytics_optin) {
        //Load the Analytics library
        posthog.init(analyticsKey, {
          api_host: analyticsUrl,
          capture_pageview: false,
        });
      }
    });
  } catch (error) {
    console.log('Error fetching analytics settings', error);
  }
}

export const capture = (event, payload) => {
  if (!analyticsEnabled) {
    return;
  }
  posthog.capture(event, { ...payload, installationID });
};
