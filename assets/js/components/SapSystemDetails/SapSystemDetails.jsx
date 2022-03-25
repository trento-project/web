import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ListView from '@components/ListView';
import Table from '@components/Table';
import {
  sapHostsTableConfiguration,
  sapInstancesTableConfiguration,
} from './tableConfigs';
import { getSapSystemDetail } from '@state/selectors';

const SapSystemDetails = () => {
  const { id } = useParams();
  const sapSystem = useSelector(getSapSystemDetail(id));

  if (!sapSystem) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <div className="flex">
        <h1 className="text-3xl font-bold">SAP System Details</h1>
      </div>

      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            { title: 'Name', content: sapSystem.sid },
            { title: 'Type', content: 'Application Server' },
          ]}
        />
      </div>

      <div className="mt-16">
        <div className="flex flex-direction-row">
          <h2 className="text-2xl font-bold self-center">Layout</h2>
        </div>
        <Table
          config={sapInstancesTableConfiguration}
          data={sapSystem.instances}
        />
      </div>

      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">Hosts</h2>
        </div>
        <Table config={sapHostsTableConfiguration} data={sapSystem.hosts} />
      </div>
    </div>
  );
};

export default SapSystemDetails;
