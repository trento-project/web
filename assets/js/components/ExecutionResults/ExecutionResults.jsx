import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getHostID } from '@state/selectors/cluster';
import Accordion from '@components/Accordion';
import HealthIcon from '@components/Health';
import Modal from '@components/Modal';
import PremiumPill from '@components/PremiumPill';
import Table from '@components/Table';
import LoadingBox from '@components/LoadingBox';
import {
  getCatalogCategoryList,
  getCheckResults,
  getCheckDescription,
  getCheckRemediation,
  getCheckExpectations,
  getCheckGroup,
  isPremium,
} from './checksUtils';

import ResultsContainer from './ResultsContainer';
import CheckResultOutline from './CheckResultOutline';
import ExecutionHeader from './ExecutionHeader';
import ExecutionContainer from './ExecutionContainer';

const resultsTableConfig = {
  usePadding: false,
  rowClassName: 'tn-check-result-row',
  columns: [
    {
      title: 'Id',
      key: 'checkID',
      fontSize: 'text-base',
      className: 'bg-gray-50 border-b w-1/6 h-auto',
      render: (checkID, { onClick, premium }) => (
        <div className="flex whitespace-nowrap text-jungle-green-500 justify-between">
          <span
            className="inline-flex leading-5"
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {checkID}
          </span>
          {premium && <PremiumPill className="ml-1" />}
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      fontSize: 'text-base',
      className: 'bg-gray-50 border-b h-auto',
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
      className: 'bg-gray-50 border-b w-1/6 h-auto',
      render: (_, { result }) => <HealthIcon health={result} />,
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

  const onContentRefresh = () => {
    if (catalogError) {
      onCatalogRefresh();
    }
    if (executionError) {
      onLastExecutionUpdate();
    }
  };

  if (catalogLoading) {
    return <LoadingBox text="Loading checks catalog" />;
  }

  const checksResults = getCheckResults(executionData);
  const catalogCategoryList = getCatalogCategoryList(catalog, checksResults);
  const tableData = checksResults
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
        category: getCheckGroup(catalog, checkID),
        executionState: executionData?.status,
        description: getCheckDescription(catalog, checkID),
        expectations: getCheckExpectations(catalog, checkID),
        premium: isPremium(catalog, checkID),
        expectationResults,
        agentsCheckResults,
        onClick: () => {
          setModalOpen(true);
          setSelectedCheck(checkID);
        },
      })
    );
  const filterAndSortData = (data, item) =>
    data
      .filter((obj) => obj.category === item)
      .sort((a, b) => a.description.localeCompare(b.description));

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
        {catalogCategoryList.map((item) => (
          <Accordion
            defaultOpen
            className="check-group mb-4"
            header={item}
            key={item}
          >
            <Table
              config={resultsTableConfig}
              data={filterAndSortData(tableData, item)}
              withPadding={false}
            />
          </Accordion>
        ))}
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
