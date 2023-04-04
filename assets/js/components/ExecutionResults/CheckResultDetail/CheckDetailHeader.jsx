import React from 'react';

import BackButton from '@components/BackButton';
import { providerWarningBanners } from '@components/ClusterDetails/ClusterSettings';
import HealthIcon from '@components/Health/HealthIcon';
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
  const warning = providerWarningBanners[cloudProvider];

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
      {warning}
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
