/* eslint-disable react/no-unstable-nested-components */
import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import HealthIcon from '@components/Health';
import Table from '@components/Table';
import SAPSystemItemOverview from '@components/SapSystemsOverview/SapSystemItemOverview';
import Tags from '@components/Tags';

import { addTagToSAPSystem, removeTagFromSAPSystem } from '@state/sapSystems';

import { post, del } from '@lib/network';
import HealthSummary from '@components/HealthSummary/HealthSummary';
import { getCounters } from '@components/HealthSummary/summarySelection';

const bySapSystem = (id) => (instance) => instance.sap_system_id === id;

const addTag = (tag, sapSystemId) => {
  post(`/api/sap_systems/${sapSystemId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, sapSystemId) => {
  del(`/api/sap_systems/${sapSystemId}/tags/${tag}`);
};

function SapSystemsOverview() {
  const { sapSystems, applicationInstances, databaseInstances, loading } =
    useSelector((state) => state.sapSystemsList);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const config = {
    pagination: true,
    usePadding: false,
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
                addTagToSAPSystem({ tags: [{ value: tag }], id: item.id })
              );
            }}
            onRemove={(tag) => {
              removeTag(tag, item.id);
              dispatch(
                removeTagFromSAPSystem({ tags: [{ value: tag }], id: item.id })
              );
            }}
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
    applicationInstances: applicationInstances.filter(
      bySapSystem(sapSystem.id)
    ),
    databaseInstances: databaseInstances.filter(bySapSystem(sapSystem.id)),
    tags: (sapSystem.tags && sapSystem.tags.map((tag) => tag.value)) || [],
  }));

  const counters = getCounters(data || []);

  return loading ? (
    'Loading SAP Systems...'
  ) : (
    <>
      <PageHeader>
        <span className="font-bold">SAP Systems</span>
      </PageHeader>
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

export default SapSystemsOverview;
