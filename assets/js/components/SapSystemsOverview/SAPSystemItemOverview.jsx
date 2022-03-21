import {
  EOS_APPLICATION_OUTLINED,
  EOS_DATABASE_OUTLINED,
} from 'eos-icons-react';
import React from 'react';
import { DatabaseInstance } from '../DatabasesOverview/DatabaseItemOverview';
import InstanceOverview from '../InstanceOverview';

const ApplicationType = 'application';

const ApplicationInstance = ({ instance }) => (
  <InstanceOverview instanceType={ApplicationType} instance={instance} />
);

const instanceColumns = [
  { name: 'Health', cssClass: 'w-20' },
  { name: 'Instance Nr', cssClass: 'w-24' },
  { name: 'Features' },
  { name: 'Cluster' },
  { name: 'Host' },
];

const applicationInstanceColumns = [...instanceColumns];

const databaseInstanceColumns = [...instanceColumns];
databaseInstanceColumns.splice(3, 0, { name: 'System Replication' });

const SAPSystemItemOverview = ({ sapSystem }) => {
  const { applicationInstances, databaseInstances } = sapSystem;

  return (
    <div className="p-2">
      <div className="flex bg-white dark:bg-gray-800 shadow border-b border-gray-300 rounded-t-lg">
        <div className="flex-auto p-6">
          <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start pb-4">
            <span className="text-left">
              <EOS_APPLICATION_OUTLINED size={25} className="fill-blue-500" />
            </span>
            <h2 className="mx-2">Application Layer</h2>
          </div>
          <div className="table w-full">
            <div className="table-header-group bg-grey bg-gray-100">
              <div className="table-row">
                {applicationInstanceColumns.map(({ name, cssClass }, index) => (
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
              {applicationInstances &&
                applicationInstances.map((instance, index) => {
                  return (
                    <ApplicationInstance key={index} instance={instance} />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex bg-white dark:bg-gray-800 shadow mb-2 rounded-b-lg">
        <div className="flex-auto p-6">
          <div className="w-full text-gray-800 dark:text-white flex items-center transition-colors duration-200 justify-start pb-4">
            <span className="text-left">
              <EOS_DATABASE_OUTLINED size={25} className="fill-blue-500" />
            </span>
            <h2 className="mx-2">Database Layer</h2>
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
              {databaseInstances &&
                databaseInstances.map((instance, index) => {
                  return <DatabaseInstance key={index} instance={instance} />;
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SAPSystemItemOverview;
