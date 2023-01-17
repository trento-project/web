import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { EOS_CANCEL, EOS_PLAY_CIRCLE } from 'eos-icons-react';
import classNames from 'classnames';

import BackButton from '@components/BackButton';
import { Tab } from '@headlessui/react';
import { ChecksSelection } from '@components/ClusterDetails/ChecksSelection';
import { getCluster } from '@state/selectors';
import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';
import { getClusterName } from '@components/ClusterLink';
import WarningBanner from '@components/Banners/WarningBanner';
import { ConnectionSettings, ClusterInfoBox } from '@components/ClusterDetails';
import { getClusterHostIDs } from '@state/selectors/cluster';

import { truncatedClusterNameClasses } from './ClusterDetails';

export const UNKNOWN_PROVIDER = 'unknown';

export function ClusterSettings() {
  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));

  const tabsSettings = {
    'Checks Selection': (
      <ChecksSelection clusterId={clusterID} cluster={cluster} />
    ),
    'Connection Settings': (
      <ConnectionSettings clusterId={clusterID} cluster={cluster} />
    ),
  };

  if (!cluster) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <div className="flex mb-2">
        <h1 className="text-3xl w-1/2">
          <span className="font-medium">Cluster Settings for</span>{' '}
          <span className={`font-bold ${truncatedClusterNameClasses}`}>
            {getClusterName(cluster)}
          </span>
        </h1>
      </div>
      <Tab.Group manual>
        <Tab.List className="flex p-1 space-x-1 bg-zinc-300/20 rounded">
          {Object.keys(tabsSettings).map((tabTitle) => (
            <Tab
              key={tabTitle}
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm leading-5 font-medium rounded',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-800 hover:bg-white/[0.12]'
                )
              }
            >
              {tabTitle}
            </Tab>
          ))}
        </Tab.List>
        <ClusterInfoBox haScenario={cluster.type} provider={cluster.provider} />
        {cluster.provider === UNKNOWN_PROVIDER && (
          <WarningBanner>
            The following catalog is valid for on-premise bare metal platforms.
            <br />
            If you are running your HANA cluster on a different platform, please
            use results with caution
          </WarningBanner>
        )}
        <Tab.Panels className="mt-2">
          {Object.entries(tabsSettings).map(([tabTitle, tabContent]) => (
            <Tab.Panel
              key={tabTitle}
              className={classNames(
                'bg-white rounded p-3',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-white ring-opacity-60'
              )}
            >
              {tabContent}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
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
  usingNewChecksEngine = false,
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
          usingNewChecksEngine={usingNewChecksEngine}
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
