import React from 'react';

import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

const WarningBanner = ({ children }) => {
  return (
    <div className="bg-yellow-50 rounded-lg mt-2 mb-2 p-3 border-2 border-yellow-500">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex w-0 flex-1 items-center">
          <EOS_WARNING_OUTLINED className="h-6 w-6 fill-yellow-500" />
          <p className="ml-3 truncate font-medium">
            <span
              data-testid="warning-banner"
              className="md:inline text-yellow-500"
            >
              {children}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarningBanner;
