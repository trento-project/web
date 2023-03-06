import React, { useState } from 'react';
import Table from '@components/Table';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EOS_ERROR } from 'eos-icons-react';

import LoadingBox from '@components/LoadingBox';
import NotificationBox from '@components/NotificationBox';

import { getCheckResults, getCheckDescription } from './checksUtils';

import ResultsContainer from './ResultsContainer';
import { ExecutionIcon } from './ExecutionIcon';
import CheckResultOutline from './CheckResultOutline';
import ExecutionHeader from './ExecutionHeader';

const resultsTableConfig = {
  usePadding: false,
  columns: [
    {
      title: 'Id',
      key: 'checkID',
      render: (checkID) => (
        <div className="whitespace-nowrap text-jungle-green-500">{checkID}</div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (description) => <MarkdownContent>{description}</MarkdownContent>,
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

const addHostnameToTargets = (targets, hostnames) =>
  targets?.map((target) => {
    const { agent_id } = target;

    const { hostname } = hostnames.find(({ id }) => agent_id === id);
    return {
      ...target,
      hostname,
    };
  });

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
  executionStarted,
  executionData,
  executionError,
  clusterSelectedChecks = [],
  onCatalogRefresh = () => {},
  onLastExecutionUpdate = () => {},
  onStartExecution = () => {},
}) {
  const [predicates, setPredicates] = useState([]);

  const hosts = hostnames.map((item) => item.id);

  if (catalogLoading) {
    return <LoadingBox text="Loading checks execution..." />;
  }

  if (!executionStarted) {
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
        catalogError={false}
        clusterID={clusterID}
        hasAlreadyChecksResults={!!(executionData || executionLoading)}
        selectedChecks={clusterSelectedChecks}
        hosts={hosts}
        onCatalogRefresh={onCatalogRefresh}
        onStartExecution={onStartExecution}
      >
        <Table config={resultsTableConfig} data={tableData} />
      </ResultsContainer>
    </>
  );
}

export default ExecutionResults;
