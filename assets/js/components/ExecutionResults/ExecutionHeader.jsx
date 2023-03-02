import React from 'react';
import classNames from 'classnames';

import BackButton from '@components/BackButton';
import { providerWarningBanners } from '@components/ClusterDetails/ClusterSettings';
import { ClusterInfoBox } from '@components/ClusterDetails';

import ChecksResultFilters from '@components/ExecutionResults/ChecksResultFilters';

function ExecutionHeader({
  clusterID,
  clusterName,
  cloudProvider,
  clusterScenario,
  onFilterChange = () => {},
}) {
  const warning = providerWarningBanners[cloudProvider];

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
      {warning}
      <ClusterInfoBox haScenario={clusterScenario} provider={cloudProvider} />
    </>
  );
}

export default ExecutionHeader;
