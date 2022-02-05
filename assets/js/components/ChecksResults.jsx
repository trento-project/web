import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { EOS_LENS_FILLED } from 'eos-icons-react';
import Spinner from './Spinner';

const getChecksResults = (cluster) => {
  if (cluster) {
    return cluster.checks_results.reduce((acc, checkResult) => {
      acc[checkResult.host_id] = [
        ...(acc[checkResult.host_id] || []),
        checkResult,
      ];

      return acc;
    }, {});
  }
  return {};
};

const getDescriptionFromCatalog =
  (catalog = []) =>
  (check_id) => {
    return catalog.reduce((acc, check) => {
      if (check.id === check_id) {
        return check.description;
      }

      return acc;
    }, '');
  };

const getGroupFromCatalog =
  (catalog = []) =>
  (check_id) => {
    return catalog.reduce((acc, check) => {
      if (check.id === check_id) {
        return check.group;
      }

      return acc;
    }, '');
  };

const getHostname =
  (hosts = []) =>
  (host_id) => {
    return hosts.reduce((acc, host) => {
      if (host.id === host_id) {
        return host.hostname;
      }

      return acc;
    }, '');
  };

const sortChecksResults = (checksResults = []) => {
  return checksResults.sort((a, b) => {
    if (a.check_id === b.check_id) {
      return group(a.check_id) > group(b.check_id) ? 1 : -1;
    }
    return a.check_id > b.check_id ? 1 : -1;
  });
};

const getResultIcon = (result) => {
  switch (result) {
    case 'passing':
      return <EOS_LENS_FILLED className="fill-jungle-green-500" />;
    case 'warning':
      return <EOS_LENS_FILLED className="fill-yellow-500" />;
    case 'critical':
      return <EOS_LENS_FILLED className="fill-red-500" />;
    default:
      return <Spinner></Spinner>;
  }
};

const ChecksResults = () => {
  const { clusterID } = useParams();
  const cluster = useSelector((state) =>
    state.clustersList.clusters.find((cluster) => cluster.id === clusterID)
  );

  const hostname = getHostname(useSelector((state) => state.hostsList.hosts));

  const catalog = useSelector((state) => state.catalog.catalog).flatMap(
    ({ checks }) => checks
  );

  const checksResults = getChecksResults(cluster);

  const description = getDescriptionFromCatalog(catalog);
  const group = getGroupFromCatalog(catalog);

  return (
    <div>
      {Object.keys(checksResults).map((c) => (
        <div key="c" className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {hostname(c)}
                  </h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Group
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortChecksResults(checksResults[c]).map((checkResult) => (
                      <tr key={checkResult.check_id} className="animate-fade">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {group(checkResult.check_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {checkResult.check_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {description(checkResult.check_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap content-center">
                          {getResultIcon(checkResult.result)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChecksResults;
