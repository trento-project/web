import React from 'react';

import { EOS_WARNING_OUTLINED } from 'eos-icons-react';
import { UNKNOWN_PROVIDER } from '@lib/model';

function WarningBanner({ children }) {
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
}

const providerWarningBanners = {
  [UNKNOWN_PROVIDER]: {
    default: (
      <WarningBanner>
        The following catalog is valid for on-premise bare metal platforms.
        <br />
        If you are running your HANA cluster on a different platform, please use
        results with caution
      </WarningBanner>
    ),
    result: (
      <WarningBanner>
        The following results are valid for on-premise bare metal platforms.
        <br />
        If you are running your HANA cluster on a different platform, please use
        results with caution
      </WarningBanner>
    ),
  },
  vmware: {
    default: (
      <WarningBanner>
        Configuration checks for HANA scale-up performance optimized clusters on
        VMware are still in experimental phase. Please use results with caution.
      </WarningBanner>
    ),
  },
};

export const getProviderWarningBanner = (provider) => {
  const providerBanners = providerWarningBanners[provider];
  if (!providerBanners) {
    return null;
  }
  return providerBanners.default;
};

export const getResultProviderWarningBanner = (provider) => {
  const providerBanners = providerWarningBanners[provider];
  if (!providerBanners) {
    return null;
  }
  return providerBanners.result || providerBanners.default;
};

export default WarningBanner;
