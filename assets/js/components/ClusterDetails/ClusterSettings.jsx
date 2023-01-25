import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { EOS_CANCEL, EOS_PLAY_CIRCLE } from 'eos-icons-react';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import ChecksSelection from '@components/ClusterDetails/ChecksSelection';
import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';
import WarningBanner from '@components/Banners/WarningBanner';
import { getClusterName } from '@components/ClusterLink';
import { ClusterInfoBox } from '@components/ClusterDetails';

import { getCluster } from '@state/selectors';
import { getClusterHostIDs } from '@state/selectors/cluster';

export const UNKNOWN_PROVIDER = 'unknown';

export function ClusterSettings() {
  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));

  if (!cluster) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <PageHeader>
        Cluster Settings for{' '}
        <span className="font-bold">{getClusterName(cluster)}</span>
      </PageHeader>
      <ClusterInfoBox haScenario={cluster.type} provider={cluster.provider} />
      {cluster.provider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following catalog is valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      <ChecksSelection clusterId={clusterID} cluster={cluster} />
    </div>
  );
}

export function SavingFailedAlert({ onClose = () => {}, children }) {
  return (
    <div
      className="rounded relative bg-red-200 border-red-600 text-red-600 border-l-4 p-2 ml-2 pr-10"
      role="alert"
    >
      {children}
      <button
        type="button"
        className="absolute top-0 bottom-0 right-0 pr-2"
        onClick={() => onClose()}
      >
        <EOS_CANCEL size={14} className="fill-red-600" />
      </button>
    </div>
  );
}

export function SuggestTriggeringChecksExecutionAfterSettingsUpdated({
  clusterId,
  selectedChecks,
  onClose = () => {},
  onStartExecution = () => {},
}) {
  return (
    <div>
      <div
        className="flex first-letter:rounded relative bg-green-200 border-green-600 text-green-600 border-l-4 p-2 ml-2"
        role="alert"
      >
        <p className="mr-1">
          Well done! To start execution now, click here 👉{' '}
        </p>
        <TriggerChecksExecutionRequest
          cssClasses="tn-checks-start-execute rounded-full group flex rounded-full items-center text-sm px-2 bg-jungle-green-500 text-white"
          clusterId={clusterId}
          hosts={useSelector(getClusterHostIDs(clusterId))}
          checks={selectedChecks}
          onStartExecution={onStartExecution}
        >
          <EOS_PLAY_CIRCLE color="green" />
        </TriggerChecksExecutionRequest>
        <button className="ml-1" onClick={() => onClose()} type="button">
          <EOS_CANCEL size={14} className="fill-green-600" />
        </button>
      </div>
    </div>
  );
}
