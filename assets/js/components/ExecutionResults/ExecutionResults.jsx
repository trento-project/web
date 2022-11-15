import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { logError } from '@lib/log';
import { getExecutionResult, getCatalog } from '@lib/api/wanda';

import Modal from '@components/Modal';
import BackButton from '@components/BackButton';
import WarningBanner from '@components/Banners/WarningBanner';
import LoadingBox from '@components/LoadingBox';
import {
  ResultsContainer,
  HostResultsWrapper,
  CheckResult,
  getHosts,
  getChecks,
  getHealth,
  getCheckResults,
} from '@components/ChecksResults';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';

const truncatedClusterNameClasses =
  'font-bold truncate w-60 inline-block align-top';

const ExecutionResults = ({
  clusterID,
  executionID,
  clusterName,
  cloudProvider,
  hostnames = [],
  onExecutionFetch = getExecutionResult,
  onCatalogFetch = getCatalog,
  onCatalogRefresh = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [executionData, setExecutionData] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([onExecutionFetch(executionID), onCatalogFetch()])
      .then(
        ([{ data: fetchedExecutionData }, { data: fetchedCatalogData }]) => {
          setLoading(false);
          setExecutionData(fetchedExecutionData);
          setCatalog(fetchedCatalogData.items);
        }
      )
      .catch((error) => {
        setLoading(false);
        logError(error);
      });
  }, [onExecutionFetch, onCatalogFetch, setExecutionData, setCatalog]);

  if (loading) {
    return <LoadingBox text="Loading checks execution..." />;
  }

  if (executionData?.status === 'running') {
    return <LoadingBox text="Check execution currently running..." />;
  }

  const checkResults = getCheckResults(executionData);
  const hosts = getHosts(checkResults);
  const checks = getChecks(checkResults);

  return (
    <div>
      <Modal
        title={catalog?.find(({ id }) => id === selectedCheck)?.description}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
          {catalog?.find(({ id }) => id === selectedCheck)?.description}
        </ReactMarkdown>
      </Modal>
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <div className="flex mb-4 justify-between">
        <h1 className="text-3xl w-3/5">
          <span className="font-medium">Checks Results for cluster</span>{' '}
          <span
            className={classNames('font-bold', truncatedClusterNameClasses)}
          >
            {clusterName}
          </span>
        </h1>
      </div>
      {cloudProvider == UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      <ResultsContainer
        catalogError={false}
        clusterID={clusterID}
        hasAlreadyChecksResults
        selectedChecks={checks}
        onCatalogRefresh={onCatalogRefresh}
      >
        {hosts &&
          hosts.map((agentID, idx) => (
            <HostResultsWrapper
              key={idx}
              hostname={hostnames.find(({ id }) => agentID === id)?.hostname}
              reachable
              unreachableMessage=""
            >
              {checks.map((checkID) => {
                const { health } = getHealth(checkResults, checkID, agentID);

                return (
                  <CheckResult
                    key={checkID}
                    checkId={checkID}
                    description={
                      catalog.find(({ id }) => id === checkID)?.description
                    }
                    executionState={executionData?.status}
                    health={health}
                    onClick={() => {
                      setModalOpen(true);
                      setSelectedCheck(checkID);
                    }}
                  />
                );
              })}
            </HostResultsWrapper>
          ))}
      </ResultsContainer>
    </div>
  );
};

export default ExecutionResults;
