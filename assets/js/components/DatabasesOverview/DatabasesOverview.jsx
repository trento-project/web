import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import HealthIcon from '@components/Health';
import Table from '@components/Table';
import DatabaseItemOverview from './DatabaseItemOverview';
import Tags from '@components/Tags';
import { addTagToDatabase, removeTagFromDatabase } from '@state/databases';

import { logError } from '@lib/log';

const byDatabase = (id) => (instance) => instance.sap_system_id === id;

const addTag = (tag, sapSystemId) => {
  axios
    .post(`/api/databases/${sapSystemId}/tags`, {
      value: tag,
    })
    .catch((error) => {
      logError('Error posting tag: ', error);
    });
};

const removeTag = (tag, sapSystemId) => {
  axios.delete(`/api/databases/${sapSystemId}/tags/${tag}`).catch((error) => {
    logError('Error deleting tag: ', error);
  });
};

const DatabasesOverview = () => {
  const { databases, databaseInstances, loading } = useSelector(
    (state) => state.databasesList
  );
  const dispatch = useDispatch();
  const config = {
    pagination: true,
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
              to={`/databases/${item.id}`}
            >
              {content}
            </Link>
          );
        },
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
              {statusAggregation.critical} critical, {statusAggregation.warning}{' '}
              warning, {statusAggregation.passing} passing
              {content}
            </div>
          );
        },
      },
      {
        title: 'Tags',
        key: 'tags',
        render: (content, item) => (
          <Tags
            tags={content}
            onChange={() => {}}
            onAdd={(tag) => {
              addTag(tag, item.id);
              dispatch(addTagToDatabase(tag, item.id));
            }}
            onRemove={(tag) => {
              removeTag(tag, item.id);
              dispatch(removeTagFromDatabase(tag, item.id));
            }}
          />
        ),
      },
    ],
    collapsibleDetailRenderer: (database) => (
      <DatabaseItemOverview database={database} />
    ),
  };

  const data = databases.map((database) => {
    return {
      id: database.id,
      health: database.health,
      sid: database.sid,
      attachedRdbms: database.tenant,
      tenant: database.tenant,
      dbAddress: database.db_host,
      databaseInstances: databaseInstances.filter(byDatabase(database.id)),
      tags: (database.tags && database.tags.map((tag) => tag.value)) || [],
    };
  });

  return loading ? (
    'Loading HANA Databases...'
  ) : (
    <Table config={config} data={data} />
  );
};

export default DatabasesOverview;
