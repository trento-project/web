import React, { useState } from 'react';
import { getHostID } from '@state/selectors/host';
import Markdown from '@common/Markdown';
import Accordion from '@common/Accordion';
import HealthIcon from '@common/HealthIcon';
import Modal from '@common/Modal';
import Table from '@common/Table';
import ModifiedCheckPill from '@common/ModifiedCheckPill';

import {
  getCatalogCategoryList,
  getCheckResults,
  getCheckDescription,
  getCheckRemediation,
  getCheckExpectations,
  getCheckGroup,
} from './checksUtils';

import ResultsContainer from './ResultsContainer';
import CheckResultOutline from './CheckResultOutline';
import ExecutionHeader from './ExecutionHeader';
import ExecutionContainer from './ExecutionContainer';

// To have an array as a default prop that is also used in a useEffect's dependency
// array we need to declare it outside the scope as a `const`, in order to prevent
// rerendering loops.
//
// https://github.com/facebook/react/issues/18123
const defaultSavedFilters = [];

const resultsTableConfig = {
  usePadding: false,
  headerClassName: 'bg-gray-50 border-b h-auto',
  rowClassName: 'tn-check-result-row',
  columns: [
    {
      title: 'Id',
      key: 'checkID',
      fontSize: 'text-base',
      className: 'w-1/6',
      render: (checkID, { customized, onClick }) => (
        <div className="flex whitespace-nowrap text-jungle-green-500 justify-between">
          <span
            className="inline-flex leading-5 cursor-pointer"
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {checkID}
          </span>
          <ModifiedCheckPill customized={customized} />
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      fontSize: 'text-base',
      render: (description) => <Markdown>{description}</Markdown>,
    },
    {
      title: 'Result',
      key: 'result',
      fontSize: 'text-base',
      className: 'w-1/6',
      render: (_, { result }) => <HealthIcon health={result} />,
    },
  ],
  collapsibleDetailRenderer: ({
    targetID,
    targetName,
    targetType,
    checkID,
    expectations,
    agentsCheckResults,
    expectationResults,
  }) => (
    <CheckResultOutline
      targetID={targetID}
      targetName={targetName}
      targetType={targetType}
      checkID={checkID}
      expectations={expectations}
      agentsCheckResults={agentsCheckResults}
      expectationResults={expectationResults}
    />
  ),
};

function ExecutionResults({
  targetID,
  targetName,
  targetType,
  target,
  targetHosts = [],
  catalogLoading,
  catalog,
  catalogError,
  executionLoading,
  executionStarted,
  executionRunning,
  executionData,
  executionError,
  targetSelectedChecks = [],
  savedFilters = defaultSavedFilters,
  onCatalogRefresh = () => {},
  onLastExecutionUpdate = () => {},
  onStartExecution = () => {},
  onSaveFilters = () => {},
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
        customized,
        expectation_results: expectationResults,
        agents_check_results: agentsCheckResults,
      }) => ({
        checkID,
        customized,
        targetID,
        targetName,
        targetType,
        result,
        category: getCheckGroup(catalog, checkID),
        executionState: executionData?.status,
        description: getCheckDescription(catalog, checkID),
        expectations: getCheckExpectations(catalog, checkID),
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
        targetID={targetID}
        targetName={targetName}
        targetType={targetType}
        target={target}
        savedFilters={savedFilters}
        onFilterChange={(newPredicates) => setPredicates(newPredicates)}
        onFilterSave={onSaveFilters}
      />
      <ResultsContainer
        error={catalogError || executionError}
        errorContent={[
          catalogError ? `Failed loading catalog: ${catalogError}` : null,
          executionError ? `Failed loading execution: ${executionError}` : null,
        ]}
        targetID={targetID}
        targetType={targetType}
        hasAlreadyChecksResults={!!(executionData || executionLoading)}
        selectedChecks={targetSelectedChecks}
        hosts={targetHosts.map(getHostID)}
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
              roundedTop={false}
            />
          </Accordion>
        ))}
      </ResultsContainer>
      <Modal
        open={modalOpen}
        title={
          <Markdown>{getCheckDescription(catalog, selectedCheck)}</Markdown>
        }
        onClose={() => setModalOpen(false)}
      >
        <Markdown>{getCheckRemediation(catalog, selectedCheck)}</Markdown>
      </Modal>
    </ExecutionContainer>
  );
}
export default ExecutionResults;
