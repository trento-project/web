// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import {
  getAgentCheckResultByAgentID,
  getHostExpectationStatementsResults,
  getExpectSameStatementsResults,
  getClusterCheckResults,
  isAgentCheckError,
  isAgentExcluded,
  isTargetHost,
  getExpectSameFacts,
} from '../checksUtils';
import ExpectationsResults from './ExpectationsResults';
import ExpectedValues from './ExpectedValues';
import GatheredFacts from './GatheredFacts';

function ExcludedCheckResultDetail({ excludeExpression }) {
  return (
    <div className="p-4 space-y-2" data-testid="excluded-by-policy">
      <p className="text-gray-700">
        This host was <span className="font-semibold">excluded by policy</span>{' '}
        and was not evaluated for this check.
      </p>
      {excludeExpression && (
        <div>
          <p className="text-sm text-gray-500">Exclusion predicate:</p>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
            {excludeExpression}
          </pre>
        </div>
      )}
    </div>
  );
}

function CheckResultDetail({
  checkID,
  expectations = [],
  targetID,
  targetType,
  severity,
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

  if (isAgentExcluded(targetResult)) {
    return (
      <ExcludedCheckResultDetail
        excludeExpression={targetResult.exclude_expression}
      />
    );
  }

  const isError = isAgentCheckError(targetResult);

  const targetExpectationsResults = targetHost
    ? getHostExpectationStatementsResults(expectations, expectation_evaluations)
    : getExpectSameStatementsResults(expectations, expectation_results);

  const gatheredFacts = targetHost
    ? facts
    : getExpectSameFacts(expectations, agents_check_results);

  return (
    <>
      <ExpectationsResults
        isTargetHost={targetHost}
        severity={severity}
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
