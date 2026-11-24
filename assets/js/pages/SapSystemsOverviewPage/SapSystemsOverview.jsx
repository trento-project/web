// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { Link } from 'react-router';
import { filter } from 'lodash';
import classNames from 'classnames';

import { getFromConfig } from '@lib/config';
import {
  APPLICATION_TYPE,
  getEnsaVersionLabel,
  getSapSystemType,
} from '@lib/model/sapSystems';
import { getOperationLabel } from '@lib/operations';
import { STALE_ROW } from '@lib/tables';

import HealthIcon from '@common/HealthIcon';
import {
  OperationForbiddenModal,
  SapStartStopOperationModal,
} from '@common/OperationModals';
import OperationsButton from '@common/OperationsButton';
import PageHeader from '@common/PageHeader';
import Tags from '@common/Tags';
import Table from '@common/Table';

import usePersistentSearchParams from '@hooks/usePersistentSearchParams';

import DeregistrationModal from '@pages/DeregistrationModal';
import HealthSummary from '@pages/HealthSummary';
import SAPSystemItemOverview from '@pages/SapSystemsOverviewPage/SapSystemItemOverview';
import { getCounters } from '@pages/HealthSummary/summarySelection';

import { getSapSystemsBulkOperations } from './sapSystemOperations';

function SapSystemsOverview({
  sapSystems,
  applicationInstances,
  databaseInstances,
  loading,
  userAbilities,
  userTimezone,
  runningOperation,
  operationsEnabled = getFromConfig('operationsEnabled'),
  onTagAdd,
  onTagRemove,
  onInstanceCleanUp,
  onOperationRequest,
  onOperationForbiddenDismiss,
}) {
  const [searchParams, setSearchParams] =
    usePersistentSearchParams('sapSystems');
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);
  const [instanceToDeregister, setInstanceToDeregister] = useState(undefined);
  const [instanceType, setInstanceType] = useState(undefined);

  const [bulkOperationModal, setBulkOperationModalOpen] = useState({
    open: false,
    operation: undefined,
    sapSystems: [],
  });

  const closeBulkOperationModal = () =>
    setBulkOperationModalOpen((prevState) => ({ ...prevState, open: false }));

  const requestBulkOperation = (params) => {
    const { operation, sapSystems: targetSapSystems } = bulkOperationModal;

    onOperationRequest({
      operation,
      sapSystems: targetSapSystems,
      params,
    });
    closeBulkOperationModal();
  };

  const selectBulkOperation = (selectedSapSystems) => (operation) =>
    setBulkOperationModalOpen({
      open: true,
      operation,
      sapSystems: selectedSapSystems,
    });

  const config = {
    pagination: true,
    selectable: operationsEnabled,
    usePadding: false,
    collapsedRowClassName: 'bg-gray-100',
    rowClassName: ({ staleAt }) =>
      classNames({
        [STALE_ROW]: !!staleAt,
      }),
    columns: [
      {
        title: 'Health',
        key: 'health',
        filterFromParams: true,
        filter: true,
        render: (content, { staleAt }) => (
          <div className="ml-4">
            <HealthIcon
              health={content}
              staleAt={staleAt}
              timezone={userTimezone}
            />
          </div>
        ),
      },
      {
        title: 'SID',
        key: 'sid',
        filterFromParams: true,
        filter: true,
        render: (content, item) => (
          <Link
            className="text-jungle-green-500 hover:opacity-75"
            to={`/sap_systems/${item.id}`}
          >
            {content}
          </Link>
        ),
      },
      {
        title: 'Attached RDBMS',
        key: 'attachedRdbms',

        render: (content, item) => (
          <Link
            className="text-jungle-green-500 hover:opacity-75"
            to={`/databases/${item.databaseId}`}
          >
            {content}
          </Link>
        ),
      },
      {
        title: 'Tenant',
        key: 'tenant',
      },
      {
        title: 'Type',
        key: 'applicationInstances',
        render: (content) => getSapSystemType(content),
      },
      {
        title: 'DB Address',
        key: 'dbAddress',
      },
      {
        title: 'ENSA version',
        key: 'ensaVersion',
        render: (content) => getEnsaVersionLabel(content),
      },
      {
        title: 'Tags',
        key: 'tags',
        className: 'w-80',
        filterFromParams: true,
        filter: (filters, key) => (element) =>
          element[key].some((tag) => filters.includes(tag)),
        render: (content, item) => (
          <Tags
            userAbilities={userAbilities}
            tagAdditionPermittedFor={['all:sap_system_tags']}
            tagDeletionPermittedFor={['all:sap_system_tags']}
            tags={content}
            resourceId={item.id}
            onChange={() => {}}
            onAdd={(tag) => onTagAdd(tag, item.id)}
            onRemove={(tag) => onTagRemove(tag, item.id)}
          />
        ),
      },
    ],
    collapsibleDetailRenderer: (sapSystem) => (
      <SAPSystemItemOverview
        sapSystem={sapSystem}
        userAbilities={userAbilities}
        userTimezone={userTimezone}
        onCleanUpClick={(instance, type) => {
          setCleanUpModalOpen(true);
          setInstanceToDeregister(instance);
          setInstanceType(type);
        }}
      />
    ),
  };

  const data = sapSystems.map((sapSystem) => ({
    id: sapSystem.id,
    health: sapSystem.health,
    sid: sapSystem.sid,
    attachedRdbms: sapSystem.database_sid,
    tenant: sapSystem.tenant,
    dbAddress: sapSystem.db_host,
    ensaVersion: sapSystem.ensa_version || '-',
    applicationInstances: filter(applicationInstances, {
      sap_system_id: sapSystem.id,
    }),
    databaseInstances: filter(databaseInstances, {
      database_id: sapSystem.database_id,
    }),
    tags: (sapSystem.tags && sapSystem.tags.map((tag) => tag.value)) || [],
    databaseId: sapSystem.database_id,
    staleAt: sapSystem.stale_at,
  }));

  const counters = getCounters(data || []);
  return loading ? (
    'Loading SAP Systems...'
  ) : (
    <>
      <PageHeader className="font-bold">SAP Systems</PageHeader>
      <DeregistrationModal
        contentType={instanceType}
        instanceNumber={instanceToDeregister?.instance_number}
        sid={instanceToDeregister?.sid}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          setCleanUpModalOpen(false);
          onInstanceCleanUp(instanceToDeregister, instanceType);
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      <SapStartStopOperationModal
        operation={bulkOperationModal.operation}
        type={APPLICATION_TYPE}
        resources={bulkOperationModal.sapSystems.map(({ id, sid }) => ({
          id,
          label: sid,
        }))}
        isOpen={bulkOperationModal.open}
        onRequest={requestBulkOperation}
        onCancel={closeBulkOperationModal}
      />
      <OperationForbiddenModal
        operation={getOperationLabel(runningOperation?.operation)}
        isOpen={!!runningOperation?.forbidden}
        errors={runningOperation?.errors ?? []}
        groupByResource
        onCancel={onOperationForbiddenDismiss}
      />
      <div className="bg-white rounded-lg shadow">
        <HealthSummary {...counters} className="px-4 py-2" />
        <Table
          config={config}
          data={data}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          rowKey={(item, _index) => item.id}
          renderSelectionActions={(selectedSapSystems) => (
            <OperationsButton
              userAbilities={userAbilities}
              menuPosition="bottom end"
              operations={getSapSystemsBulkOperations(
                selectBulkOperation(selectedSapSystems)
              )}
            />
          )}
        />
      </div>
    </>
  );
}

export default SapSystemsOverview;
