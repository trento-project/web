import { EOS_DATABASE_OUTLINED } from 'eos-icons-react';
import React from 'react';
import { sortBy } from 'lodash';

import { DATABASE_TYPE } from '@lib/model/sapSystems';
import InstanceOverview from '@pages/InstanceOverview';

export function DatabaseInstance({ instance, userAbilities, onCleanUpClick }) {
  return (
    <InstanceOverview
      instanceType={DATABASE_TYPE}
      instance={instance}
      userAbilities={userAbilities}
      cleanUpPermittedFor={['cleanup:database_instance']}
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
  userAbilities,
  onCleanUpClick,
}) {
  const sortedInstances = sortBy(instances, ['system_replication_tier']);

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
            {sortedInstances &&
              sortedInstances.map((instance) => (
                <DatabaseInstance
                  key={`${instance.host_id}_${instance.instance_number}`}
                  instance={instance}
                  userAbilities={userAbilities}
                  onCleanUpClick={onCleanUpClick}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseLayer({ instances, userAbilities, onCleanUpClick }) {
  return (
    <PlainDatabaseItemOverview
      instances={instances}
      asDatabaseLayer
      userAbilities={userAbilities}
      onCleanUpClick={onCleanUpClick}
    />
  );
}

function DatabaseInstances({ instances, userAbilities, onCleanUpClick }) {
  return (
    <div className="p-2">
      <PlainDatabaseItemOverview
        instances={instances}
        userAbilities={userAbilities}
        onCleanUpClick={onCleanUpClick}
      />
    </div>
  );
}

function DatabaseItemOverview({
  database,
  asDatabaseLayer = false,
  userAbilities,
  onCleanUpClick,
}) {
  const { databaseInstances } = database;

  return asDatabaseLayer ? (
    <DatabaseLayer
      instances={databaseInstances}
      userAbilities={userAbilities}
      onCleanUpClick={onCleanUpClick}
    />
  ) : (
    <DatabaseInstances
      instances={databaseInstances}
      userAbilities={userAbilities}
      onCleanUpClick={onCleanUpClick}
    />
  );
}

export default DatabaseItemOverview;
