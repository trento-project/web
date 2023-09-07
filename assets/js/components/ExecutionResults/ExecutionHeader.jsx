import React from 'react';
import classNames from 'classnames';

import {
  UNKNOWN_PROVIDER,
  VMWARE_PROVIDER,
  TARGET_CLUSTER,
  TARGET_HOST,
} from '@lib/model';

import BackButton from '@components/BackButton';
import { ClusterInfoBox } from '@components/ClusterDetails';
import HostInfoBox from '@components/HostDetails/HostInfoBox';

import ChecksResultFilters from '@components/ExecutionResults/ChecksResultFilters';
import WarningBanner from '@components/Banners/WarningBanner';
import { isTargetCluster } from './checksUtils';

function ExecutionHeader({
  targetID,
  targetName,
  targetType,
  target,
  savedFilters,
  onFilterChange = () => {},
  onFilterSave = () => {},
}) {
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
      {isTargetCluster(targetType) && (
        <ClusterWarningBanner cloudProvider={target.provider} />
      )}
      <TargetInfoBox targetType={targetType} target={target} />
    </>
  );
}

function BackToTargetDetails({ targetType, targetID }) {
  switch (targetType) {
    case TARGET_CLUSTER:
      return (
        <BackButton url={`/clusters/${targetID}`}>
          Back to Cluster Details
        </BackButton>
      );
    case TARGET_HOST:
      return (
        <BackButton url={`/hosts/${targetID}`}>Back to Host Details</BackButton>
      );
    default:
      return null;
  }
}

function TargetInfoBox({ targetType, target }) {
  switch (targetType) {
    case TARGET_CLUSTER:
      return (
        <ClusterInfoBox haScenario={target.type} provider={target.provider} />
      );
    case TARGET_HOST:
      return (
        <HostInfoBox
          provider={target.provider}
          agentVersion={target.agent_version}
        />
      );
    default:
      return null;
  }
}

function ClusterWarningBanner({ cloudProvider }) {
  switch (cloudProvider) {
    case UNKNOWN_PROVIDER:
      return (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      );
    case VMWARE_PROVIDER:
      return (
        <WarningBanner>
          Configuration checks for HANA scale-up performance optimized clusters
          on VMware are still in experimental phase. Please use results with
          caution.
        </WarningBanner>
      );
    default:
  }
  return null;
}

export default ExecutionHeader;
