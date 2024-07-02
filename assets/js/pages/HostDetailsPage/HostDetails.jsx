import React, { useState } from 'react';
import { get } from 'lodash';
import classNames from 'classnames';
import {
  EOS_CLEAR_ALL,
  EOS_PLAY_CIRCLE,
  EOS_PLAYLIST_ADD_CHECK_FILLED,
} from 'eos-icons-react';

import { agentVersionWarning } from '@lib/agent';

import BackButton from '@common/BackButton';
import Button from '@common/Button';
import CleanUpButton from '@common/CleanUpButton';
import PageHeader from '@common/PageHeader';
import Table from '@common/Table';
import Tooltip from '@common/Tooltip';
import Banner from '@common/Banners/Banner';
import ChartsFeatureWrapper from '@common/ChartsFeatureWrapper';
import AvailableSoftwareUpdates from '@common/AvailableSoftwareUpdates';

import { subHours } from 'date-fns';

import SuseLogo from '@static/suse_logo.svg';

import CheckResultsOverview from '@pages/CheckResultsOverview';
import { canStartExecution } from '@pages/ChecksSelection';
import DeregistrationModal from '@pages/DeregistrationModal';

import HostSummary from './HostSummary';
import ProviderDetails from './ProviderDetails';
import SaptuneSummary from './SaptuneSummary';
import StatusPill from './StatusPill';
import HostChart from './HostChart';

import {
  subscriptionsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

function HostDetails({
  agentVersion,
  chartsEnabled,
  cluster,
  deregisterable,
  deregistering,
  exportersStatus = {},
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
  suseManagerEnabled,
  relevantPatches,
  upgradablePackages,
  softwareUpdatesLoading,
  softwareUpdatesSettingsSaved,
  softwareUpdatesSettingsLoading,
  softwareUpdatesTooltip,
  userAbilities,
  cleanUpHost,
  requestHostChecksExecution,
  navigate,
}) {
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);

  const versionWarningMessage = agentVersionWarning(agentVersion);

  const sapPresent = sapInstances?.length > 0;

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

  const timeNow = new Date();

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
                  userAbilities={userAbilities}
                  permittedFor={['cleanup:host']}
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
                <EOS_PLAYLIST_ADD_CHECK_FILLED className="inline-block fill-jungle-green-500" />{' '}
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
                wrap={false}
                isEnabled={!canStartExecution(selectedChecks, savingChecks)}
                content="Select some Checks first!"
                place="bottom"
              >
                <Button
                  type="primary"
                  className="mx-0.5"
                  size="small"
                  onClick={requestHostChecksExecution}
                  disabled={!canStartExecution(selectedChecks, savingChecks)}
                >
                  <EOS_PLAY_CIRCLE
                    className={classNames('inline-block align-sub', {
                      'fill-white': canStartExecution(
                        selectedChecks,
                        savingChecks
                      ),
                      'fill-gray-200': !canStartExecution(
                        selectedChecks,
                        savingChecks
                      ),
                    })}
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
          <Banner type="warning">{versionWarningMessage}</Banner>
        )}
        <div className="flex xl:flex-row flex-col">
          <HostSummary
            agentVersion={agentVersion}
            cluster={cluster}
            ipAddresses={ipAddresses}
          />
          <div className="flex flex-col mt-4 bg-white shadow rounded-lg pt-8 px-8 xl:w-2/5 mr-4">
            <SaptuneSummary
              sapPresent={sapPresent}
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

        {suseManagerEnabled && (
          <AvailableSoftwareUpdates
            className="mx-0 my-4"
            settingsConfigured={softwareUpdatesSettingsSaved}
            relevantPatches={relevantPatches}
            upgradablePackages={upgradablePackages}
            tooltip={softwareUpdatesTooltip}
            softwareUpdatesSettingsLoading={softwareUpdatesSettingsLoading}
            softwareUpdatesLoading={softwareUpdatesLoading}
            onBackToSettings={() => navigate(`/settings`)}
            onNavigateToPatches={() => navigate(`/hosts/${hostID}/patches`)}
            onNavigateToPackages={() => navigate(`/hosts/${hostID}/packages`)}
          />
        )}
        <ChartsFeatureWrapper chartsEnabled={chartsEnabled}>
          <div>
            <HostChart
              hostId={hostID}
              chartId="cpu"
              chartTitle="CPU"
              yAxisFormatter={(value) => `${value}%`}
              startInterval={subHours(timeNow, 3)}
            />
          </div>
          <div>
            <HostChart
              hostId={hostID}
              chartId="memory"
              chartTitle="Memory"
              startInterval={subHours(timeNow, 3)}
              yAxisFormatter={(value) => formatBytes(value, 3)}
            />
          </div>
        </ChartsFeatureWrapper>
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
