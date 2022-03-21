import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import HealthIcon from '../Health';
import Table from '../Table';
import SAPSystemItemOverview from './SAPSystemItemOverview';
import Tags from '../Tags';

import { logError } from '@lib/log';

const bySapSystem = (id) => (instance) => instance.sap_system_id === id;

const addTag = (tag, sapSystemId) => {
  axios
    .post(`/api/sap_systems/${sapSystemId}/tags`, {
      value: tag,
    })
    .catch((error) => {
      logError('Error posting tag: ', error);
    });
};

const removeTag = (tag, sapSystemId) => {
  axios.delete(`/api/sap_systems/${sapSystemId}/tags/${tag}`).catch((error) => {
    logError('Error deleting tag: ', error);
  });
};

const SapSystemsOverview = () => {
  const { sapSystems, applicationInstances, databaseInstances, loading } =
    useSelector((state) => state.sapSystemsList);
  const config = {
    columns: [
      {
        title: 'Health',
        key: 'health',
        render: (content) => (
          <div className="ml-4">
            <HealthIcon health={content} />
          </div>
        ),
      },
      {
        title: 'SID',
        key: 'sid',
        render: (content, item) => {
          return (
            <Link
              className="text-jungle-green-500 hover:opacity-75"
              to={`/sap-systems/${item.id}`}
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
        render: (content, item) => (
          <Tags
            tags={content}
            onChange={() => {}}
            onAdd={(tag) => addTag(tag, item.id)}
            onRemove={(tag) => removeTag(tag, item.id)}
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
      tags: sapSystem.tags,
    };
  });

  return loading ? (
    'Loading SAP Systems...'
  ) : (
    <Table config={config} data={data} />
  );
};

export default SapSystemsOverview;
