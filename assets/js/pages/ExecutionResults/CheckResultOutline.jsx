import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import TargetResult from './TargetResult';
import {
  getHostExpectationStatements,
  isAgentCheckError,
  getHostExpectationStatementsMet,
  isTargetCluster,
  getExpectSameStatementsResults,
} from './checksUtils';

const extractExpectResults = (expectations, agentsCheckResults) => {
  const expectStatementsCount =
    getHostExpectationStatements(expectations).length;

  if (expectStatementsCount === 0) {
    return [];
  }

  return agentsCheckResults.map((agentCheckResult) => {
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
            }) => (
              <TargetResult
                key={`${checkID}-${resultTargetName}-${expectationName}`}
                targetType={resultTargetType}
                targetName={resultTargetName}
                expectationsSummary={expectationsSummary}
                isAgentCheckError={agentCheckError}
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
