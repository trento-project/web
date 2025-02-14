import posthog from 'posthog-js';

import { getFromConfig } from '@lib/config/config';

const analyticsEnabled = getFromConfig('analyticsEnabled');
const analyticsKey = getFromConfig('analyticsKey');
const analyticsUrl = getFromConfig('analyticsUrl');

if (analyticsEnabled) {
  posthog.init(analyticsKey, {
    api_host: analyticsUrl,
  });
}
