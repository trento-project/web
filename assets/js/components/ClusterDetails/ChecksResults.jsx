import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  EOS_LENS_FILLED,
  EOS_ERROR,
  EOS_SCHEDULE,
  EOS_ARROW_BACK,
} from 'eos-icons-react';
import Spinner from '../Spinner';

import NotificationBox from '../NotificationBox';
import LoadingBox from '../LoadingBox';

import Button from '@components/Button';

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

const sortChecksResults = (checksResults = []) => {
  return checksResults.sort((a, b) => {
    return a.check_id > b.check_id ? 1 : -1;
  });
};

const sortHosts = (hosts = []) => {
  return hosts.sort((a, b) => {
    return a.host_id > b.host_id ? 1 : -1;
  });
};

const getResultIcon = (checks_execution, result) => {
  switch (checks_execution) {
    case 'requested':
      return <EOS_SCHEDULE className="fill-gray-500" />;
    case 'running':
      return <Spinner></Spinner>;
  }

  switch (result) {
    case 'passing':
      return <EOS_LENS_FILLED className="fill-jungle-green-500" />;
    case 'warning':
      return <EOS_LENS_FILLED className="fill-yellow-500" />;
    case 'critical':
      return <EOS_LENS_FILLED className="fill-red-500" />;
    default:
      return <EOS_LENS_FILLED className="fill-gray-500" />;
  }
};

export const ChecksResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      <Button
        type="secondary"
        size="small"
        onClick={() => navigate(`/clusters/${clusterID}`)}
      >
        <EOS_ARROW_BACK className="inline-block" /> Back to Cluster
      </Button>
      {sortHosts(cluster?.hosts_executions.slice()).map(
        ({ _cluster_id, host_id, reachable, msg }, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {hostname(host_id)}
                    </h3>
                    {reachable == false && (
                      <div
                        className="bg-yellow-200 border-yellow-600 text-yellow-600 border-l-4 p-4"
                        role="alert"
                      >
                        <p>{msg}</p>
                      </div>
                    )}
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
                      {sortChecksResults(cluster?.checks_results.slice())
                        .filter(
                          (check_result) => check_result.host_id == host_id
                        )
                        .filter(
                          (check_result) => check_result.result != 'skipped'
                        ) // Filter "skipped" results by now
                        .map((checkResult) => (
                          <tr
                            key={checkResult.check_id}
                            className="animate-fade"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {checkResult.check_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {description(checkResult.check_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap content-center">
                              {getResultIcon(
                                cluster.checks_execution,
                                checkResult.result
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
