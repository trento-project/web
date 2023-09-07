import { EOS_DATABASE_OUTLINED } from 'eos-icons-react';
import React from 'react';
import InstanceOverview from '@components/InstanceOverview';
import { DATABASE_TYPE } from '@lib/model';

export function DatabaseInstance({ instance, onCleanUpClick }) {
  return (
    <InstanceOverview
      instanceType={DATABASE_TYPE}
      instance={instance}
      onCleanUpClick={onCleanUpClick}
    />
  );
}

const databaseInstanceColumns = [
  { key: 'health', name: 'Health', cssClass: 'w-20' },
  { key: 'instanceNr', name: 'Instance Nr', cssClass: 'w-24' },
  { key: 'features', name: 'Features' },
  { key: 'systemReplication', name: 'System Replication' },
  { key: 'cluster', name: 'Cluster' },
  { key: 'hostname', name: 'Host' },
  { key: 'cleanupButton', cssClass: 'w-48' },
];

function PlainDatabaseItemOverview({
  instances,
  asDatabaseLayer = false,
  onCleanUpClick,
}) {
  return (
    <div className="flex bg-white dark:bg-gray-800 shadow mb-2 rounded-lg">
      <div className="flex-auto">
        <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start p-4">
          <span className="text-left">
            <EOS_DATABASE_OUTLINED size={25} className="fill-black-500" />
          </span>
          <h2 className="mx-2 font-bold">
            {asDatabaseLayer ? 'Database Layer' : 'Database Instances'}
          </h2>
        </div>
        <div className="table w-full">
          <div className="table-header-group bg-grey bg-gray-100">
            <div className="table-row border-b">
              {databaseInstanceColumns.map(({ key, name, cssClass }) => (
                <div
                  key={key}
                  className={`table-cell p-2 text-left text-xs font-medium text-gray-500 uppercase ${cssClass}`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <div className="table-row-group">
            {instances &&
              instances.map((instance) => (
                <DatabaseInstance
                  key={`${instance.host_id}_${instance.instance_number}`}
                  instance={instance}
                  onCleanUpClick={onCleanUpClick}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseLayer({ instances, onCleanUpClick }) {
  return (
    <PlainDatabaseItemOverview
      instances={instances}
      asDatabaseLayer
      onCleanUpClick={onCleanUpClick}
    />
  );
}

function DatabaseInstances({ instances, onCleanUpClick }) {
  return (
    <div className="p-2">
      <PlainDatabaseItemOverview
        instances={instances}
        onCleanUpClick={onCleanUpClick}
      />
    </div>
  );
}

function DatabaseItemOverview({
  database,
  asDatabaseLayer = false,
  onCleanUpClick,
}) {
  const { databaseInstances } = database;

  return asDatabaseLayer ? (
    <DatabaseLayer
      instances={databaseInstances}
      onCleanUpClick={onCleanUpClick}
    />
  ) : (
    <DatabaseInstances
      instances={databaseInstances}
      onCleanUpClick={onCleanUpClick}
    />
  );
}

export default DatabaseItemOverview;
