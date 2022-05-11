import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@components/Button';

import ListView from '@components/ListView';
import Pill from '@components/Pill';
import Table from '@components/Table';

import { groupBy } from '@lib/lists';

import SiteDetails from './SiteDetails';

import { getClusterName } from '@components/ClusterLink';

import { EOS_SETTINGS, EOS_CLEAR_ALL, EOS_PLAY_CIRCLE } from 'eos-icons-react';
import { getCluster } from '@state/selectors';
import classNames from 'classnames';

export const truncatedClusterNameClasses = classNames(
  'font-bold truncate w-60 inline-block align-top'
);

const siteDetailsConfig = {
  usePadding: false,
  columns: [
    { title: 'Hostname', key: 'name' },
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

  const ips = useSelector((state) =>
    state.hostsList.hosts.reduce((accumulator, current) => {
      if (current.cluster_id === clusterID) {
        return { ...accumulator, [current.hostname]: current.ip_addresses };
      }
      return accumulator;
    }, {})
  );

  if (!cluster) {
    return <div>Loading...</div>;
  }

  const renderedNodes = cluster.details?.nodes?.map((node) =>
    ips[node.name] ? { ...node, ips: ips[node.name] } : node
  );

  const hasSelectedChecks = cluster.selected_checks.length > 0;

  return (
    <div>
      <div className="flex">
        <h1 className="text-3xl font-bold w-1/2">
          Pacemaker cluster details:{' '}
          <span className={truncatedClusterNameClasses}>
            {getClusterName(cluster)}
          </span>
        </h1>
        <div className="flex w-1/2 justify-end">
          <Button
            className="w-1/4 mx-0.5 bg-waterhole-blue"
            size="small"
            onClick={() => navigate(`/clusters/${clusterID}/settings`)}
          >
            <EOS_SETTINGS className="inline-block fill-white" /> Settings
          </Button>
          <Button
            className="w-1/4 mx-0.5 bg-waterhole-blue"
            size="small"
            onClick={() => navigate(`/clusters/${clusterID}/checks/results`)}
          >
            <EOS_CLEAR_ALL className="inline-block fill-white" /> Show Results
          </Button>
          <TriggerChecksExecutionRequest
            cssClasses="rounded relative w-1/4 ml-0.5 bg-waterhole-blue disabled:bg-slate-50 disabled:text-slate-500"
            clusterId={clusterID}
            disabled={!hasSelectedChecks}
          >
            <EOS_PLAY_CIRCLE
              className={classNames('inline-block fill-white', {
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

      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          className="grid-rows-3"
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
                cluster.type === 'hana_scale_up' ? 'HANA scale-up' : 'Unknown',
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
              content: cluster.details && cluster.details.secondary_sync_state,
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

      <div className="mt-2">
        {Object.entries(groupBy(cluster.details.nodes, 'site')).map(
          ([siteName]) => (
            <div key={siteName}>
              <h3 className="text-l font-bold">{siteName}</h3>
              <Table
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
      <div className="mt-2 bg-white shadow rounded-lg py-4 px-8">
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

export const TriggerChecksExecutionRequest = ({
  clusterId,
  cssClasses,
  children,
  ...props
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <button
      className={classNames(
        'items-center text-sm px-2 bg-jungle-green-500 text-white hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow',
        cssClasses
      )}
      onClick={() => {
        dispatch({
          type: 'REQUEST_CHECKS_EXECUTION',
          payload: {
            clusterID: clusterId,
          },
        });
        navigate(`/clusters/${clusterId}/checks/results`);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export const Tooltip = ({ children, tooltipText }) => {
  const tipRef = React.createRef(null);
  const handleMouseEnter = () => {
    tipRef.current.style.opacity = 1;
    tipRef.current.style.marginTop = '10px';
  };
  const handleMouseLeave = () => {
    tipRef.current.style.opacity = 0;
    tipRef.current.style.marginTop = '5px';
  };
  return (
    <div
      className="w-full h-full absolute inset-0 flex justify-center items-center z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full absolute whitespace-no-wrap bg-gradient-to-r from-black to-gray-700 text-white px-4 py-2 rounded flex items-center transition-all duration-150"
        style={{ top: '100%', opacity: 0 }}
        ref={tipRef}
      >
        <div
          className="bg-black h-3 w-3 absolute"
          style={{ top: '-6px', right: '50%', transform: 'rotate(45deg)' }}
        />
        {tooltipText}
      </div>
      {children}
    </div>
  );
};
