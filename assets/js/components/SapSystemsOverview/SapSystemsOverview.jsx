import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import HealthIcon from '@components/Health';
import Table from '@components/Table';
import SAPSystemItemOverview from '@components/SapSystemsOverview/SapSystemItemOverview';
import Tags from '@components/Tags';

import { addTagToSAPSystem, removeTagFromSAPSystem } from '@state/sapSystems';

import { post, del } from '@lib/network';
import { ComponentHealthSummary } from '@components/HealthSummary';

const bySapSystem = (id) => (instance) => instance.sap_system_id === id;

const addTag = (tag, sapSystemId) => {
  post(`/api/sap_systems/${sapSystemId}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, sapSystemId) => {
  del(`/api/sap_systems/${sapSystemId}/tags/${tag}`);
};

const SapSystemsOverview = () => {
  const { sapSystems, applicationInstances, databaseInstances, loading } =
    useSelector((state) => state.sapSystemsList);
  const dispatch = useDispatch();
  const config = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Health',
        key: 'health',
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
        filter: true,
        render: (content, item) => {
          return (
            <Link
              className="text-jungle-green-500 hover:opacity-75"
              to={`/sap_systems/${item.id}`}
            >
              {content}
            </Link>
          );
        },
      },
      {
        title: 'Attached RDBMS',
        key: 'attachedRdbms',

        render: (content, item) => {
          return (
            <Link
              className="text-jungle-green-500 hover:opacity-75"
              to={`/databases/${item.id}`}
            >
              {content}
            </Link>
          );
        },
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
        filter: (filter, key) => (element) =>
          element[key].some((tag) => filter.includes(tag)),
        render: (content, item) => (
          <Tags
            tags={content}
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

  const data = sapSystems.map((sapSystem) => {
    return {
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
    };
  });

  return loading ? (
    'Loading SAP Systems...'
  ) : (
    <Fragment>
      <ComponentHealthSummary data={data} />
      <Table config={config} data={data} />
    </Fragment>
  );
};

export default SapSystemsOverview;
