import { EOS_APPLICATION_OUTLINED } from 'eos-icons-react';
import React from 'react';
import DatabaseItemOverview from '../DatabasesOverview/DatabaseItemOverview';
import InstanceOverview from '../InstanceOverview';

const ApplicationInstance = ({ instance }) => (
  <InstanceOverview instanceType={'application'} instance={instance} />
);

const applicationInstanceColumns = [
  { name: 'Health', cssClass: 'w-20' },
  { name: 'Instance Nr', cssClass: 'w-24' },
  { name: 'Features' },
  { name: 'Cluster' },
  { name: 'Host' },
];

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
      <DatabaseItemOverview
        database={{ databaseInstances }}
        asDatabaseLayer={true}
      />
    </div>
  );
};

export default SAPSystemItemOverview;
