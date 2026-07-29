// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useNavigate } from 'react-router';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import TargetResult from './TargetResult';
import {
  getHostExpectationStatements,
  isAgentCheckError,
  isAgentExcluded,
  getHostExpectationStatementsMet,
  isTargetCluster,
  getExpectSameStatementsResults,
} from './checksUtils';

const extractExpectResults = (expectations, agentsCheckResults) => {
  const expectStatementsCount =
    getHostExpectationStatements(expectations).length;

  // Hosts excluded by the check's `exclude` predicate are never evaluated;
  // surface them as a distinct "Excluded by policy" row regardless of how
  // many expectations the check declares.
  const excludedResults = agentsCheckResults
    .filter(isAgentExcluded)
    .map(({ hostname }) => ({
      targetType: TARGET_HOST,
      targetName: hostname,
      expectationsSummary: 'Excluded by policy',
      isExcluded: true,
    }));

  if (expectStatementsCount === 0) {
    return excludedResults;
  }

  const evaluatedResults = agentsCheckResults
    .filter((agentCheckResult) => !isAgentExcluded(agentCheckResult))
    .map((agentCheckResult) => {
      const {
        hostname,
        expectation_evaluations = [],
        message,
      } = agentCheckResult;
      const isCheckError = isAgentCheckError(agentCheckResult);
      const metExpectations = getHostExpectationStatementsMet(
        expectation_evaluations
      );
      const expectationsSummary = isCheckError
        ? message
        : `${metExpectations}/${expectStatementsCount} Expectations met.`;

      return {
        targetType: TARGET_HOST,
        targetName: hostname,
        expectationsSummary,
        isAgentCheckError:
          isCheckError || metExpectations < expectStatementsCount,
      };
    });

  return [...excludedResults, ...evaluatedResults];
};

const extractExpectSameResults = (
  targetName,
  expectations,
  expectationResults
) =>
  getExpectSameStatementsResults(expectations, expectationResults).map(
    ({ name, result }) => ({
      targetType: TARGET_CLUSTER,
      targetName,
      expectationName: name,
      expectationsSummary: result
        ? `Value \`${name}\` is the same on all targets`
        : `Value \`${name}\` is not the same on all targets`,
      isAgentCheckError: !result,
    })
  );

const getTargetCheckDetailURL = (
  targetID,
  targetType,
  targetName,
  checkID,
  resultTargetType,
  resultTargetName
) => {
  switch (targetType) {
    case TARGET_CLUSTER:
      return `/clusters/${targetID}/executions/last/${checkID}/${resultTargetType}/${resultTargetName}`;
    case TARGET_HOST:
      return `/hosts/${targetID}/executions/last/${checkID}/host/${targetName}`;
    default:
      return null;
  }
};

function CheckResultOutline({
  checkID,
  targetID,
  targetName,
  targetType,
  expectations,
  agentsCheckResults,
  expectationResults,
}) {
  const navigate = useNavigate();

  const expectResults = extractExpectResults(expectations, agentsCheckResults);

  const expectSameResults = isTargetCluster(targetType)
    ? extractExpectSameResults(targetName, expectations, expectationResults)
    : [];

  return (
    <div className="p-5 bg-gray-50">
      <div className="table w-full bg-white rounded shadow">
        <div className="table-header-group bg-gray-50 border-b border-gray">
          <div className="table-row">
            <div className="table-cell w-1/5 p-2 text-left text-xs font-medium text-gray-500 uppercase">
              Target
            </div>
            <div className="table-cell p-2 text-left text-xs font-medium text-gray-500 uppercase">
              Expectations
            </div>
          </div>
        </div>
        <div className="table-row-group text-sm">
          {[...expectSameResults, ...expectResults].map(
            ({
              targetType: resultTargetType,
              targetName: resultTargetName,
              expectationName,
              expectationsSummary,
              isAgentCheckError: agentCheckError,
              isExcluded,
            }) => (
              <TargetResult
                key={`${checkID}-${resultTargetName}-${expectationName}`}
                targetType={resultTargetType}
                targetName={resultTargetName}
                expectationsSummary={expectationsSummary}
                isAgentCheckError={agentCheckError}
                isExcluded={isExcluded}
                onClick={() => {
                  const targetCheckDetailURL = getTargetCheckDetailURL(
                    targetID,
                    targetType,
                    targetName,
                    checkID,
                    resultTargetType,
                    resultTargetName
                  );
                  targetCheckDetailURL && navigate(targetCheckDetailURL);
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckResultOutline;
