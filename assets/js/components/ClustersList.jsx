import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Table from './Table';
import Tags from './Tags';
import { addTagToCluster, removeTagFromCluster } from '@state/clusters';
import ClusterLink from '@components/ClusterLink';
import { ExecutionIcon } from '@components/ClusterDetails';
import { ComponentHealthSummary } from '@components/HealthSummary';
import { post, del } from '@lib/network';
import { useSearchParams } from 'react-router-dom';

const getClusterTypeLabel = (type) => {
  switch (type) {
    case 'hana_scale_up':
      return 'HANA Scale Up';
    case 'hana_scale_out':
      return 'HANA Scale Out';
    default:
      return 'Unknown';
  }
};

const addTag = (tag, clusterId) => {
  post(`/api/clusters/${clusterId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, clusterId) => {
  del(`/api/clusters/${clusterId}/tags/${tag}`);
};

const ClustersList = () => {
  const clusters = useSelector((state) => state.clustersList.clusters);
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
        render: (health, { checks_execution: checksExecution }) => {
          return (
            <div className="ml-4">
              <ExecutionIcon health={health} executionState={checksExecution} />
            </div>
          );
        },
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
        filter: true,
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

  const data = clusters.map((cluster) => {
    return {
      health: cluster.health,
      name: cluster.name,
      id: cluster.id,
      sid: cluster.sid,
      type: cluster.type,
      hosts_number: cluster.hosts_number,
      resources_number: cluster.resources_number,
      checks_execution: cluster.checks_execution,
      selected_checks: cluster.selected_checks,
      tags: (cluster.tags && cluster.tags.map((tag) => tag.value)) || [],
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

export default ClustersList;
