import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router';

import { post, del } from '@lib/network';
import {
  HANA_ASCS_ERS,
  getClusterTypeLabel,
  getClusterSids,
} from '@lib/model/clusters';

import { addTagToCluster, removeTagFromCluster } from '@state/clusters';
import { getAllSAPInstances } from '@state/selectors/sapSystem';
import { getInstanceID } from '@state/instances';

import { getUserProfile } from '@state/selectors/user';

import PageHeader from '@common/PageHeader';
import SapSystemLink from '@common/SapSystemLink';
import Table from '@common/Table';
import Tags from '@common/Tags';
import Tooltip from '@common/Tooltip';

import { ExecutionIcon } from '@pages/ClusterDetails';
import { getCounters } from '@pages/HealthSummary/summarySelection';
import HealthSummary from '@pages/HealthSummary';

import ClusterLink from './ClusterLink';

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
  const { abilities } = useSelector(getUserProfile);

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
        render: (_, { sid }) => {
          const sidsArray = sid.map((singleSid) => {
            const sapSystemData = getSapSystemBySID(allInstances, singleSid);

            return (
              <span key={singleSid}>
                <SapSystemLink
                  systemType={sapSystemData?.type}
                  sapSystemId={getInstanceID(sapSystemData)}
                >
                  {singleSid}
                </SapSystemLink>
                <br />
              </span>
            );
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
          <Tooltip
            content="Cluster managing HANA and ASCS/ERS together is not supported by Trento"
            place="bottom"
            className="whitespace-pre"
            isEnabled={item.type === HANA_ASCS_ERS}
          >
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 truncate">
              {getClusterTypeLabel(item.type)}
            </span>
          </Tooltip>
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
            userAbilities={abilities}
            tagAdditionPermittedFor={['all:cluster_tags']}
            tagDeletionPermittedFor={['all:cluster_tags']}
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
    sid: getClusterSids(cluster),
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
