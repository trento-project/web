/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { filter } from 'lodash';

import PageHeader from '@components/PageHeader';
import HealthIcon from '@components/Health';
import Table from '@components/Table';
import Tags from '@components/Tags';
import HealthSummary from '@components/HealthSummary/HealthSummary';
import { getCounters } from '@components/HealthSummary/summarySelection';

import DatabaseItemOverview from './DatabaseItemOverview';

function DatabasesOverview({
  databases,
  databaseInstances,
  loading,
  onTagAdded,
  onTagRemoved,
}) {
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
            tags={content}
            resourceId={item.id}
            onChange={() => {}}
            onAdd={(tag) => onTagAdded(tag, item.id)}
            onRemove={(tag) => onTagRemoved(tag, item.id)}
          />
        ),
      },
    ],
    collapsibleDetailRenderer: (database) => (
      <DatabaseItemOverview database={database} />
    ),
  };

  const data = databases.map((database) => ({
    id: database.id,
    health: database.health,
    sid: database.sid,
    attachedRdbms: database.tenant,
    tenant: database.tenant,
    dbAddress: database.db_host,
    databaseInstances: filter(databaseInstances, {
      sap_system_id: database.id,
    }),
    tags: (database.tags && database.tags.map((tag) => tag.value)) || [],
  }));

  const counters = getCounters(data || []);

  return loading ? (
    'Loading HANA Databases...'
  ) : (
    <>
      <PageHeader className="font-bold">HANA Databases</PageHeader>
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

export default DatabasesOverview;
