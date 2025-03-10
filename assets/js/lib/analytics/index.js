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
      if (data.opt_in) {
        //Load the Analytics library
        initPosthog();
      }
    });
  } catch (error) {
    console.log('Error fetching analytics settings', error);
  }
}

export const initPosthog = () => {
  posthog.init(analyticsKey, {
    api_host: analyticsUrl,
    capture_pageview: false,
  });
};

export const capture = (event, payload) => {
  if (!analyticsEnabled) {
    return;
  }
  posthog.capture(event, { ...payload, installationID });
};
