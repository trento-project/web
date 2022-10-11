import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import classNames from 'classnames';

import { EOS_ERROR } from 'eos-icons-react';

import { getCluster } from '@state/selectors';

import Modal from '@components/Modal';
import NotificationBox from '@components/NotificationBox';
import LoadingBox from '@components/LoadingBox';

import BackButton from '@components/BackButton';
import WarningBanner from '@components/Banners/WarningBanner';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';

import { getClusterName } from '@components/ClusterLink';

import { ExecutionIcon } from './ExecutionIcon';
import ChecksResultFilters, { useFilteredChecks } from './ChecksResultFilters';
import ChecksSelectionHints from './ChecksSelectionHints';

const truncatedClusterNameClasses = classNames(
  'font-bold truncate w-60 inline-block align-top'
);

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

const sortChecks = (checksResults = []) => {
  return checksResults.sort((a, b) => {
    return a.check_id > b.check_id ? 1 : -1;
  });
};

const sortHosts = (hosts = []) => {
  return hosts.sort((a, b) => {
    return a.host_id > b.host_id ? 1 : -1;
  });
};

const getResultIcon = (executionState, health) => {
  return <ExecutionIcon health={health} executionState={executionState} />;
};

const ChecksResults = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState('');
  const dispatch = useDispatch();
  const { clusterID } = useParams();
  const cluster = useSelector(getCluster(clusterID));
  const [hasAlreadyChecksResults, setHasAlreadyChecksResults] = useState(false);

  const [catalogData, catalogError, loading] = useSelector((state) => [
    state.catalog.data,
    state.catalog.error,
    state.catalog.loading,
  ]);

  const findCheckDataByID = (checkID) => {
    return catalogData.find((check) => check.id === checkID);
  };

  const dispatchUpdateCatalog = () => {
    dispatch({
      type: 'UPDATE_CATALOG',
      payload: { flat: '', provider: cluster.provider },
    });
  };

  const hostname = getHostname(useSelector((state) => state.hostsList.hosts));

  const { filteredChecksyByHost, setFiltersPredicates } =
    useFilteredChecks(cluster);

  useEffect(() => {
    cluster?.provider && dispatchUpdateCatalog();
  }, [cluster?.provider]);

  useEffect(() => {
    setHasAlreadyChecksResults(cluster?.checks_results.length > 0);
  }, [cluster?.checks_results]);

  if (loading || !cluster) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  let pageContent;

  const description = (checkId) => {
    return catalogData.find(({ id }) => id === checkId)?.description;
  };

  if (catalogError) {
    pageContent = (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={dispatchUpdateCatalog}
      />
    );
  } else if (!hasAlreadyChecksResults) {
    pageContent = (
      <ChecksSelectionHints
        clusterId={clusterID}
        selectedChecks={cluster?.selected_checks}
      />
    );
  } else {
    const lastExecution = sortHosts(cluster?.hosts_executions.slice());

    pageContent = lastExecution.map(
      ({ _cluster_id, host_id, reachable, msg }, idx) => (
        <div
          key={idx}
          className={classNames('flex', 'flex-col', {
            'mb-8': idx != cluster.hosts_executions.length - 1,
          })}
        >
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
                    {sortChecks(filteredChecksyByHost(host_id)).map(
                      (checkId) => (
                        <tr
                          key={checkId}
                          className="animate-fade tn-check-result-row cursor-pointer hover:bg-emerald-50 ease-in-out duration-300"
                          onClick={() => {
                            setModalOpen(true);
                            setSelectedCheck(checkId);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-jungle-green-500">
                            {checkId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ReactMarkdown
                              className="markdown"
                              remarkPlugins={[remarkGfm]}
                            >
                              {description(checkId)}
                            </ReactMarkdown>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap content-center">
                            {getResultIcon(
                              cluster.checks_execution,
                              cluster?.checks_results.find(
                                (result) =>
                                  result.check_id === checkId &&
                                  result.host_id === host_id
                              )?.result
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  return (
    <div>
      <Modal
        title={description(selectedCheck)}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
          {findCheckDataByID(selectedCheck)?.remediation}
        </ReactMarkdown>
      </Modal>
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <div className="flex mb-4 justify-between">
        <h1 className="text-3xl w-3/5">
          <span className="font-medium">Checks Results for cluster</span>{' '}
          <span className={`font-bold ${truncatedClusterNameClasses}`}>
            {getClusterName(cluster)}
          </span>
        </h1>
        <ChecksResultFilters
          onChange={(filtersPredicates) =>
            setFiltersPredicates(filtersPredicates)
          }
        />
      </div>
      {cluster.provider == UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      {pageContent}
    </div>
  );
};

export default ChecksResults;
