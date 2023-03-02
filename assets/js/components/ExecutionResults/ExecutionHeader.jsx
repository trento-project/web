import React from 'react';
import classNames from 'classnames';

import BackButton from '@components/BackButton';
import WarningBanner from '@components/Banners/WarningBanner';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';
import { ClusterInfoBox } from '@components/ClusterDetails';

import ChecksResultFilters from '@components/ExecutionResults/ChecksResultFilters';

function ExecutionHeader({
  clusterID,
  clusterName,
  cloudProvider,
  clusterScenario,
  onFilterChange = () => {},
}) {
  return (
    <>
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <div className="flex mb-4 justify-between">
        <h1 className="text-3xl w-3/5">
          <span className="font-medium">Checks Results for cluster</span>{' '}
          <span
            className={classNames(
              'font-bold truncate w-60 inline-block align-top'
            )}
          >
            {clusterName}
          </span>
        </h1>
        <ChecksResultFilters onChange={onFilterChange} />
      </div>
      {cloudProvider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      <ClusterInfoBox haScenario={clusterScenario} provider={cloudProvider} />
    </>
  );
}

export default ExecutionHeader;
