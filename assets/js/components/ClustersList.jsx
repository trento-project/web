import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Table from '@components/Table';
import Tags from '@components/Tags';
import PageHeader from '@components/PageHeader';
import { addTagToCluster, removeTagFromCluster } from '@state/clusters';
import ClusterLink from '@components/ClusterLink';
import SapSystemLink from '@components/SapSystemLink';
import { ExecutionIcon } from '@components/ClusterDetails';
import { post, del } from '@lib/network';
import { useSearchParams } from 'react-router-dom';
import HealthSummary from '@components/HealthSummary/HealthSummary';
import { getCounters } from '@components/HealthSummary/summarySelection';
import { getAllSAPInstances } from '@state/selectors/sapSystem';

const getClusterTypeLabel = (type) => {
  switch (type) {
    case 'hana_scale_up':
      return 'HANA Scale Up';
    case 'hana_scale_out':
      return 'HANA Scale Out';
    case 'ascs_ers':
      return 'ASCS/ERS';
    default:
      return 'Unknown';
  }
};

const getSapSystemBySID = (instances, sid) =>
  instances.find((instance) => instance.sid === sid);

const addTag = (tag, clusterId) => {
  post(`/clusters/${clusterId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, clusterId) => {
  del(`/clusters/${clusterId}/tags/${tag}`);
};

function ClustersList() {
  const clusters = useSelector((state) => state.clustersList.clusters);
  const allInstances = useSelector(getAllSAPInstances);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const config = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Health',
        key: 'health',
        filter: true,
        filterFromParams: true,
        render: (health, { checks_execution: checksExecution }) => (
          <div className="ml-4">
            <ExecutionIcon health={health} executionState={checksExecution} />
          </div>
        ),
      },
      {
        title: 'Name',
        key: 'name',
        filter: true,
        filterFromParams: true,
        render: (content, item) => (
          <span className="tn-clustername">
            <ClusterLink cluster={item} />
          </span>
        ),
      },
      {
        title: 'SID',
        key: 'sid',
        filterFromParams: true,
        filter: (filter, key) => (element) =>
          element[key].some((sid) => filter.includes(sid)),
        render: (_, { sid, id }) => {
          const sidsArray = sid.map((singleSid, index) => {
            const sapSystemData = getSapSystemBySID(allInstances, singleSid);

            return [
              index > 0 && ', ',
              <SapSystemLink
                key={`${id}-${singleSid}`}
                systemType={sapSystemData?.type}
                sapSystemId={sapSystemData?.sap_system_id}
              >
                {singleSid}
              </SapSystemLink>,
            ];
          });

          return sidsArray;
        },
      },
      {
        title: 'Hosts',
        key: 'hosts_number',
      },
      {
        title: 'Resources',
        key: 'resources_number',
      },
      {
        title: 'Type',
        key: 'type',
        filter: true,
        filterFromParams: true,
        render: (content, item) => (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 truncate">
            {getClusterTypeLabel(item.type)}
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
            resourceId={item.id}
            onChange={() => {}}
            onAdd={(tag) => {
              addTag(tag, item.id);
              dispatch(
                addTagToCluster({ tags: [{ value: tag }], id: item.id })
              );
            }}
            onRemove={(tag) => {
              removeTag(tag, item.id);
              dispatch(
                removeTagFromCluster({ tags: [{ value: tag }], id: item.id })
              );
            }}
          />
        ),
      },
    ],
  };

  const data = clusters.map((cluster) => ({
    health: cluster.health,
    name: cluster.name,
    id: cluster.id,
    sid: (cluster.sid ? [cluster.sid] : []).concat(cluster.additional_sids),
    type: cluster.type,
    hosts_number: cluster.hosts_number,
    resources_number: cluster.resources_number,
    checks_execution: cluster.checks_execution,
    selected_checks: cluster.selected_checks,
    tags: (cluster.tags && cluster.tags.map((tag) => tag.value)) || [],
  }));

  const counters = getCounters(data || []);

  return (
    <>
      <PageHeader className="font-bold">Clusters</PageHeader>
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

export default ClustersList;
