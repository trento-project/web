import React from 'react';
import { EXPECT, EXPECT_SAME } from '@lib/model';
import TargetResult from './TargetResult';

const TARGET_NODE = 'TARGET_NODE';
const TARGET_CLUSTER = 'TARGET_CLUSTER';

const isExpect = ({ type }) => type === EXPECT;
const isExpectSame = ({ type }) => type === EXPECT_SAME;

function CheckResultOutline({
  checkID,
  agentsCheckResults,
  expectationResults,
  clusterName,
}) {
  const expectExpectationsCount = expectationResults.filter(isExpect).length;
  const expectResults = agentsCheckResults.map((agentCheckResult) => {
    const { hostname, expectation_evaluations } = agentCheckResult;

    const isAgentCheckError = !!agentCheckResult?.type;

    const metExpectations = expectation_evaluations
      ?.filter(isExpect)
      .filter(({ return_value }) => return_value).length;

    const expectationsSummary = isAgentCheckError
      ? agentCheckResult.message
      : `${metExpectations}/${expectExpectationsCount} Expectations met.`;

    return {
      target: TARGET_NODE,
      targetName: hostname,
      expectationsSummary,
      isAgentCheckError:
        isAgentCheckError || metExpectations < expectExpectationsCount,
    };
  });

  const expectSameResults = expectationResults
    .filter(isExpectSame)
    .map(({ result }) => ({
      target: TARGET_CLUSTER,
      targetName: clusterName,
      expectationsSummary: result
        ? 'Value is the same on all targets'
        : 'Value is not the same on all targets',
      isAgentCheckError: !result,
    }));

  return (
    <div className="p-5">
      <div className="table w-full bg-white rounded shadow">
        <div className="table-header-group bg-gray-100">
          <div className="table-row">
            <div className="table-cell w-1/5 p-2 text-left text-xs font-medium text-gray-500 uppercase">
              Target
            </div>
            <div className="table-cell p-2 text-left text-xs font-medium text-gray-500 uppercase">
              Expectations
            </div>
          </div>
        </div>
        <div className="table-row-group">
          {[...expectSameResults, ...expectResults].map(
            ({
              target,
              targetName,
              expectationsSummary,
              isAgentCheckError,
            }) => (
              <TargetResult
                key={`${checkID}-${targetName}`}
                isCluster={target === TARGET_CLUSTER}
                targetName={targetName}
                expectationsSummary={expectationsSummary}
                isAgentCheckError={isAgentCheckError}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckResultOutline;
