/* eslint-disable react/no-unstable-nested-components */
import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import HealthIcon from '@components/Health';
import Table from '@components/Table';
import Tags from '@components/Tags';
import { addTagToDatabase, removeTagFromDatabase } from '@state/databases';

import { post, del } from '@lib/network';
import { getCounters } from '@components/HealthSummary/summarySelection';
import HealthSummary from '@components/HealthSummary/HealthSummary';
import DatabaseItemOverview from './DatabaseItemOverview';

const byDatabase = (id) => (instance) => instance.sap_system_id === id;

const addTag = (tag, sapSystemId) => {
  post(`/databases/${sapSystemId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, sapSystemId) => {
  del(`/databases/${sapSystemId}/tags/${tag}`);
};

function DatabasesOverview() {
  const { databases, databaseInstances, loading } = useSelector(
    (state) => state.databasesList
  );
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
                addTagToDatabase({ tags: [{ value: tag }], id: item.id })
              );
            }}
            onRemove={(tag) => {
              removeTag(tag, item.id);
              dispatch(
                removeTagFromDatabase({ tags: [{ value: tag }], id: item.id })
              );
            }}
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
    databaseInstances: databaseInstances.filter(byDatabase(database.id)),
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
