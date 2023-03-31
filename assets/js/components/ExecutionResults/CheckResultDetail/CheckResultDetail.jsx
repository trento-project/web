import React from 'react';

import {
  getAgentCheckResultByAgentID,
  getExpectSameStatementsResults,
  getExpectStatements,
  getClusterCheckResults,
  isAgentCheckError,
  isTargetHost,
  getExpectSameFacts,
} from '../checksUtils';
import ExpectationsResults from './ExpectationsResults';
import ExpectedValues from './ExpectedValues';
import GatheredFacts from './GatheredFacts';

const getExpectStatementsResults = (expectationEvaluations) =>
  getExpectStatements(expectationEvaluations);

function CheckResultDetail({
  checkID,
  expectations,
  targetID,
  targetType,
  executionData,
}) {
  const targetHost = isTargetHost(targetType);

  const targetResult = targetHost
    ? getAgentCheckResultByAgentID(executionData, checkID, targetID)
    : getClusterCheckResults(executionData, checkID);

  const {
    expectation_results = [],
    agents_check_results = [],
    expectation_evaluations = [],
    values = [],
    facts = [],
    message,
  } = targetResult;

  const isError = isAgentCheckError(targetResult);

  const targetExpectationsResults = targetHost
    ? getExpectStatementsResults(expectation_evaluations)
    : getExpectSameStatementsResults(expectations, expectation_results);

  const gatheredFacts = targetHost
    ? facts
    : getExpectSameFacts(expectations, agents_check_results);

  return (
    <>
      <ExpectationsResults
        isTargetHost={targetHost}
        results={targetExpectationsResults}
        isError={isError}
        errorMessage={message}
      />
      {targetHost && (
        <ExpectedValues isError={isError} expectedValues={values} />
      )}
      <GatheredFacts
        isTargetHost={targetHost}
        gatheredFacts={gatheredFacts || []}
      />
    </>
  );
}

export default CheckResultDetail;
