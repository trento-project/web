import React, { useState } from 'react';
import { get } from 'lodash';
import { EOS_CLEAR_ALL, EOS_PLAY_CIRCLE, EOS_SETTINGS } from 'eos-icons-react';

import { agentVersionWarning } from '@lib/agent';

import Button from '@common/Button';
import Table from '@components/Table';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';

import CleanUpButton from '@components/CleanUpButton';
import DeregistrationModal from '@components/DeregistrationModal';
import { canStartExecution } from '@components/ChecksSelection';
import Tooltip from '@components/Tooltip';

import SuseLogo from '@static/suse_logo.svg';
import CheckResultsOverview from '@components/CheckResultsOverview';

import WarningBanner from '@common/Banners/WarningBanner';

import StatusPill from './StatusPill';
import ProviderDetails from './ProviderDetails';
import SaptuneSummary from './SaptuneSummary';
import HostSummary from './HostSummary';

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
  ipAddresses = [],
  provider,
  providerData,
  sapInstances,
  savingChecks,
  saptuneStatus = {},
  selectedChecks = [],
  slesSubscriptions,
  catalog,
  lastExecution,
  cleanUpHost,
  requestHostChecksExecution,
  navigate,
}) {
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);

  const versionWarningMessage = agentVersionWarning(agentVersion);

  const saptuneVersion = get(saptuneStatus, 'package_version');
  const saptuneConfiguredVersion = get(saptuneStatus, 'configured_version');
  const saptuneTuning = get(saptuneStatus, 'tuning_state');

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

  const catalogData = get(catalog, 'data');
  const catalogLoading = get(catalog, 'loading');
  const catalogError = get(catalog, 'error');

  const lastExecutionData = get(lastExecution, 'data');
  const lastExecutionLoading = get(lastExecution, 'loading');
  const lastExecutionError = get(lastExecution, 'error');

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
                className="mx-0.5 border-green-500 border"
                size="small"
                onClick={() => navigate(`/hosts/${hostID}/executions/last`)}
              >
                <EOS_CLEAR_ALL className="inline-block fill-jungle-green-500" />
                Show Results
              </Button>

              <Tooltip
                isEnabled={!canStartExecution(selectedChecks, savingChecks)}
                content="Select some Checks first!"
                place="bottom"
              >
                <Button
                  type="primary"
                  className="mx-1"
                  onClick={requestHostChecksExecution}
                  disabled={!canStartExecution(selectedChecks, savingChecks)}
                >
                  <EOS_PLAY_CIRCLE
                    className={`${
                      canStartExecution(selectedChecks, savingChecks)
                        ? 'fill-white'
                        : 'fill-gray-200'
                    } inline-block align-sub`}
                  />{' '}
                  Start Execution
                </Button>
              </Tooltip>
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
        <div className="flex xl:flex-row flex-col">
          <HostSummary
            agentVersion={agentVersion}
            cluster={cluster}
            ipAddresses={ipAddresses}
          />
          <div className="flex flex-col mt-4 bg-white shadow rounded-lg pt-8 px-8 xl:w-2/5 mr-4">
            <SaptuneSummary
              saptuneVersion={saptuneVersion}
              saptuneConfiguredVersion={saptuneConfiguredVersion}
              saptuneTuning={saptuneTuning}
              onViewDetails={() => navigate(`/hosts/${hostID}/saptune`)}
            />
          </div>
          <div className="mt-4 bg-white shadow rounded-lg py-4 xl:w-1/4">
            <CheckResultsOverview
              data={lastExecutionData}
              catalogDataEmpty={catalogData?.length === 0}
              loading={catalogLoading || lastExecutionLoading}
              error={catalogError || lastExecutionError}
              onCheckClick={(health) =>
                navigate(`/hosts/${hostID}/executions/last?health=${health}`)
              }
            />
          </div>
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
          <Table config={sapInstancesTableConfiguration} data={sapInstances} />
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
