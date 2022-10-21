import React, { Fragment } from 'react';
import Table from './Table';
import HealthIcon from '@components/Health/HealthIcon';
import { useSearchParams } from 'react-router-dom';
import Tags from './Tags';
import { addTagToHost, removeTagFromHost } from '@state/hosts';
import HostLink from '@components/HostLink';
import ClusterLink from '@components/ClusterLink';
import SapSystemLink from '@components/SapSystemLink';
import { useSelector, useDispatch } from 'react-redux';

import { post, del } from '@lib/network';
import { ComponentHealthSummary } from '@components/HealthSummary';

const getInstancesByHost = (
  applicationInstances,
  databaseInstances,
  hostId
) => {
  return applicationInstances
    .map((instance) => ({ ...instance, type: 'sap_systems' }))
    .concat(
      databaseInstances.map((instance) => ({
        ...instance,
        type: 'databases',
      }))
    )
    .filter((instance) => instance.host_id === hostId);
};

const addTag = (tag, hostId) => {
  post(`/api/hosts/${hostId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, hostId) => {
  del(`/api/hosts/${hostId}/tags/${tag}`);
};

const HostsList = () => {
  const hosts = useSelector((state) => state.hostsList.hosts);
  const clusters = useSelector((state) => state.clustersList.clusters);
  const { applicationInstances, databaseInstances } = useSelector(
    (state) => state.sapSystemsList
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();

  const config = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Health',
        key: 'heartbeat',
        filter: true,
        render: (_content, item) => {
          return <HealthIcon health={item.heartbeat} centered={true} />;
        },
      },
      {
        title: 'Hostname',
        key: 'hostname',
        className: 'w-40',
        filter: true,
        render: (content, { id }) => <HostLink hostId={id}>{content}</HostLink>,
      },
      {
        title: 'IP',
        key: 'ip',
        render: (content) =>
          content.map((ip) => (
            <div key={ip} className="text-sm text-gray-900">
              {ip}
            </div>
          )),
      },
      {
        title: 'Provider',
        key: 'provider',
      },
      {
        title: 'Cluster',
        key: 'cluster',
        className: 'w-40',
        render: (cluster) => {
          return <ClusterLink cluster={cluster} />;
        },
      },
      {
        title: 'SID',
        key: 'sid',
        filterFromParams: true,
        filter: (filter, key) => (element) =>
          element[key].some((sid) => filter.includes(sid)),
        render: (sids, { sap_systems }) => {
          let sidsArray = sap_systems.map((instance, index) => [
            index > 0 && ', ',
            <SapSystemLink
              key={index}
              systemType={instance?.type}
              sapSystemId={instance?.sap_system_id}
            >
              {instance?.sid}
            </SapSystemLink>,
          ]);

          return sidsArray;
        },
      },
      {
        title: 'Agent version',
        key: 'agent_version',
        render: (content) => (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {content}
          </span>
        ),
      },
      {
        title: 'Tags',
        key: 'tags',
        className: 'w-80',
        filterFromParams: true,
        filter: (filter, key) => (element) =>
          element[key].some((tag) => filter.includes(tag)),
        render: (content, item) => (
          <Tags
            tags={content}
            onChange={() => {}}
            onAdd={(tag) => {
              addTag(tag, item.id);
              dispatch(addTagToHost({ tags: [{ value: tag }], id: item.id }));
            }}
            onRemove={(tag) => {
              removeTag(tag, item.id);
              dispatch(
                removeTagFromHost({ tags: [{ value: tag }], id: item.id })
              );
            }}
          />
        ),
      },
    ],
  };

  const data = hosts.map((host) => {
    const cluster = clusters.find((cluster) => cluster.id === host.cluster_id);
    const sapSystemList = getInstancesByHost(
      applicationInstances,
      databaseInstances,
      host.id
    );

    return {
      heartbeat: host.heartbeat,
      hostname: host.hostname,
      ip: host.ip_addresses,
      provider: host.provider,
      sid: sapSystemList.map((sapSystem) => {
        return sapSystem.sid;
      }),
      cluster: cluster,
      agent_version: host.agent_version,
      id: host.id,
      tags: (host.tags && host.tags.map((tag) => tag.value)) || [],
      sap_systems: sapSystemList,
    };
  });

  return (
    <Fragment>
      <ComponentHealthSummary data={data} />
      <Table
        config={config}
        data={data}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    </Fragment>
  );
};

export default HostsList;
