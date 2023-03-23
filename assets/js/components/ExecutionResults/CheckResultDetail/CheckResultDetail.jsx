import React from 'react';

import ListView from '@components/ListView';
import ObjectTree from '@components/ObjectTree/ObjectTree';
import classNames from 'classnames';
import {
  getCheckResultByAgentID,
  getExpectStatements,
  isAgentCheckError,
  isTargetHost,
} from '../checksUtils';

function ExpectationsResults({
  isCheckError,
  errorMessage,
  expectationEvaluations,
}) {
  const expectStatementsResults = getExpectStatements(expectationEvaluations);

  const expectationsResults = expectStatementsResults.map(
    ({ name, return_value }) => ({
      title: name,
      content: return_value,
      render: (returnValue) => (
        <span
          className={classNames({
            'text-red-500': !returnValue,
          })}
        >
          {returnValue ? 'Passing' : 'Failing'}
        </span>
      ),
    })
  );

  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Expectations</div>
      {isCheckError ? (
        <div className="mt-3 text-red-500">{errorMessage}</div>
      ) : (
        <ListView
          className="mt-3"
          titleClassName="text-sm"
          orientation="horizontal"
          data={expectationsResults}
        />
      )}
    </div>
  );
}

function ExpectedValues({ isCheckError = false, expectedValues = [] }) {
  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Values</div>
      {isCheckError ? (
        <div className="mt-3 text-red-500">Expected Values unavailable</div>
      ) : (
        <ListView
          className="mt-3"
          titleClassName="text-sm"
          orientation="horizontal"
          data={expectedValues.map(({ name, value }) => ({
            title: name,
            content: value,
          }))}
        />
      )}
    </div>
  );
}
function GatheredFacts({ gatheredFacts = [] }) {
  const facts = gatheredFacts.map(({ name, value, type, message }) => {
    const isFactError = !!type;

    return {
      title: name,
      content: value,
      render: (factValue) =>
        isFactError ? (
          <span className="text-red-500">{message}</span>
        ) : (
          <ObjectTree className="mt-3" data={factValue || {}} />
        ),
    };
  });

  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Facts</div>

      {facts.length === 0 ? (
        <div className="mt-3 text-red-500">No facts were gathered</div>
      ) : (
        <ListView
          className="grid-flow-row mt-3"
          titleClassName="text-sm"
          orientation="horizontal"
          data={facts}
        />
      )}
    </div>
  );
}

function CheckResultDetail({ checkID, targetID, targetType, executionData }) {
  const targetHost = isTargetHost(targetType);

  const checkResult = getCheckResultByAgentID(executionData, checkID, targetID);

  const {
    isCheckError = isAgentCheckError(checkResult),
    expectation_evaluations = [],
    values = [],
    facts = [],
    message,
  } = checkResult;

  return targetHost ? (
    <>
      <ExpectationsResults
        isCheckError={isCheckError}
        expectationEvaluations={expectation_evaluations}
        errorMessage={message}
      />
      <ExpectedValues isCheckError={isCheckError} expectedValues={values} />
      <GatheredFacts gatheredFacts={facts || []} />
    </>
  ) : (
    <div>Cluster wide check</div>
  );
}

export default CheckResultDetail;
