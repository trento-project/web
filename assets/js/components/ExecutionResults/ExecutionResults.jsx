import React, { useState } from 'react';
import Table from '@components/Table';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingBox from '@components/LoadingBox';
import Modal from '@components/Modal';

import {
  getCheckResults,
  getCheckDescription,
  getCheckRemediation,
} from './checksUtils';

import ResultsContainer from './ResultsContainer';
import { ExecutionIcon } from './ExecutionIcon';
import CheckResultOutline from './CheckResultOutline';
import ExecutionHeader from './ExecutionHeader';

const addHostnameToTargets = (targets, hostnames) =>
  targets?.map((target) => {
    const { agent_id } = target;

    const { hostname } = hostnames.find(({ id }) => agent_id === id);
    return {
      ...target,
      hostname,
    };
  });

const resultsTableConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Id',
      key: 'checkID',
      render: (checkID, { onClick }) => (
        <div className="whitespace-nowrap text-jungle-green-500">
          <span
            className="inline-block"
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {checkID}
          </span>
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (description) => (
        <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
          {description}
        </ReactMarkdown>
      ),
    },
    {
      title: 'Result',
      key: 'result',
      render: (_, { result, executionState }) => (
        <ExecutionIcon executionState={executionState} health={result} />
      ),
    },
  ],
  collapsibleDetailRenderer: ({
    checkID,
    agentsCheckResults,
    expectationResults,
    clusterName,
  }) => (
    <CheckResultOutline
      checkID={checkID}
      agentsCheckResults={agentsCheckResults}
      expectationResults={expectationResults}
      clusterName={clusterName}
    />
  ),
};

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
  executionStarted,
  executionRunning,
  executionData,
  executionError,
  clusterSelectedChecks = [],
  onCatalogRefresh = () => {},
  onLastExecutionUpdate = () => {},
  onStartExecution = () => {},
}) {
  const [predicates, setPredicates] = useState([]);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const hosts = hostnames.map((item) => item.id);

  if (catalogLoading || executionLoading) {
    return <LoadingBox text="Loading checks execution..." />;
  }

  if (!executionStarted) {
    return <LoadingBox text="Checks execution starting..." />;
  }

  if (executionRunning) {
    return <LoadingBox text="Checks execution running..." />;
  }

  const onContentRefresh = () => {
    if (catalogError) {
      onCatalogRefresh();
    }
    if (executionError) {
      onLastExecutionUpdate();
    }
  };

  const tableData = getCheckResults(executionData)
    .filter((check) => {
      if (predicates.length === 0) {
        return true;
      }

      return predicates.some((predicate) => predicate(check));
    })
    .map(
      ({
        check_id: checkID,
        result,
        expectation_results: expectationResults,
        agents_check_results: agentsCheckResults,
      }) => ({
        checkID,
        result,
        clusterName,
        executionState: executionData?.status,
        description: getCheckDescription(catalog, checkID),
        expectationResults,
        agentsCheckResults: addHostnameToTargets(agentsCheckResults, hostnames),
        onClick: () => {
          setModalOpen(true);
          setSelectedCheck(checkID);
        },
      })
    );

  return (
    <>
      <ExecutionHeader
        clusterID={clusterID}
        clusterName={clusterName}
        cloudProvider={cloudProvider}
        clusterScenario={clusterScenario}
        onFilterChange={(newPredicates) => setPredicates(newPredicates)}
      />
      <ResultsContainer
        error={catalogError || executionError}
        errorContent={[
          catalogError ? `Failed loading catalog: ${catalogError}` : null,
          executionError ? `Failed loading execution: ${executionError}` : null,
        ]}
        clusterID={clusterID}
        hasAlreadyChecksResults={!!(executionData || executionLoading)}
        selectedChecks={clusterSelectedChecks}
        hosts={hosts}
        onContentRefresh={onContentRefresh}
        onStartExecution={onStartExecution}
      >
        <Table config={resultsTableConfig} data={tableData} />
      </ResultsContainer>
      <Modal
        open={modalOpen}
        title={
          <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
            {getCheckDescription(catalog, selectedCheck)}
          </ReactMarkdown>
        }
        onClose={() => setModalOpen(false)}
      >
        <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
          {getCheckRemediation(catalog, selectedCheck)}
        </ReactMarkdown>
      </Modal>
    </>
  );
}

export default ExecutionResults;
