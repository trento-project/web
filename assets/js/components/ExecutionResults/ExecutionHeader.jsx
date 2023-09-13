import React from 'react';
import classNames from 'classnames';

import { UNKNOWN_PROVIDER, VMWARE_PROVIDER } from '@lib/model';

import ChecksResultFilters from '@components/ExecutionResults/ChecksResultFilters';
import WarningBanner from '@components/Banners/WarningBanner';
import { isTargetCluster } from './checksUtils';
import BackToTargetDetails from './BackToTargetDetails';
import TargetInfoBox from './TargetInfoBox';

export const clusterWarningBanner = {
  [UNKNOWN_PROVIDER]: (
    <WarningBanner>
      The following results are valid for on-premise bare metal platforms.
      <br />
      If you are running your HANA cluster on a different platform, please use
      results with caution
    </WarningBanner>
  ),
  [VMWARE_PROVIDER]: (
    <WarningBanner>
      Configuration checks for HANA scale-up performance optimized clusters on
      VMware are still in experimental phase. Please use results with caution.
    </WarningBanner>
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
      {targetCluster && clusterWarningBanner[target.provider]}
      <TargetInfoBox targetType={targetType} target={target} />
    </>
  );
}

export default ExecutionHeader;
