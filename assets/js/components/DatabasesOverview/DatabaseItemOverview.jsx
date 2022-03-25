import classNames from 'classnames';
import { EOS_DATABASE_OUTLINED } from 'eos-icons-react';
import React from 'react';
import InstanceOverview from '@components/InstanceOverview';

export const DatabaseInstance = ({ instance }) => (
  <InstanceOverview instanceType={'database'} instance={instance} />
);

const databaseInstanceColumns = [
  { name: 'Health', cssClass: 'w-20' },
  { name: 'Instance Nr', cssClass: 'w-24' },
  { name: 'Features' },
  { name: 'System Replication' },
  { name: 'Cluster' },
  { name: 'Host' },
];

const PlainDatabaseItemOverview = ({ instances, asDatabaseLayer = false }) => {
  return (
    <div
      className={classNames('flex bg-white dark:bg-gray-800 shadow mb-2', {
        'rounded-lg': !asDatabaseLayer,
        'rounded-b-lg': asDatabaseLayer,
      })}
    >
      <div className="flex-auto p-6">
        <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start pb-4">
          <span className="text-left">
            <EOS_DATABASE_OUTLINED size={25} className="fill-blue-500" />
          </span>
          <h2 className="mx-2">
            {asDatabaseLayer ? 'Database Layer' : 'Database Instances'}
          </h2>
        </div>
        <div className="table w-full">
          <div className="table-header-group bg-grey bg-gray-100">
            <div className="table-row">
              {databaseInstanceColumns.map(({ name, cssClass }, index) => (
                <div
                  key={index}
                  className={`table-cell p-2 text-left text-xs font-medium text-gray-500 uppercase ${cssClass}`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <div className="table-row-group">
            {instances &&
              instances.map((instance, index) => {
                return <DatabaseInstance key={index} instance={instance} />;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DatabaseLayer = ({ instances }) => {
  return (
    <PlainDatabaseItemOverview instances={instances} asDatabaseLayer={true} />
  );
};

const DatabaseInstances = ({ instances }) => {
  return (
    <div className="p-2">
      <PlainDatabaseItemOverview instances={instances} />
    </div>
  );
};

const DatabaseItemOverview = ({ database, asDatabaseLayer = false }) => {
  const { databaseInstances } = database;

  return asDatabaseLayer ? (
    <DatabaseLayer instances={databaseInstances} />
  ) : (
    <DatabaseInstances instances={databaseInstances} />
  );
};

export default DatabaseItemOverview;
