import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { EOS_LENS_FILLED, EOS_ERROR } from 'eos-icons-react';
import Spinner from './Spinner';

import NotificationBox from './NotificationBox';
import LoadingBox from './LoadingBox';

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

const getHostname =
  (hosts = []) =>
  (hostId) => {
    return hosts.reduce((acc, host) => {
      if (host.id === hostId) {
        return host.hostname;
      }

      return acc;
    }, '');
  };

const sortChecksResults = (checksResults = [], group) => {
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
  const dispatch = useDispatch();
  const { clusterID } = useParams();
  const cluster = useSelector((state) =>
    state.clustersList.clusters.find((cluster) => cluster.id === clusterID)
  );

  const [catalogData, catalogError, loading] = useSelector((state) => [
    state.catalog.data,
    state.catalog.error,
    state.catalog.loading,
  ]);

  const dispatchUpdateCatalog = () => {
    dispatch({
      type: 'UPDATE_CATALOG',
      payload: { flat: '', provider: 'azure' }, //FIXME: Get provider properly
    });
  };

  const checksResults = getChecksResults(cluster);

  const hostname = getHostname(useSelector((state) => state.hostsList.hosts));

  useEffect(() => {
    dispatchUpdateCatalog();
  }, [dispatch]);

  if (loading) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  if (catalogError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={dispatchUpdateCatalog}
      />
    );
  }

  const description = (checkId) => {
    return catalogData.find(({ id }) => id === checkId)?.description;
  };

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
