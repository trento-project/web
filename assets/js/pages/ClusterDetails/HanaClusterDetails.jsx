import React from 'react';
import { get, capitalize, sortBy } from 'lodash';
import classNames from 'classnames';

import { getClusterTypeLabel } from '@lib/model/clusters';
import { RUNNING_STATES } from '@state/lastExecutions';

import BackButton from '@common/BackButton';
import Button from '@common/Button';
import ListView from '@common/ListView';
import PageHeader from '@common/PageHeader';
import ProviderLabel from '@common/ProviderLabel';
import SapSystemLink from '@common/SapSystemLink';
import Tooltip from '@common/Tooltip';

import CheckResultsOverview from '@pages/CheckResultsOverview';

import { EOS_SETTINGS, EOS_CLEAR_ALL, EOS_PLAY_CIRCLE } from 'eos-icons-react';

import HanaClusterSite from './HanaClusterSite';
import SBDDetails from './SBDDetails';
import StoppedResources from './StoppedResources';

export const enrichNodes = (clusterNodes, hosts) =>
  clusterNodes?.map((node) => ({
    ...node,
    ...hosts.find(({ hostname }) => hostname === node.name),
  }));

function HanaClusterDetails({
  clusterID,
  clusterName,
  selectedChecks,
  hasSelectedChecks,
  hosts,
  clusterType,
  cibLastWritten,
  sid,
  provider,
  sapSystems,
  details,
  catalog,
  lastExecution,
  onStartExecution = () => {},
  navigate = () => {},
}) {
  const enrichedNodes = enrichNodes(details?.nodes, hosts);
  const enrichedSapSystem = {
    sid,
    ...sapSystems.find(({ sid: currentSid }) => currentSid === sid),
  };
  const unsitedNodes = enrichedNodes.filter(({ site }) => site === null);

  const {
    data: executionData,
    loading: executionLoading,
    error: executionError,
  } = lastExecution || { loading: true };

  const startExecutionDisabled =
    executionLoading ||
    !hasSelectedChecks ||
    RUNNING_STATES.includes(executionData?.status);

  const catalogData = get(catalog, 'data');
  const catalogLoading = get(catalog, 'loading');
  const catalogError = get(catalog, 'error');

  return (
    <div>
      <BackButton url="/clusters">Back to Clusters</BackButton>
      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          <PageHeader className="whitespace-normal">
            Pacemaker Cluster Details:{' '}
            <span className="font-bold">{clusterName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
            <Button
              type="primary-white"
              className="inline-block mx-0.5 border-green-500 border"
              size="small"
              onClick={() => navigate(`/clusters/${clusterID}/settings`)}
            >
              <EOS_SETTINGS className="inline-block fill-jungle-green-500" />{' '}
              Check Selection
            </Button>

            <Button
              type="primary-white"
              className="mx-0.5 border-green-500 border"
              size="small"
              onClick={() => navigate(`/clusters/${clusterID}/executions/last`)}
            >
              <EOS_CLEAR_ALL className="inline-block fill-jungle-green-500" />{' '}
              Show Results
            </Button>

            <Tooltip
              isEnabled={!hasSelectedChecks}
              content="Select some Checks first!"
              place="bottom"
              wrap={false}
            >
              <Button
                type="primary"
                className="mx-0.5 border border-green-500"
                size="small"
                onClick={() => {
                  onStartExecution(clusterID, hosts, selectedChecks);
                }}
                disabled={startExecutionDisabled}
              >
                <EOS_PLAY_CIRCLE
                  className={classNames('inline-block align-sub', {
                    'fill-white': !startExecutionDisabled,
                    'fill-gray-200': startExecutionDisabled,
                  })}
                />{' '}
                Start Execution
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="flex xl:flex-row flex-col">
        <div className="tn-cluster-details mt-4 bg-white shadow rounded-lg py-8 px-8 xl:w-3/4 w-full mr-4">
          <ListView
            className="grid-rows-3"
            titleClassName="text-lg"
            orientation="vertical"
            data={[
              {
                title: 'Provider',
                content: provider || 'Not defined',
                render: (content) => <ProviderLabel provider={content} />,
              },
              {
                title: 'SID',
                content: enrichedSapSystem,
                render: (content) => (
                  <SapSystemLink
                    sapSystemId={content?.id}
                    systemType="databases"
                  >
                    {content?.sid}
                  </SapSystemLink>
                ),
              },
              {
                title: 'Fencing type',
                content: details && details.fencing_type,
              },
              {
                title: 'Cluster type',
                content: getClusterTypeLabel(clusterType),
              },
              {
                title: 'Cluster maintenance',
                content: capitalize(get(details, 'maintenance_mode', 'false')),
              },
              {
                title: 'CIB last written',
                content: cibLastWritten || '-',
              },
              {
                title: 'HANA log replication mode',
                content: details && details.system_replication_mode,
              },
              {
                title: 'HANA secondary sync state',
                content: details && details.secondary_sync_state,
              },
              {
                title: 'HANA log operation mode',
                content: details && details.system_replication_operation_mode,
              },
            ]}
          />
        </div>
        <div className="tn-cluster-checks-overview mt-4 bg-white shadow rounded-lg py-4 xl:w-1/4 w-full">
          <CheckResultsOverview
            data={executionData}
            catalogDataEmpty={catalogData?.length === 0}
            loading={catalogLoading || executionLoading}
            error={catalogError || executionError}
            onCheckClick={(health) =>
              navigate(
                `/clusters/${clusterID}/executions/last?health=${health}`
              )
            }
          />
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-bold">Site details</h2>
      <div className="mt-2 tn-site-details">
        {sortBy(details.sites, 'name').map(
          ({ name: siteName, state, sr_health_state: srHealthState }) => (
            <HanaClusterSite
              key={siteName}
              name={siteName}
              nodes={enrichedNodes.filter(({ site }) => site === siteName)}
              state={state}
              srHealthState={srHealthState}
            />
          )
        )}
      </div>

      {unsitedNodes.length > 0 && (
        <HanaClusterSite name="Other" nodes={unsitedNodes} />
      )}

      <StoppedResources resources={details.stopped_resources} />

      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}

export default HanaClusterDetails;
