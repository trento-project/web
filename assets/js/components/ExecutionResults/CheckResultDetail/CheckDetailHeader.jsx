import React from 'react';

import { UNKNOWN_PROVIDER, VMWARE_PROVIDER } from '@lib/model';

import HealthIcon from '@components/Health/HealthIcon';
import WarningBanner from '@components/Banners/WarningBanner';
import CheckResultInfoBox from './CheckResultInfoBox';
import { isTargetCluster } from '../checksUtils';
import BackToTargetExecution from './BackToTargetExecution';

function CheckDetailHeader({
  checkID,
  checkDescription,
  targetID,
  targetType,
  resultTargetType,
  resultTargetName,
  cloudProvider,
  result,
}) {
  const targetCluster = isTargetCluster(targetType);
  return (
    <>
      <BackToTargetExecution targetID={targetID} targetType={targetType} />
      <div className="flex mb-4 justify-between">
        <h1 className="flex text-3xl">
          <span className="inline-flex self-center mr-3">
            <HealthIcon health={result} />
          </span>
          <span className="font-medium">{checkDescription}</span>
        </h1>
      </div>
      {targetCluster && cloudProvider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      {targetCluster && cloudProvider === VMWARE_PROVIDER && (
        <WarningBanner>
          Configuration checks for HANA scale-up performance optimized clusters
          on VMware are still in experimental phase. Please use results with
          caution.
        </WarningBanner>
      )}
      <CheckResultInfoBox
        checkID={checkID}
        resultTargetType={resultTargetType}
        resultTargetName={resultTargetName}
        provider={cloudProvider}
      />
    </>
  );
}

export default CheckDetailHeader;
