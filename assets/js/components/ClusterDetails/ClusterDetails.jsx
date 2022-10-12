import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Button from '@components/Button';

import ListView from '@components/ListView';
import Pill from '@components/Pill';
import Table from '@components/Table';
import Tooltip from '@components/Tooltip';
import TriggerChecksExecutionRequest from '@components/TriggerChecksExecutionRequest';

import { groupBy } from '@lib/lists';

import SiteDetails from './SiteDetails';

import { getClusterName } from '@components/ClusterLink';
import HostLink from '@components/HostLink';

import { EOS_SETTINGS, EOS_CLEAR_ALL, EOS_PLAY_CIRCLE } from 'eos-icons-react';
import { getCluster } from '@state/selectors';
import classNames from 'classnames';
import ChecksResultOverview from '@components/ClusterDetails/ChecksResultOverview';
import { useChecksResult } from '@components/ClusterDetails/hooks';

export const truncatedClusterNameClasses = classNames(
  'font-bold truncate w-60 inline-block align-top'
);

const siteDetailsConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: '',
      render: (_, hostData) => (
        <HostLink hostId={hostData.hostId}>{hostData.name}</HostLink>
      ),
    },
    { title: 'Role', key: 'hana_status' },
    {
      title: 'IP',
      key: 'ips',
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

const getStatusPill = (status) =>
  status === 'healthy' ? (
    <Pill className="bg-green-200 text-green-800 mr-2">Healthy</Pill>
  ) : (
    <Pill className="bg-red-200 text-red-800 mr-2">Unhealthy</Pill>
  );

const ClusterDetails = () => {
  const { clusterID } = useParams();
  const navigate = useNavigate();

  const cluster = useSelector(getCluster(clusterID));

  const checkResults = useChecksResult(cluster);

  const hostsData = useSelector((state) =>
    state.hostsList.hosts.reduce((accumulator, current) => {
      if (current.cluster_id === clusterID) {
        return {
          ...accumulator,
          [current.hostname]: { hostId: current.id, ips: current.ip_addresses },
        };
      }
      return accumulator;
    }, {})
  );

  if (!cluster) {
    return <div>Loading...</div>;
  }

  const renderedNodes = cluster.details?.nodes?.map((node) =>
    hostsData[node.name]
      ? {
          ...node,
          ips: hostsData[node.name].ips,
          hostId: hostsData[node.name].hostId,
        }
      : node
  );

  const hasSelectedChecks = cluster.selected_checks.length > 0;

  return (
    <div>
      <div className="flex mb-4">
        <h1 className="text-3xl font-bold w-1/2">
          Pacemaker cluster details:{' '}
          <span className={truncatedClusterNameClasses}>
            {getClusterName(cluster)}
          </span>
        </h1>
        <div className="flex w-1/2 justify-end">
          <Button
            type="primary-white"
            className="w-1/4 mx-0.5 border-green-500 border"
            size="small"
            onClick={() => navigate(`/clusters/${clusterID}/settings`)}
          >
            <EOS_SETTINGS className="inline-block fill-jungle-green-500" />{' '}
            Settings
          </Button>
          <Button
            type="primary-white"
            className="w-1/4 mx-0.5 border-green-500 border"
            size="small"
            onClick={() => navigate(`/clusters/${clusterID}/checks/results`)}
          >
            <EOS_CLEAR_ALL className="inline-block fill-jungle-green-500" />{' '}
            Show Results
          </Button>
          <TriggerChecksExecutionRequest
            cssClasses="rounded relative w-1/4 ml-0.5 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-gray-400"
            clusterId={clusterID}
            disabled={!hasSelectedChecks}
          >
            <EOS_PLAY_CIRCLE
              className={classNames('inline-block fill-jungle-green-500', {
                'fill-slate-500': !hasSelectedChecks,
              })}
            />{' '}
            Start Execution
            {!hasSelectedChecks && (
              <Tooltip tooltipText="Select some Checks first!" />
            )}
          </TriggerChecksExecutionRequest>
        </div>
      </div>

      <div className="flex xl:flex-row flex-col">
        <div className="tn-cluster-details mt-4 bg-white shadow rounded-lg py-8 px-8 xl:w-3/4 w-full mr-4">
          <ListView
            className="grid-rows-3"
            titleClassName="text-lg"
            orientation="vertical"
            data={[
              { title: 'Cluster name', content: cluster.name || 'Not defined' },
              { title: 'SID', content: cluster.sid },
              {
                title: 'Fencing type',
                content: cluster.details && cluster.details.fencing_type,
              },
              {
                title: 'Cluster type',
                content:
                  cluster.type === 'hana_scale_up'
                    ? 'HANA scale-up'
                    : 'Unknown',
              },
              {
                title: 'SAPHanaSR health state',
                content: cluster.details && cluster.details.sr_health_state,
              },
              {
                title: 'CIB last written',
                content: cluster.cib_last_written || '-',
              },
              {
                title: 'HANA log replication mode',
                content:
                  cluster.details && cluster.details.system_replication_mode,
              },
              {
                title: 'HANA secondary sync state',
                content:
                  cluster.details && cluster.details.secondary_sync_state,
              },
              {
                title: 'HANA log operation mode',
                content:
                  cluster.details &&
                  cluster.details.system_replication_operation_mode,
              },
            ]}
          />
        </div>
        <div className="tn-cluster-checks-overview mt-4 bg-white shadow rounded-lg py-4 xl:w-1/4 w-full">
          <ChecksResultOverview
            {...checkResults}
            onCheckClick={(health) =>
              navigate(`/clusters/${clusterID}/checks/results?health=${health}`)
            }
          />
        </div>
      </div>

      {cluster.details && cluster.details.stopped_resources.length > 0 && (
        <div className="mt-16">
          <div className="flex flex-direction-row">
            <h2 className="text-2xl font-bold self-center">
              Stopped resources
            </h2>
          </div>
          <div className="mt-2">
            {cluster.details.stopped_resources.map(({ id }) => (
              <Pill className="bg-gray-200 text-gray-800" key={id}>
                {id}
              </Pill>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">Pacemaker Site details</h2>
        </div>
      </div>

      <div className="mt-2 tn-site-details">
        {Object.entries(groupBy(cluster.details.nodes, 'site')).map(
          ([siteName]) => (
            <div key={siteName} className={`tn-site-details-${siteName}`}>
              <h3 className="text-l font-bold tn-site-name">{siteName}</h3>
              <Table
                className="tn-site-table"
                config={siteDetailsConfig}
                data={renderedNodes.filter(({ site }) => site === siteName)}
              />
            </div>
          )
        )}
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">SBD/Fencing</h2>
        </div>
      </div>
      <div className="mt-2 bg-white shadow rounded-lg py-4 px-8 tn-sbd-details">
        {cluster.details.sbd_devices.map(({ device, status }) => (
          <div key={device}>
            {getStatusPill(status)} {device}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClusterDetails;
