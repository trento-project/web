import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { EOS_ARROW_BACK, EOS_CANCEL, EOS_PLAY_CIRCLE } from 'eos-icons-react';
import Button from '@components/Button';
import classNames from 'classnames';

import { Tab } from '@headlessui/react';
import { ChecksSelection } from './ChecksSelection';
import { ConnectionSettings } from './ConnectionSettings';
import { getCluster } from '@state/selectors';
import { TriggerChecksExecutionRequest } from './ClusterDetails';

export const ClusterSettings = () => {
  const { clusterID } = useParams();
  const navigate = useNavigate();

  const cluster = useSelector(getCluster(clusterID));

  const tabsSettings = {
    'Checks Selection': (
      <ChecksSelection clusterId={clusterID} cluster={cluster} />
    ),
    'Connection Settings': (
      <ConnectionSettings clusterId={clusterID} cluster={cluster} />
    ),
  };

  return (
    <div className="w-full px-2 sm:px-0">
      <div className="flex mb-2">
        <h1 className="text-3xl w-1/2">
          <span className="font-medium">Cluster Settings for</span>{' '}
          <span className="font-bold">{cluster && cluster.name}</span>
        </h1>
        <div className="flex w-1/2 justify-end text-white">
          <Button
            className="w-1/3 bg-waterhole-blue text-white"
            size="small"
            onClick={() => navigate(`/clusters/${cluster.id}`)}
          >
            <EOS_ARROW_BACK className="inline-block fill-white" /> Back to
            Cluster
          </Button>
        </div>
      </div>
      <Tab.Group manual>
        <Tab.List className="flex p-1 space-x-1 bg-zinc-300/20 rounded">
          {Object.keys(tabsSettings).map((tabTitle, idx) => (
            <Tab
              key={idx}
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
        <Tab.Panels className="mt-2">
          {Object.values(tabsSettings).map((tabContent, idx) => (
            <Tab.Panel
              key={idx}
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
};

export const SavingFailedAlert = ({ onClose = () => {}, children }) => {
  return (
    <div
      className="rounded relative bg-red-200 border-red-600 text-red-600 border-l-4 p-2 ml-2 pr-10"
      role="alert"
    >
      {children}
      <button
        className="absolute top-0 bottom-0 right-0 pr-2"
        onClick={() => onClose()}
      >
        <EOS_CANCEL size={14} className="fill-red-600" />
      </button>
    </div>
  );
};

export const SuggestTriggeringChecksExecutionAfterSettingsUpdated = ({
  clusterId,
  onClose = () => {},
}) => {
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
          cssClasses="rounded-full group flex rounded-full items-center text-sm px-2 bg-jungle-green-500 text-white"
          clusterId={clusterId}
        >
          <EOS_PLAY_CIRCLE color="green" />
        </TriggerChecksExecutionRequest>
        <button className="ml-1" onClick={() => onClose()}>
          <EOS_CANCEL size={14} className="fill-green-600" />
        </button>
      </div>
    </div>
  );
};
