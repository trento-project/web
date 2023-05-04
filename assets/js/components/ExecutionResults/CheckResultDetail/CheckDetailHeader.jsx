import React from 'react';

import BackButton from '@components/BackButton';
import HealthIcon from '@components/Health/HealthIcon';
import WarningBanner from '@components/Banners/WarningBanner';
import { UNKNOWN_PROVIDER, VMWARE_PROVIDER } from '@lib/model';
import CheckResultInfoBox from './CheckResultInfoBox';

function CheckDetailHeader({
  clusterID,
  checkID,
  checkDescription,
  targetType,
  targetName,
  cloudProvider,
  result,
}) {
  return (
    <>
      <BackButton url={`/clusters/${clusterID}/executions/last`}>
        Back to Check Results
      </BackButton>
      <div className="flex mb-4 justify-between">
        <h1 className="flex text-3xl">
          <span className="inline-flex self-center mr-3">
            <HealthIcon health={result} />
          </span>
          <span className="font-medium">{checkDescription}</span>
        </h1>
      </div>
      {cloudProvider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      {cloudProvider === VMWARE_PROVIDER && (
        <WarningBanner>
          Configuration checks for HANA scale-up performance optimized clusters
          on VMware are still in experimental phase. Please use results with
          caution.
        </WarningBanner>
      )}
      <CheckResultInfoBox
        checkID={checkID}
        targetType={targetType}
        targetName={targetName}
        provider={cloudProvider}
      />
    </>
  );
}

export default CheckDetailHeader;
