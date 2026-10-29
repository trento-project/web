// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { getFromConfig } from '@lib/config';
import { post, del } from '@lib/network';
import { STALE_ROW } from '@lib/tables';
import {
  ASCS_ERS,
  HANA_ASCS_ERS,
  getClusterTypeLabel,
  getClusterSids,
} from '@lib/model/clusters';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { getOperationLabel } from '@lib/operations';

import { addTagToCluster, removeTagFromCluster } from '@state/clusters';
import {
  CLUSTER_BULK_OPERATION_ID,
  bulkOperationRequested,
  removeRunningOperation,
} from '@state/runningOperations';
import { getClustersWithEnrichedSapInstances } from '@state/selectors/cluster';
import { getRunningOperation } from '@state/selectors/runningOperations';
import { getInstanceID } from '@state/instances';

import { getUserProfile } from '@state/selectors/user';

import {
  BulkOperationModal,
  OperationForbiddenModal,
} from '@common/OperationModals';
import OperationsButton from '@common/OperationsButton';
import PageHeader from '@common/PageHeader';
import SapSystemLink from '@common/SapSystemLink';
import Table from '@common/Table';
import Tags from '@common/Tags';
import Tooltip from '@common/Tooltip';

import usePersistentSearchParams from '@hooks/usePersistentSearchParams';

import { ExecutionIcon } from '@pages/ClusterDetails';
import { getCounters } from '@pages/HealthSummary/summarySelection';
import HealthSummary from '@pages/HealthSummary';

import ClusterLink from './ClusterLink';
import { getClustersBulkOperations } from './clusterOperations';

const getSapSystemBySID = (instances, sid) =>
  instances.find((instance) => instance.sid === sid);

// getSapSystemType gets the current SAP system type
// evaluating the cluster type.
const getSapSystemType = (clusterType) => {
  switch (clusterType) {
    case ASCS_ERS:
      return APPLICATION_TYPE;
    case HANA_ASCS_ERS:
      return null;
    default:
      return DATABASE_TYPE;
  }
};

const addTag = (tag, clusterId) => {
  post(`/clusters/${clusterId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, clusterId) => {
  del(`/clusters/${clusterId}/tags/${tag}`);
};

function ClustersList({
  operationsEnabled = getFromConfig('operationsEnabled'),
}) {
  const clusters = useSelector(getClustersWithEnrichedSapInstances);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = usePersistentSearchParams('clusters');
  const { abilities, timezone: userTimezone } = useSelector(getUserProfile);
  const [bulkOperationModal, setBulkOperationModalOpen] = useState({
    open: false,
    operation: undefined,
    params: {},
    clusters: [],
  });

  const closeBulkOperationModal = () =>
    setBulkOperationModalOpen((prevState) => ({ ...prevState, open: false }));

  const bulkOperation = useSelector(
    getRunningOperation(CLUSTER_BULK_OPERATION_ID)
  );

  const clearBulkOperation = () =>
    dispatch(removeRunningOperation({ groupID: CLUSTER_BULK_OPERATION_ID }));

  const requestBulkOperation = () => {
    const { operation, params, clusters: targetClusters } = bulkOperationModal;

    dispatch(
      bulkOperationRequested({
        bulkOperationID: CLUSTER_BULK_OPERATION_ID,
        targetGroupIDs: targetClusters.map(({ id }) => id),
        operation,
        params,
      })
    );
    closeBulkOperationModal();
  };

  const config = {
    pagination: true,
    selectable: operationsEnabled,
    usePadding: false,
    rowClassName: ({ staleAt }) =>
      classNames({
        [STALE_ROW]: !!staleAt,
      }),
    columns: [
      {
        title: 'Health',
        key: 'health',
        filter: true,
        filterFromParams: true,
        render: (health, { checks_execution: checksExecution, staleAt }) => (
          <div className="ml-4">
            <ExecutionIcon
              health={health}
              executionState={checksExecution}
              staleAt={staleAt}
              timezone={userTimezone}
            />
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
        render: (
          _,
          { sid, type: clusterType, sap_instances: sapInstances }
        ) => {
          const sidsArray = sid.map((singleSid) => {
            const sapSystemData = getSapSystemBySID(sapInstances, singleSid);

            return (
              <span key={singleSid}>
                <SapSystemLink
                  systemType={
                    sapSystemData?.type ?? getSapSystemType(clusterType)
                  }
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
    sap_instances: cluster.sap_instances || [],
    type: cluster.type,
    hosts_number: cluster.hosts_number,
    resources_number: cluster.resources_number,
    checks_execution: cluster.checks_execution,
    selected_checks: cluster.selected_checks,
    tags: (cluster.tags && cluster.tags.map((tag) => tag.value)) || [],
    staleAt: cluster.stale_at,
  }));

  const counters = getCounters(data || []);

  return (
    <>
      <PageHeader className="font-bold">Clusters</PageHeader>
      <BulkOperationModal
        operation={bulkOperationModal.operation}
        descriptionResolverArgs={bulkOperationModal.params}
        resources={bulkOperationModal.clusters.map(({ id, name }) => ({
          id,
          label: name,
        }))}
        isOpen={bulkOperationModal.open}
        onRequest={requestBulkOperation}
        onCancel={closeBulkOperationModal}
      />
      <OperationForbiddenModal
        operation={getOperationLabel(bulkOperation?.operation)}
        isOpen={!!bulkOperation?.forbidden}
        errors={bulkOperation?.errors ?? []}
        onCancel={clearBulkOperation}
      />
      <div className="bg-white rounded-lg shadow">
        <HealthSummary {...counters} className="px-4 py-2" />
        <Table
          config={config}
          data={data}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          rowKey={({ id }) => id}
          renderSelectionActions={(selectedClusters) => (
            <OperationsButton
              userAbilities={abilities}
              menuPosition="bottom end"
              operations={getClustersBulkOperations(
                selectedClusters,
                setBulkOperationModalOpen
              )}
            />
          )}
        />
      </div>
    </>
  );
}

export default ClustersList;
