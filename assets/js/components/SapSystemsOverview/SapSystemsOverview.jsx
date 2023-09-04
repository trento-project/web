/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { filter } from 'lodash';

import PageHeader from '@components/PageHeader';
import HealthIcon from '@components/Health';
import Table from '@components/Table';
import SAPSystemItemOverview from '@components/SapSystemsOverview/SapSystemItemOverview';
import Tags from '@components/Tags';
import HealthSummary from '@components/HealthSummary/HealthSummary';
import { getCounters } from '@components/HealthSummary/summarySelection';
import { renderEnsaVersion } from '@components/SapSystemDetails';

function SapSystemsOverview({
  sapSystems,
  applicationInstances,
  databaseInstances,
  loading,
  onTagAdded,
  onTagRemoved,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

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
            to={`/databases/${item.id}`}
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
        render: (content) => renderEnsaVersion(content),
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
            onAdd={(tag) => onTagAdded(tag, item.id)}
            onRemove={(tag) => onTagRemoved(tag, item.id)}
          />
        ),
      },
    ],
    collapsibleDetailRenderer: (sapSystem) => (
      <SAPSystemItemOverview sapSystem={sapSystem} />
    ),
  };

  const data = sapSystems.map((sapSystem) => ({
    id: sapSystem.id,
    health: sapSystem.health,
    sid: sapSystem.sid,
    attachedRdbms: sapSystem.tenant,
    tenant: sapSystem.tenant,
    dbAddress: sapSystem.db_host,
    ensaVersion: sapSystem.ensa_version || '-',
    applicationInstances: filter(applicationInstances, {
      sap_system_id: sapSystem.id,
    }),
    databaseInstances: filter(databaseInstances, {
      sap_system_id: sapSystem.id,
    }),
    tags: (sapSystem.tags && sapSystem.tags.map((tag) => tag.value)) || [],
  }));

  const counters = getCounters(data || []);

  return loading ? (
    'Loading SAP Systems...'
  ) : (
    <>
      <PageHeader className="font-bold">SAP Systems</PageHeader>
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
