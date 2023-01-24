import React, { useState } from 'react';

import classNames from 'classnames';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EOS_ERROR } from 'eos-icons-react';
import Modal from '@components/Modal';
import BackButton from '@components/BackButton';
import WarningBanner from '@components/Banners/WarningBanner';
import LoadingBox from '@components/LoadingBox';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';
import { ClusterInfoBox } from '@components/ClusterDetails';
import NotificationBox from '@components/NotificationBox';

import {
  getCheckHealthByAgent,
  getCheckResults,
  getCheckDescription,
  getCheckRemediation,
} from './checksUtils';

import CheckResult from './CheckResult';
import ChecksResultFilters from './ChecksResultFilters';
import ResultsContainer from './ResultsContainer';
import HostResultsWrapper from './HostResultsWrapper';

const truncatedClusterNameClasses =
  'font-bold truncate w-60 inline-block align-top';

const getLabel = (status, health, error, expectations, failedExpectations) => {
  if (status === 'running' || !health) {
    return '';
  }

  if (error) {
    return error;
  }

  if (health === 'passing') {
    return `${expectations}/${expectations} expectations passed`;
  }

  return `${failedExpectations}/${expectations} expectations failed`;
};

function MarkdownContent({ children }) {
  return (
    <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
      {children}
    </ReactMarkdown>
  );
}

function ExecutionResults({
  clusterID,
  clusterName,
  clusterScenario,
  cloudProvider,
  hostnames = [],
  catalogLoading,
  catalog,
  catalogError,
  executionLoading,
  executionData,
  executionError,
  clusterSelectedChecks = [],
  onCatalogRefresh = () => {},
  onLastExecutionUpdate = () => {},
  onStartExecution = () => {},
}) {
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [predicates, setPredicates] = useState([]);
  const hosts = hostnames.map((item) => item.id);

  if (catalogLoading) {
    return <LoadingBox text="Loading checks execution..." />;
  }

  if(executionLoading) {
    return <LoadingBox text="Checks execution starting..." />;
  }

  if (catalogError || executionError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={
          catalogError && executionError
            ? `${catalogError}\n${executionError}`
            : catalogError || executionError
        }
        buttonText="Try again"
        buttonOnClick={() => {
          if (catalogError) {
            onCatalogRefresh();
          }
          if (executionError) {
            onLastExecutionUpdate();
          }
        }}
      />
    );
  }
  const checkResults = getCheckResults(executionData);
  return (
    <div>
      <Modal
        title={
          <MarkdownContent>
            {getCheckDescription(catalog, selectedCheck)}
          </MarkdownContent>
        }
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <MarkdownContent>
          {getCheckRemediation(catalog, selectedCheck)}
        </MarkdownContent>
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
        <ChecksResultFilters
          onChange={(newPredicates) => setPredicates(newPredicates)}
        />
      </div>
      {cloudProvider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following results are valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      <ClusterInfoBox haScenario={clusterScenario} provider={cloudProvider} />
      <ResultsContainer
        catalogError={false}
        clusterID={clusterID}
        hasAlreadyChecksResults={!!(executionData || executionLoading)}
        selectedChecks={clusterSelectedChecks}
        hosts={hosts}
        onCatalogRefresh={onCatalogRefresh}
        onStartExecution={onStartExecution}
      >
        {executionData?.targets.map(({ agent_id: hostID, checks }) => (
          <HostResultsWrapper
            key={hostID}
            hostname={hostnames.find(({ id }) => hostID === id)?.hostname}
          >
            {checks
              .map((checkID) => {
                const { health, error, expectations, failedExpectations } =
                  getCheckHealthByAgent(checkResults, checkID, hostID);

                return {
                  checkID,
                  error,
                  expectations,
                  failedExpectations,
                  result: health,
                };
              })
              .filter((check) => {
                if (predicates.length === 0) {
                  return true;
                }

                return predicates.some((predicate) => predicate(check));
              })
              .map(
                ({
                  checkID,
                  result,
                  error,
                  expectations,
                  failedExpectations,
                }) => {
                  const label = getLabel(
                    executionData?.status,
                    result,
                    error,
                    expectations,
                    failedExpectations
                  );
                  return (
                    <CheckResult
                      key={checkID}
                      checkId={checkID}
                      description={getCheckDescription(catalog, checkID)}
                      executionState={executionData?.status}
                      health={result}
                      label={label}
                      onClick={() => {
                        setModalOpen(true);
                        setSelectedCheck(checkID);
                      }}
                    />
                  );
                }
              )}
          </HostResultsWrapper>
        ))}
      </ResultsContainer>
    </div>
  );
}

export default ExecutionResults;
