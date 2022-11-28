import classNames from 'classnames';
import { EOS_DATABASE_OUTLINED } from 'eos-icons-react';
import React from 'react';
import InstanceOverview from '@components/InstanceOverview';
import { DATABASE_TYPE } from '@lib/model';

export function DatabaseInstance({ instance }) {
  return <InstanceOverview instanceType={DATABASE_TYPE} instance={instance} />;
}

const databaseInstanceColumns = [
  { name: 'Health', cssClass: 'w-20' },
  { name: 'Instance Nr', cssClass: 'w-24' },
  { name: 'Features' },
  { name: 'System Replication' },
  { name: 'Cluster' },
  { name: 'Host' },
];

function PlainDatabaseItemOverview({ instances, asDatabaseLayer = false }) {
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
            {instances
              && instances.map(
                (instance, index) => <DatabaseInstance key={index} instance={instance} />,
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseLayer({ instances }) {
  return (
    <PlainDatabaseItemOverview instances={instances} asDatabaseLayer />
  );
}

function DatabaseInstances({ instances }) {
  return (
    <div className="p-2">
      <PlainDatabaseItemOverview instances={instances} />
    </div>
  );
}

function DatabaseItemOverview({ database, asDatabaseLayer = false }) {
  const { databaseInstances } = database;

  return asDatabaseLayer ? (
    <DatabaseLayer instances={databaseInstances} />
  ) : (
    <DatabaseInstances instances={databaseInstances} />
  );
}

export default DatabaseItemOverview;
