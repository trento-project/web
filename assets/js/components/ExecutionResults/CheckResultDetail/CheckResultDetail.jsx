import React from 'react';

import {
  getAgentCheckResultByAgentID,
  getExpectStatements,
  isAgentCheckError,
  isTargetHost,
} from '../checksUtils';
import ExpectationsResults from './ExpectationsResults';
import ExpectedValues from './ExpectedValues';
import GatheredFacts from './GatheredFacts';

function CheckResultDetail({ checkID, targetID, targetType, executionData }) {
  const targetHost = isTargetHost(targetType);

  const checkResult = getAgentCheckResultByAgentID(
    executionData,
    checkID,
    targetID
  );

  const {
    expectation_evaluations = [],
    values = [],
    facts = [],
    message,
  } = checkResult;

  const isError = isAgentCheckError(checkResult);

  const expectStatementsEvaluations = getExpectStatements(
    expectation_evaluations
  );

  return targetHost ? (
    <>
      <ExpectationsResults
        isError={isError}
        results={expectStatementsEvaluations}
        errorMessage={message}
      />
      <ExpectedValues isError={isError} expectedValues={values} />
      <GatheredFacts gatheredFacts={facts || []} />
    </>
  ) : (
    <div>Cluster wide check</div>
  );
}

export default CheckResultDetail;
