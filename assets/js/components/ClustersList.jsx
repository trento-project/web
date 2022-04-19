import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Table from './Table';
import Tags from './Tags';
import { addTagToCluster, removeTagFromCluster } from '@state/clusters';
import ClusterLink from '@components/ClusterLink';

import { logError } from '@lib/log';

import HealthIcon from '@components/Health';
import Spinner from '@components/Spinner';
import { ComponentHealthSummary } from '@components/HealthSummary';

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
  axios
    .post(`/api/clusters/${clusterId}/tags`, {
      value: tag,
    })
    .catch((error) => {
      logError('Error posting tag: ', error);
    });
};

const removeTag = (tag, clusterId) => {
  axios.delete(`/api/clusters/${clusterId}/tags/${tag}`).catch((error) => {
    logError('Error deleting tag: ', error);
  });
};

const ClustersList = () => {
  const clusters = useSelector((state) => state.clustersList.clusters);
  const dispatch = useDispatch();

  const config = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Health',
        key: 'health',
        filter: true,
        render: (content, { checks_execution }) => {
          if (checks_execution === 'not_running') {
            return (
              <div className="ml-4">
                <HealthIcon health={content} />
              </div>
            );
          } else {
            return (
              <div className="ml-4">
                <Spinner></Spinner>
              </div>
            );
          }
        },
      },
      {
        title: 'Name',
        key: 'name',
        filter: true,
        render: (content, item) => (
          <ClusterLink cluster={item}>
            <span className="tn-clustername">{content}</span>
          </ClusterLink>
        ),
      },
      {
        title: 'SID',
        key: 'sid',
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
      <Table config={config} data={data} />
    </Fragment>
  );
};

export default ClustersList;
