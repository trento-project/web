import { EOS_APPLICATION_OUTLINED } from 'eos-icons-react';
import React from 'react';

import { APPLICATION_TYPE } from '@lib/model/sapSystems';
import DatabaseItemOverview from '@pages/DatabasesOverview/DatabaseItemOverview';
import InstanceOverview from '@pages/InstanceOverview';

function ApplicationInstance({ instance, userAbilities, onCleanUpClick }) {
  return (
    <InstanceOverview
      instanceType={APPLICATION_TYPE}
      instance={instance}
      userAbilities={userAbilities}
      cleanUpPermittedFor={['cleanup:application_instance']}
      onCleanUpClick={onCleanUpClick}
    />
  );
}

const applicationInstanceColumns = [
  { key: 'health', name: 'Health', cssClass: 'w-20' },
  { key: 'instanceNr', name: 'Instance Nr', cssClass: 'w-24' },
  { key: 'features', name: 'Features' },
  { key: 'cluster', name: 'Cluster' },
  { key: 'hostname', name: 'Host' },
  { key: 'cleanupButton', cssClass: 'w-48' },
];

function SapSystemItemOverview({ sapSystem, userAbilities, onCleanUpClick }) {
  const { applicationInstances, databaseInstances } = sapSystem;

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex bg-white dark:bg-gray-800 shadow border-b border-gray-300 rounded-lg mb-4">
        <div className="flex-auto">
          <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start p-4">
            <span className="text-left">
              <EOS_APPLICATION_OUTLINED size={25} className="fill-black-500" />
            </span>
            <h2 className="mx-2 font-bold">Application Layer</h2>
          </div>
          <div className="table w-full">
            <div className="table-header-group bg-grey bg-gray-100">
              <div className="table-row border-b">
                {applicationInstanceColumns.map(({ key, name, cssClass }) => (
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
              {applicationInstances &&
                applicationInstances.map((instance) => (
                  <ApplicationInstance
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
      <DatabaseItemOverview
        database={{ databaseInstances }}
        asDatabaseLayer
        userAbilities={userAbilities}
        onCleanUpClick={onCleanUpClick}
      />
    </div>
  );
}

export default SapSystemItemOverview;
