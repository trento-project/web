import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import HealthIcon from '../Health';
import Table from '../Table';

const SapSystemsOverview = () => {
  const { sapSystems, loading } = useSelector((state) => state.sapSystemsList);
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
    ],
  };

  const data = sapSystems.map((sapSystem) => {
    return {
      id: sapSystem.id,
      health: sapSystem.health,
      sid: sapSystem.sid,
      attachedRdbms: sapSystem.database_instances[0].tenant,
      tenant: sapSystem.tenant,
      dbAddress: sapSystem.db_host,
    };
  });

  return loading ? (
    'Loading SAP Systems...'
  ) : (
    <Table config={config} data={data} />
  );
};

export default SapSystemsOverview;
