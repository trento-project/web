import {
  EOS_APPLICATION_OUTLINED,
  EOS_DATABASE,
  EOS_DATABASE_OUTLINED,
} from 'eos-icons-react';
import React from 'react';
import { Link } from 'react-router-dom';
import HealthIcon from '../Health';
import Pill from '../Pill/Pill';

const renderApplicationInstance = (instance) =>
  renderInstance('application', instance);
const renderDatabaseInstance = (instance) =>
  renderInstance('database', instance);

const applicationInstanceColumns = [
  'Health',
  'Instance Nr',
  'Features',
  'Cluster',
  'Host',
];

const databaseInstanceColumns = [
  ...applicationInstanceColumns,
  'System Replication',
];

const renderInstance = (
  instanceType,
  {
    health,
    systemReplication,
    instance_number: instanceNumber,
    features,
    host_id: hostId,
    host: { hostname: hostName, cluster },
  }
) => (
  <div className="table-row border-b">
    <div className="table-cell p-2">
      <HealthIcon health={health} />
    </div>
    <div className="table-cell p-2">{instanceNumber}</div>
    <div className="table-cell p-2 text-gray-500 dark:text-gray-300 text-sm">
      {features.split('|').map((feature) => (
        <Pill>{feature}</Pill>
      ))}
    </div>
    <div className="table-cell p-2">
      {cluster ? (
        cluster.name
      ) : (
        <p className="text-gray-500 dark:text-gray-300 text-sm">
          not available
        </p>
      )}
    </div>
    <div className="table-cell p-2">
      <Link
        className="ml-auto hidden md:block text-sm text-gray-500 dark:text-gray-300 underline"
        to={`/hosts/${hostId}`}
      >
        {hostName}
      </Link>
    </div>
    {instanceType === 'database' && (
      <div className="table-cell p-2">{systemReplication}</div>
    )}
  </div>
);

const SAPSystemItemOverview = ({ sapSystem }) => {
  const { sid, tenant, applicationInstances, databaseInstances } = sapSystem;

  return (
    <div className="p-2">
      <div className="flex bg-white dark:bg-gray-800 shadow border-b border-gray-300 rounded-t-lg">
        <div className="flex-auto p-6">
          <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start pb-4">
            <span className="text-left">
              <EOS_APPLICATION_OUTLINED size={30} className="fill-blue-500" />
            </span>
            <h2 className="mx-2 text-2xl">Application</h2>
            <div className="text-xl font-semibold text-gray-500 dark:text-gray-300">
              SID: {sid}
            </div>
          </div>
          <div className="">
            <div className="table w-full">
              <div className="table-header-group bg-grey bg-gray-100">
                <div className="table-row">
                  {applicationInstanceColumns.map((column) => (
                    <div className="table-cell p-2 text-left">{column}</div>
                  ))}
                </div>
              </div>
              <div className="table-row-group">
                {applicationInstances.map(renderApplicationInstance)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex bg-white dark:bg-gray-800 shadow mb-2 rounded-b-lg">
        <div className="flex-auto p-6">
          <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start pb-4">
            <span className="text-left">
              <EOS_DATABASE_OUTLINED size={30} className="fill-blue-500" />
            </span>
            <h2 className="mx-2 text-2xl">Database</h2>
            <div className="text-xl font-semibold text-gray-500 dark:text-gray-300">
              SID: {tenant}
            </div>
          </div>
          <div className="table border-collapse table-auto w-full text-sm">
            <div className="table-header-group bg-grey bg-gray-100">
              <div className="table-row">
                {databaseInstanceColumns.map((column) => (
                  <div className="table-cell p-2 text-left">{column}</div>
                ))}
              </div>
            </div>
            <div className="table-row-group">
              {databaseInstances.map(renderDatabaseInstance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SAPSystemItemOverview;
