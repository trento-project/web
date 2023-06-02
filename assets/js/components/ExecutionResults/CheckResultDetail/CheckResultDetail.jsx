import React from 'react';

import {
  getAgentCheckResultByAgentID,
  getExpectStatementsResults,
  getExpectSameStatementsResults,
  getClusterCheckResults,
  isAgentCheckError,
  isTargetHost,
  getExpectSameFacts,
} from '../checksUtils';
import ExpectationsResults from './ExpectationsResults';
import ExpectedValues from './ExpectedValues';
import GatheredFacts from './GatheredFacts';

function CheckResultDetail({
  checkID,
  expectations = [],
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
    ? getExpectStatementsResults(expectations, expectation_evaluations)
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
      <ExpectedValues
        isTargetHost={targetHost}
        isError={isError}
        expectedValues={values}
      />
      <GatheredFacts
        isTargetHost={targetHost}
        gatheredFacts={gatheredFacts || []}
      />
    </>
  );
}

export default CheckResultDetail;
