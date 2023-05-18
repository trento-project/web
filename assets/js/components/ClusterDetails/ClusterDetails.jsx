import React from 'react';

import { groupBy } from '@lib/lists';
import classNames from 'classnames';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import Button from '@components/Button';

import ListView from '@components/ListView';
import Table from '@components/Table';
import Tooltip from '@components/Tooltip';
import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';
import HostLink from '@components/HostLink';
import ChecksResultOverview from '@components/ClusterDetails/ChecksResultOverview';
import ProviderLabel from '@components/ProviderLabel';
import { EOS_SETTINGS, EOS_CLEAR_ALL, EOS_PLAY_CIRCLE } from 'eos-icons-react';

import SiteDetails from './SiteDetails';
import SBDDetails from './SBDDetails';
import StoppedResources from './StoppedResources';

const siteDetailsConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: '',
      render: (_, hostData) => (
        <HostLink hostId={hostData.id}>{hostData.name}</HostLink>
      ),
    },
    { title: 'Role', key: 'hana_status' },
    {
      title: 'IP',
      key: 'ip_addresses',
      className: 'table-col-m',
      render: (content) => content?.join(', '),
    },
    {
      title: 'Virtual IP',
      key: 'virtual_ip',
      className: 'table-col-m',
    },
    {
      title: '',
      key: '',
      className: 'table-col-xs',
      render: (_, item) => {
        const { attributes, resources } = item;
        return <SiteDetails attributes={attributes} resources={resources} />;
      },
    },
  ],
};

export function ClusterDetails({
  clusterID,
  clusterName,
  selectedChecks,
  hasSelectedChecks,
  hosts,
  clusterType,
  cibLastWritten,
  sid,
  provider,
  clusterNodes,
  details,
  lastExecution,
  onStartExecution,
  navigate,
}) {
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
              Settings
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

            <TriggerChecksExecutionRequest
              cssClasses="flex rounded relative ml-0.5 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-gray-400"
              clusterId={clusterID}
              disabled={!hasSelectedChecks}
              hosts={hosts}
              checks={selectedChecks}
              onStartExecution={onStartExecution}
            >
              <EOS_PLAY_CIRCLE
                className={classNames('inline-block fill-jungle-green-500', {
                  'fill-slate-500': !hasSelectedChecks,
                })}
              />{' '}
              <span>Start Execution</span>
              {!hasSelectedChecks && (
                <Tooltip tooltipText="Select some Checks first!" />
              )}
            </TriggerChecksExecutionRequest>
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
              { title: 'SID', content: sid },
              {
                title: 'Fencing type',
                content: details && details.fencing_type,
              },
              {
                title: 'Cluster type',
                content:
                  clusterType === 'hana_scale_up' ? 'HANA scale-up' : 'Unknown',
              },
              {
                title: 'SAPHanaSR health state',
                content: details && details.sr_health_state,
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
          <ChecksResultOverview
            {...lastExecution}
            onCheckClick={(health) =>
              navigate(
                `/clusters/${clusterID}/executions/last?health=${health}`
              )
            }
          />
        </div>
      </div>

      {details && details.stopped_resources.length > 0 && (
        <StoppedResources resources={details.stopped_resources} />
      )}

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">Pacemaker Site details</h2>
        </div>
      </div>

      <div className="mt-2 tn-site-details">
        {Object.entries(groupBy(details.nodes, 'site')).map(([siteName]) => (
          <div key={siteName} className={`tn-site-details-${siteName} mt-4`}>
            <h3 className="text-l font-bold tn-site-name">{siteName}</h3>
            <Table
              className="tn-site-table"
              config={siteDetailsConfig}
              data={clusterNodes.filter(({ site }) => site === siteName)}
            />
          </div>
        ))}
      </div>
      <SBDDetails sbdDevices={details.sbd_devices} />
    </div>
  );
}
