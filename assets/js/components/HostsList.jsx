import React, { useState } from 'react';

import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Table from '@components/Table';
import DeregistrationModal from '@components/DeregistrationModal';
import HealthIcon from '@components/Health/HealthIcon';
import Tags from '@components/Tags';
import HostLink from '@components/HostLink';
import ClusterLink from '@components/ClusterLink';
import SapSystemLink from '@components/SapSystemLink';
import PageHeader from '@components/PageHeader';
import Pill from '@components/Pill';
import HealthSummary from '@components/HealthSummary/HealthSummary';
import { getCounters } from '@components/HealthSummary/summarySelection';
import ProviderLabel from '@components/ProviderLabel';
import Tooltip from '@components/Tooltip';
import CleanUpButton from '@components/CleanUpButton';

import { addTagToHost, removeTagFromHost, deregisterHost } from '@state/hosts';

import { post, del } from '@lib/network';
import { agentVersionWarning } from '@lib/agent';

const getInstancesByHost = (applicationInstances, databaseInstances, hostId) =>
  applicationInstances
    .map((instance) => ({ ...instance, type: 'sap_systems' }))
    .concat(
      databaseInstances.map((instance) => ({
        ...instance,
        type: 'databases',
      }))
    )
    .filter((instance) => instance.host_id === hostId);

const addTag = (tag, hostId) => {
  post(`/hosts/${hostId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, hostId) => {
  del(`/hosts/${hostId}/tags/${tag}`);
};

function HostsList() {
  const hosts = useSelector((state) => state.hostsList.hosts);
  const clusters = useSelector((state) => state.clustersList.clusters);
  const { applicationInstances } = useSelector((state) => state.sapSystemsList);
  const { databaseInstances } = useSelector((state) => state.databasesList);

  const [searchParams, setSearchParams] = useSearchParams();
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);
  const [hostToDeregister, setHostToDeregister] = useState(undefined);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openDeregistrationModal = (host) => {
    setHostToDeregister(host);
    setCleanUpModalOpen(true);
  };

  const cleanUpHost = ({ id, hostname }) => {
    setCleanUpModalOpen(false);
    dispatch(deregisterHost({ id, hostname, navigate }));
  };

  const config = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Health',
        key: 'heartbeat',
        filter: true,
        filterFromParams: true,
        render: (_content, item) => (
          <HealthIcon health={item.heartbeat} centered />
        ),
      },
      {
        title: 'Hostname',
        key: 'hostname',
        className: 'w-40',
        filter: true,
        filterFromParams: true,
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
        render: (content) => {
          if (content) {
            return <ProviderLabel provider={content} />;
          }
          return '';
        },
      },
      {
        title: 'Cluster',
        key: 'cluster',
        className: 'w-40',
        render: (cluster) => <ClusterLink cluster={cluster} />,
      },
      {
        title: 'SID',
        key: 'sid',
        filterFromParams: true,
        filter: (filter, key) => (element) =>
          element[key].some((sid) => filter.includes(sid)),
        render: (sids, { sap_systems }) => {
          const sidsArray = sap_systems.map((instance, index) => [
            index > 0 && ', ',
            <SapSystemLink
              key={`${instance?.sap_system_id}-${instance?.id}`}
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
        render: (content) => {
          const warning = agentVersionWarning(content);
          if (warning) {
            return (
              <Tooltip className="w-52" content={warning} place="bottom">
                <Pill
                  size="xs"
                  className="bg-yellow-100 text-yellow-800 group flex items-center relative"
                >
                  <EOS_WARNING_OUTLINED
                    size="base"
                    className="centered fill-yellow-800"
                  />
                  <span className="ml-1 truncate max-w-[100px]">{content}</span>
                </Pill>
              </Tooltip>
            );
          }
          return (
            <Pill
              size="xs"
              display="inline-block"
              className="bg-green-100 text-green-800 truncate max-w-[112px]"
            >
              {content}
            </Pill>
          );
        },
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
            resourceId={item.id}
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
      {
        title: '',
        key: 'deregisterable',
        className: 'w-48',
        render: (content, item) =>
          content && (
            <CleanUpButton
              cleaning={item.deregistering}
              onClick={() => {
                openDeregistrationModal(item);
              }}
            />
          ),
      },
    ],
  };

  const data = hosts.map((host) => {
    const cluster = clusters.find((c) => c.id === host.cluster_id);
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
      sid: sapSystemList.map((sapSystem) => sapSystem.sid),
      cluster,
      agent_version: host.agent_version,
      id: host.id,
      tags: (host.tags && host.tags.map((tag) => tag.value)) || [],
      sap_systems: sapSystemList,
      deregisterable: host.deregisterable,
      deregistering: host.deregistering,
    };
  });

  const counters = getCounters(data || []);
  return (
    <>
      <PageHeader className="font-bold">Hosts</PageHeader>
      <DeregistrationModal
        hostname={hostToDeregister?.hostname}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          cleanUpHost(hostToDeregister);
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      <div className="bg-white rounded-lg shadow">
        <HealthSummary {...counters} className="px-4 py-2" />
        <Table
          config={config}
          data={data}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>
    </>
  );
}

export default HostsList;
