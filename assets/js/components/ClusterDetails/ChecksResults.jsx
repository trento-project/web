import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Modal from '@components/Modal';

import {
  EOS_ERROR,
  EOS_ARROW_BACK,
  EOS_SETTINGS,
  EOS_PLAY_CIRCLE,
} from 'eos-icons-react';

import NotificationBox from '../NotificationBox';
import LoadingBox from '../LoadingBox';

import Button from '@components/Button';
import { getCluster } from '@state/selectors';
import TrentoLogo from '../../../static/trento-icon.png';
import {
  TriggerChecksExecutionRequest,
  truncatedClusterNameClasses,
} from './ClusterDetails';
import { ExecutionIcon } from './ExecutionIcon';
import { getClusterName } from '@components/ClusterLink';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export const ChecksResults = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clusterID } = useParams();
  const cluster = useSelector(getCluster(clusterID));
  const [hasAlreadyChecksResults, setHasAlreadyChecksResults] = useState(false);

  const [catalogData, catalogErrorCode, catalogError, loading] = useSelector(
    (state) => [
      state.catalog.data,
      state.catalog.errorCode,
      state.catalog.error,
      state.catalog.loading,
    ]
  );

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
    if (catalogErrorCode == 'not_found') {
      pageContent = (
        <NotificationBox
          icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
          text={
            <ReactMarkdown
              className="markdown"
              remarkPlugins={[remarkGfm]}
            >{`Provider \`${cluster?.provider}\` does not support checks execution`}</ReactMarkdown>
          }
        />
      );
    } else {
      pageContent = (
        <NotificationBox
          icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
          text={catalogError}
          buttonText="Try again"
          buttonOnClick={dispatchUpdateCatalog}
        />
      );
    }
  } else if (!hasAlreadyChecksResults) {
    pageContent = (
      <HintForChecksSelection
        clusterId={clusterID}
        selectedChecks={cluster?.selected_checks}
      />
    );
  } else {
    const lastExecution = sortHosts(cluster?.hosts_executions.slice());
    pageContent = lastExecution.map(
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
                    {sortChecks(cluster?.selected_checks.slice()).map(
                      (checkId) => (
                        <tr
                          key={checkId}
                          className="animate-fade tn-check-result-row cursor-pointer"
                          onClick={() => {
                            setModalOpen(true);
                            setSelectedCheck(checkId);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
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
      <div className="flex mb-4">
        <h1 className="text-3xl w-3/5">
          <span className="font-medium">Checks Results for cluster</span>{' '}
          <span className={`font-bold ${truncatedClusterNameClasses}`}>
            {getClusterName(cluster)}
          </span>
        </h1>
        <div className="flex w-2/5 justify-end text-white">
          <Button
            className="w-1/3 bg-waterhole-blue text-white"
            size="small"
            onClick={() => navigate(`/clusters/${cluster.id}`)}
          >
            <EOS_ARROW_BACK className="inline-block fill-white" /> Back to
            Cluster
          </Button>
        </div>
      </div>
      {pageContent}
    </div>
  );
};

const HintForChecksSelection = ({ clusterId, selectedChecks }) => {
  const navigate = useNavigate();

  const hasSelectedChecks = selectedChecks.length > 0;

  return (
    <div className="flex items-center justify-center py-5">
      <div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg px-5 pt-5 pb-10 text-gray-800 dark:text-gray-50">
        <div className="w-full pt-8 text-center pb-5 -mt-16 mx-auto">
          <img
            alt="profil"
            src={TrentoLogo}
            className="mx-auto object-cover h-20 w-20 "
          />
        </div>
        <div className="w-full mb-10">
          <p className="ttext-gray-600 dark:text-gray-100 text-center px-5">
            {!hasSelectedChecks &&
              'It looks like you have not configured any checks for the current cluster. Select your desired checks to be executed.'}
            {hasSelectedChecks &&
              'It looks like there is no recent execution for current cluster. Run your Check selection now!'}
          </p>
        </div>
        <div className="w-full text-center">
          {!hasSelectedChecks && (
            <Button
              className="bg-waterhole-blue mx-auto px-2 py-2 w-1/4 xs:w-full"
              onClick={() => {
                navigate(`/clusters/${clusterId}/settings`);
              }}
            >
              <EOS_SETTINGS className="inline-block fill-white mr-1" />
              Select Checks now!
            </Button>
          )}
          {hasSelectedChecks && (
            <TriggerChecksExecutionRequest
              cssClasses="rounded relative w-1/4 ml-0.5 bg-waterhole-blue mx-auto px-2 py-2 w-1/4 xs:w-full text-base"
              clusterId={clusterId}
            >
              <EOS_PLAY_CIRCLE className="inline-block fill-white" /> Start
              Execution now
            </TriggerChecksExecutionRequest>
          )}
        </div>
      </div>
    </div>
  );
};
