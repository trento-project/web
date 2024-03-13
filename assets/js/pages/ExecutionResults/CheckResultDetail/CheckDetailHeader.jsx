import React from 'react';

import HealthIcon from '@common/HealthIcon';
import { clusterBanner } from '@pages/ExecutionResults/ExecutionHeader';
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
      {targetCluster && clusterBanner[cloudProvider]}
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
