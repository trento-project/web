import React, { useState } from 'react';
import Table from '@components/Table';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from '@components/Modal';

import { getHostID } from '@state/selectors/cluster';
import {
  getCheckResults,
  getCheckDescription,
  getCheckRemediation,
  getCheckExpectations,
  checkIsPremium,
} from './checksUtils';

import ResultsContainer from './ResultsContainer';
import { ExecutionIcon } from './ExecutionIcon';
import CheckResultOutline from './CheckResultOutline';
import ExecutionHeader from './ExecutionHeader';
import ExecutionContainer from './ExecutionContainer';
import PremiumPill from '@components/PremiumPill';

const addHostnameToTargets = (targets, clusterHosts) =>
  targets?.map((target) => {
    const { agent_id } = target;

    const { hostname } = clusterHosts.find(({ id }) => agent_id === id);
    return {
      ...target,
      hostname,
    };
  });

function ExecutionResults({
  clusterID,
  clusterName,
  clusterScenario,
  cloudProvider,
  clusterHosts = [],
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

  const resultsTableConfig = {
    usePadding: false,
    columns: [
      {
        title: 'Id',
        key: 'checkID',
        fontSize: 'text-base',
        className: 'bg-gray-50 border-b',
        render: (checkID, { onClick }) => (
          <div className="flex space-x-2 items-center whitespace-nowrap text-jungle-green-500">
            <span
              className="inline-block"
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {checkID}
              {checkIsPremium(catalog, checkID) ? (
                <PremiumPill className="ml-1" />
              ) : (
                ' '
              )}
            </span>
          </div>
        ),
      },
      {
        title: 'Description',
        key: 'description',
        fontSize: 'text-base',
        className: 'bg-gray-50 border-b',
        render: (description) => (
          <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        ),
      },
      {
        title: 'Result',
        key: 'result',
        fontSize: 'text-base',
        className: 'bg-gray-50 border-b',
        render: (_, { result, executionState }) => (
          <ExecutionIcon executionState={executionState} health={result} />
        ),
      },
    ],
    collapsibleDetailRenderer: ({
      clusterID,
      checkID,
      expectations,
      agentsCheckResults,
      expectationResults,
      clusterName,
    }) => (
      <CheckResultOutline
        clusterID={clusterID}
        checkID={checkID}
        expectations={expectations}
        agentsCheckResults={agentsCheckResults}
        expectationResults={expectationResults}
        clusterName={clusterName}
      />
    ),
  };

  const onContentRefresh = () => {
    if (catalogError) {
      onCatalogRefresh();
    }
    if (executionError) {
      onLastExecutionUpdate();
    }
  };
  console.log('Catalog: ', catalog);
  console.log('get chech results', getCheckResults(executionData));
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
        clusterID,
        checkID,
        result,
        clusterName,
        executionState: executionData?.status,
        description: getCheckDescription(catalog, checkID),
        expectations: getCheckExpectations(catalog, checkID),
        premium: checkIsPremium(catalog, checkID),
        expectationResults,
        agentsCheckResults: addHostnameToTargets(
          agentsCheckResults,
          clusterHosts
        ),
        onClick: () => {
          setModalOpen(true);
          setSelectedCheck(checkID);
        },
      })
    );
  console.log('Table data from execution results', tableData);
  return (
    <ExecutionContainer
      catalogLoading={catalogLoading}
      executionLoading={executionLoading}
      executionStarted={executionStarted}
      executionRunning={executionRunning}
    >
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
        hosts={clusterHosts.map(getHostID)}
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
    </ExecutionContainer>
  );
}

export default ExecutionResults;
