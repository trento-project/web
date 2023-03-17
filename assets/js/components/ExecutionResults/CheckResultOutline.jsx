import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPECT, EXPECT_SAME, TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import TargetResult from './TargetResult';

const isExpect = ({ type }) => type === EXPECT;
const isExpectSame = ({ type }) => type === EXPECT_SAME;

const getExpectStatements = (expectationList) =>
  expectationList.filter(isExpect);

const extractExpectResults = (expectations, agentsCheckResults) => {
  const expectStatementsCount = getExpectStatements(expectations).length;

  if (expectStatementsCount === 0) {
    return [];
  }

  return agentsCheckResults.map((agentCheckResult) => {
    const { hostname, expectation_evaluations = [] } = agentCheckResult;

    const isAgentCheckError = !!agentCheckResult?.type;

    const metExpectations = getExpectStatements(expectation_evaluations).filter(
      ({ return_value }) => return_value
    ).length;

    const expectationsSummary = isAgentCheckError
      ? agentCheckResult.message
      : `${metExpectations}/${expectStatementsCount} Expectations met.`;

    return {
      targetType: TARGET_HOST,
      targetName: hostname,
      expectationsSummary,
      isAgentCheckError:
        isAgentCheckError || metExpectations < expectStatementsCount,
    };
  });
};

const getExpectSameStatements = (expectationList) =>
  expectationList.filter(isExpectSame);

const getExpectSameStatementResult = (expectationResults, name) => {
  const expectSameStatement = getExpectSameStatements(expectationResults).find(
    ({ name: resultExpectationName }) => name === resultExpectationName
  );

  if (!expectSameStatement) {
    return {};
  }

  return expectSameStatement;
};

const extractExpectSameResults = (
  targetName,
  expectations,
  expectationResults
) =>
  getExpectSameStatements(expectations).map(({ name }) => {
    const { result } = getExpectSameStatementResult(expectationResults, name);

    return {
      targetType: TARGET_CLUSTER,
      targetName,
      expectationName: name,
      expectationsSummary: result
        ? `Value \`${name}\` is the same on all targets`
        : `Value \`${name}\` is not the same on all targets`,
      isAgentCheckError: !result,
    };
  });

function CheckResultOutline({
  clusterID,
  checkID,
  expectations,
  agentsCheckResults,
  expectationResults,
  clusterName,
}) {
  const navigate = useNavigate();

  const expectResults = extractExpectResults(expectations, agentsCheckResults);

  const expectSameResults = extractExpectSameResults(
    clusterName,
    expectations,
    expectationResults
  );

  return (
    <div className="p-5">
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
              targetType,
              targetName,
              expectationName,
              expectationsSummary,
              isAgentCheckError,
            }) => (
              <TargetResult
                key={`${checkID}-${targetName}-${expectationName}`}
                isCluster={targetType === TARGET_CLUSTER}
                targetName={targetName}
                expectationsSummary={expectationsSummary}
                isAgentCheckError={isAgentCheckError}
                onClick={() =>
                  navigate(
                    `/clusters/${clusterID}/executions/last/${checkID}/${targetType}/${targetName}`
                  )
                }
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckResultOutline;
