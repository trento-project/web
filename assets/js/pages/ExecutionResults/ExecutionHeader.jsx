import React from 'react';
import classNames from 'classnames';

import Banner from '@common/Banners/Banner';

import { UNKNOWN_PROVIDER } from '@lib/model';
import ChecksResultFilters from '@pages/ExecutionResults/ChecksResultFilters';

import { isTargetCluster } from './checksUtils';
import BackToTargetDetails from './BackToTargetDetails';
import TargetInfoBox from './TargetInfoBox';

export const clusterBanner = {
  [UNKNOWN_PROVIDER]: (
    <Banner type="warning">
      The following results are valid for on-premise bare metal platforms.
      <br />
      If you are running your HANA cluster on a different platform, please use
      results with caution
    </Banner>
  ),
};

function ExecutionHeader({
  targetID,
  targetName,
  targetType,
  target,
  savedFilters,
  onFilterChange = () => {},
  onFilterSave = () => {},
}) {
  const targetCluster = isTargetCluster(targetType);
  return (
    <>
      <BackToTargetDetails targetType={targetType} targetID={targetID} />
      <div className="flex mb-4 justify-between">
        <h1 className="text-3xl w-3/5">
          <span className="font-medium">Checks Results for {targetType}</span>{' '}
          <span
            className={classNames(
              'font-bold truncate w-60 inline-block align-top'
            )}
          >
            {targetName}
          </span>
        </h1>
        <ChecksResultFilters
          savedFilters={savedFilters}
          onChange={onFilterChange}
          onSave={onFilterSave}
        />
      </div>
      {targetCluster && clusterBanner[target.provider]}
      <TargetInfoBox targetType={targetType} target={target} />
    </>
  );
}

export default ExecutionHeader;
