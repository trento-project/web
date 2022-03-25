import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ListView from '@components/ListView';
import Table from '@components/Table';
import {
  databaseHostsTableConfiguration,
  databaseInstancesTableConfiguration,
} from './tableConfigs';
import { getDatabaseDetail } from '../../state/selectors';

const DatabaseDetails = () => {
  const { id } = useParams();
  const database = useSelector(getDatabaseDetail(id));

  if (!database) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <div className="flex">
        <h1 className="text-3xl font-bold">HANA Database details</h1>
      </div>

      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            { title: 'Name', content: database.sid },
            { title: 'Type', content: 'HANA Database' },
          ]}
        />
      </div>

      <div className="mt-16">
        <div className="flex flex-direction-row">
          <h2 className="text-2xl font-bold self-center">Layout</h2>
        </div>
        <Table
          config={databaseInstancesTableConfiguration}
          data={database.instances}
        />
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">Hosts</h2>
        </div>
        <Table config={databaseHostsTableConfiguration} data={database.hosts} />
      </div>
    </div>
  );
};

export default DatabaseDetails;
