import React from 'react';
import { noop } from 'lodash';
import { getFromConfig } from '@lib/config/config';

import Button from '@common/Button';

function AnalyticsConfig({ onEditClick = noop }) {
  analyticsEnabled = getFromConfig('analyticsEnabled');
  if (!analyticsEnabled) {
    return;
  }
  return (
    <div className="pt-4">
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold inline-block">Analytics Config</h2>
          <span className="float-right">
            <Button type="primary-white-fit" size="small" onClick={onEditClick}>
              Edit Settings
            </Button>
          </span>
        </div>
        <p className="mt-3 mb-3 text-gray-500">
          Collect anonymous metrics to help improve the application.
        </p>

        <div className="grid grid-cols-6 mt-5 items-center">
          <div className="font-bold mb-3">Collect Analytics</div>
          <div
            aria-label="retention-time"
            className="col-span-2 text-gray-500 mb-3 pr-12"
          >
            {analyticsEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsConfig;
