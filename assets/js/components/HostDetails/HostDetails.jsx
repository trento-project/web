import React, { useState } from 'react';
import classNames from 'classnames';

import { EOS_CLEAR_ALL, EOS_PLAY_CIRCLE, EOS_SETTINGS } from 'eos-icons-react';

import { agentVersionWarning } from '@lib/agent';

import Button from '@components/Button';
import ListView from '@components/ListView';
import Table from '@components/Table';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import ClusterLink from '@components/ClusterLink';
import WarningBanner from '@components/Banners/WarningBanner';
import CleanUpButton from '@components/CleanUpButton';
import DeregistrationModal from '@components/DeregistrationModal';
import { canStartExecution } from '@components/ChecksSelection';

import SuseLogo from '@static/suse_logo.svg';

import StatusPill from './StatusPill';
import ProviderDetails from './ProviderDetails';

import {
  subscriptionsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';

function HostDetails({
  agentVersion,
  cluster,
  deregisterable,
  deregistering,
  exportersStatus = {},
  grafanaPublicUrl,
  heartbeat,
  hostID,
  hostname,
  provider,
  providerData,
  sapSystems,
  savingChecks,
  selectedChecks = [],
  slesSubscriptions,
  cleanUpHost,
  requestHostChecksExecution,
  navigate,
}) {
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);

  const versionWarningMessage = agentVersionWarning(agentVersion);

  const renderedExporters = Object.entries(exportersStatus).map(
    ([exporterName, exporterStatus]) => (
      <StatusPill
        key={exporterName}
        className="self-center ml-4 shadow"
        heartbeat={exporterStatus}
      >
        {exporterName}
      </StatusPill>
    )
  );

  return (
    <>
      <DeregistrationModal
        hostname={hostname}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          setCleanUpModalOpen(false);
          cleanUpHost();
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      <div>
        <BackButton url="/hosts">Back to Hosts</BackButton>
        <div className="flex flex-wrap">
          <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
            <PageHeader>
              Host Details: <span className="font-bold">{hostname}</span>
            </PageHeader>
          </div>
          <div className="flex w-1/2 justify-end">
            <div className="flex w-fit whitespace-nowrap">
              {deregisterable && (
                <CleanUpButton
                  cleaning={deregistering}
                  onClick={() => {
                    setCleanUpModalOpen(true);
                  }}
                />
              )}
              <Button
                type="primary-white"
                className="inline-block mx-0.5 border-green-500 border"
                size="small"
                onClick={() => navigate(`/hosts/${hostID}/settings`)}
              >
                <EOS_SETTINGS className="inline-block fill-jungle-green-500" />{' '}
                Check Selection
              </Button>

              <Button
                type="primary-white"
                className="mx-0.5 border-green-500 border disabled:bg-slate-50 disabled:text-slate-500 disabled:border-gray-400"
                size="small"
                onClick={() => navigate(`/hosts/${hostID}/executions/last`)}
                disabled
              >
                <EOS_CLEAR_ALL
                  className={classNames('inline-block ', {
                    'fill-jungle-green-500': false,
                    'fill-slate-500': true,
                  })}
                />{' '}
                <span>Show Results</span>
              </Button>

              <Button
                type="primary"
                className="mx-1"
                onClick={requestHostChecksExecution}
                disabled={!canStartExecution(selectedChecks, savingChecks)}
              >
                <EOS_PLAY_CIRCLE className="fill-white inline-block align-sub" />{' '}
                Start Execution
              </Button>
            </div>
          </div>
          <div className="pb-3">
            <StatusPill className="self-center shadow" heartbeat={heartbeat}>
              Agent
            </StatusPill>
            {renderedExporters}
          </div>
        </div>
        {versionWarningMessage && (
          <WarningBanner>{versionWarningMessage}</WarningBanner>
        )}
        <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
          <ListView
            orientation="vertical"
            data={[
              { title: 'Name', content: hostname },
              {
                title: 'Cluster',
                content: <ClusterLink cluster={cluster} />,
              },
              { title: 'Agent version', content: agentVersion },
            ]}
          />
        </div>
        <div className="mt-8 bg-white shadow rounded-lg py-4 px-8">
          <iframe
            title="node-exporter chart"
            src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=77&var-agentID=${hostID}`}
            width="100%"
            height="200"
            frameBorder="0"
          />
        </div>
        <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
          <iframe
            title="node-exporter chart trento"
            src={`${grafanaPublicUrl}/d-solo/rYdddlPWj/node-exporter-full?orgId=1&refresh=1m&theme=light&panelId=78&var-agentID=${hostID}`}
            width="100%"
            height="200"
            frameBorder="0"
          />
        </div>

        <div className="mt-16">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Provider details</h2>
          </div>
          <ProviderDetails provider={provider} provider_data={providerData} />
        </div>

        <div className="mt-8">
          <div>
            <h2 className="text-2xl font-bold">SAP instances</h2>
          </div>
          <Table config={sapInstancesTableConfiguration} data={sapSystems} />
        </div>

        <div className="mt-16">
          <div className="flex flex-direction-row">
            <img src={SuseLogo} className="h-12" alt="suse company logo" />
            <h2 className="ml-2 text-2xl font-bold self-center">
              SLES subscription details
            </h2>
          </div>
          <Table
            config={subscriptionsTableConfiguration}
            data={slesSubscriptions}
          />
        </div>
      </div>
    </>
  );
}

export default HostDetails;
