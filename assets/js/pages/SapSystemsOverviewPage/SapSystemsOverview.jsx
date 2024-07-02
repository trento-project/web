/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { filter } from 'lodash';

import { getEnsaVersionLabel } from '@lib/model/sapSystems';

import HealthIcon from '@common/HealthIcon';
import PageHeader from '@common/PageHeader';
import Tags from '@common/Tags';
import Table from '@common/Table';

import DeregistrationModal from '@pages/DeregistrationModal';
import HealthSummary from '@pages/HealthSummary';
import SAPSystemItemOverview from '@pages/SapSystemsOverviewPage/SapSystemItemOverview';
import { getCounters } from '@pages/HealthSummary/summarySelection';

function SapSystemsOverview({
  sapSystems,
  applicationInstances,
  databaseInstances,
  loading,
  userAbilities,
  onTagAdd,
  onTagRemove,
  onInstanceCleanUp,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cleanUpModalOpen, setCleanUpModalOpen] = useState(false);
  const [instanceToDeregister, setInstanceToDeregister] = useState(undefined);
  const [instanceType, setInstanceType] = useState(undefined);

  const config = {
    pagination: true,
    usePadding: false,
    collapsedRowClassName: 'bg-gray-100',
    columns: [
      {
        title: 'Health',
        key: 'health',
        filterFromParams: true,
        filter: true,
        render: (content) => (
          <div className="ml-4">
            <HealthIcon health={content} />
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
      <div className="bg-white rounded-lg shadow">
        <HealthSummary {...counters} className="px-4 py-2" />
        <Table
          config={config}
          data={data}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          rowKey={(item, _index) => item.id}
        />
      </div>
    </>
  );
}

export default SapSystemsOverview;
