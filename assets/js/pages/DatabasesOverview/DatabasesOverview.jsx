// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { Link } from 'react-router';
import { filter } from 'lodash';
import classNames from 'classnames';

import { getFromConfig } from '@lib/config';
import { DATABASE_TYPE } from '@lib/model/sapSystems';
import { getOperationLabel } from '@lib/operations';
import { STALE_ROW } from '@lib/tables';

import HealthIcon from '@common/HealthIcon';
import {
  OperationForbiddenModal,
  SapStartStopOperationModal,
} from '@common/OperationModals';
import OperationsButton from '@common/OperationsButton';
import PageHeader from '@common/PageHeader';
import Table from '@common/Table';
import Tags from '@common/Tags';

import usePersistentSearchParams from '@hooks/usePersistentSearchParams';

import DeregistrationModal from '@pages/DeregistrationModal';
import HealthSummary from '@pages/HealthSummary';
import { getCounters } from '@pages/HealthSummary/summarySelection';

import DatabaseItemOverview from './DatabaseItemOverview';
import { getDatabasesBulkOperations } from './databaseOperations';

function DatabasesOverview({
  databases,
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
    usePersistentSearchParams('databases');
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);
  const [instanceToDeregister, setInstanceToDeregister] = useState(undefined);

  const [bulkOperationModal, setBulkOperationModalOpen] = useState({
    open: false,
    operation: undefined,
    databases: [],
  });

  const closeBulkOperationModal = () =>
    setBulkOperationModalOpen((prevState) => ({ ...prevState, open: false }));

  const requestBulkOperation = (params) => {
    const { operation, databases: targetDatabases } = bulkOperationModal;

    onOperationRequest({
      operation,
      databases: targetDatabases,
      params,
    });
    closeBulkOperationModal();
  };

  const selectBulkOperation = (selectedDatabases) => (operation) =>
    setBulkOperationModalOpen({
      open: true,
      operation,
      databases: selectedDatabases,
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
        filter: true,
        filterFromParams: true,
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
            to={`/databases/${item.id}`}
          >
            {content}
          </Link>
        ),
      },
      {
        title: 'Summary',
        key: 'instanceCount',
        render: (content, item) => {
          const statusAggregation = item.databaseInstances?.reduce(
            (acc, curr) => {
              switch (curr.health) {
                case 'passing':
                  acc.passing += 1;
                  break;
                case 'warning':
                  acc.warning += 1;
                  break;
                case 'critical':
                  acc.critical += 1;
                  break;
                default:
              }
              return acc;
            },
            {
              passing: 0,
              warning: 0,
              critical: 0,
            }
          );
          return (
            <div>
              {item.databaseInstances?.length} instances:{' '}
              {statusAggregation.critical} critical,
              {statusAggregation.warning} warning, {statusAggregation.passing}{' '}
              passing
              {content}
            </div>
          );
        },
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
            tagAdditionPermittedFor={['all:database_tags']}
            tagDeletionPermittedFor={['all:database_tags']}
            tags={content}
            resourceId={item.id}
            onChange={() => {}}
            onAdd={(tag) => onTagAdd(tag, item.id)}
            onRemove={(tag) => onTagRemove(tag, item.id)}
          />
        ),
      },
    ],
    collapsibleDetailRenderer: (database) => (
      <DatabaseItemOverview
        database={database}
        userAbilities={userAbilities}
        userTimezone={userTimezone}
        onCleanUpClick={(instance, _type) => {
          setCleanUpModalOpen(true);
          setInstanceToDeregister(instance);
        }}
      />
    ),
  };

  const data = databases.map((database) => ({
    id: database.id,
    health: database.health,
    sid: database.sid,
    tenant: database.tenant,
    dbAddress: database.db_host,
    databaseInstances: filter(databaseInstances, {
      database_id: database.id,
    }),
    tags: (database.tags && database.tags.map((tag) => tag.value)) || [],
    staleAt: database.stale_at,
  }));

  const counters = getCounters(data || []);

  return loading ? (
    'Loading HANA Databases...'
  ) : (
    <>
      <PageHeader className="font-bold">HANA Databases</PageHeader>
      <DeregistrationModal
        contentType={DATABASE_TYPE}
        instanceNumber={instanceToDeregister?.instance_number}
        sid={instanceToDeregister?.sid}
        isOpen={!!cleanUpModalOpen}
        onCleanUp={() => {
          setCleanUpModalOpen(false);
          onInstanceCleanUp(instanceToDeregister);
        }}
        onCancel={() => {
          setCleanUpModalOpen(false);
        }}
      />
      <SapStartStopOperationModal
        operation={bulkOperationModal.operation}
        type={DATABASE_TYPE}
        resources={bulkOperationModal.databases.map(({ id, sid }) => ({
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
          renderSelectionActions={(selectedDatabases) => (
            <OperationsButton
              userAbilities={userAbilities}
              menuPosition="bottom end"
              operations={getDatabasesBulkOperations(
                selectBulkOperation(selectedDatabases)
              )}
            />
          )}
        />
      </div>
    </>
  );
}

export default DatabasesOverview;
