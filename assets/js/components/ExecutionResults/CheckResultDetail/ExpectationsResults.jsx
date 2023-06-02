import React from 'react';

import ListView from '@components/ListView';
import classNames from 'classnames';

function ExpectationsResults({
  isTargetHost = true,
  results,
  isError = false,
  errorMessage = 'An error occurred',
}) {
  const renderedResults = isTargetHost
    ? results.map(({ name, return_value, failure_message, message }) => ({
        name,
        passing: !!return_value,
        failureMessage: failure_message,
        evaluationErrorMessage: message,
      }))
    : results.map(({ name, result, failure_message, message }) => ({
        name,
        passing: !!result,
        failureMessage: failure_message,
        evaluationErrorMessage: message,
      }));

  const expectationsEvaluations = renderedResults.map(
    ({ name, passing, failureMessage, evaluationErrorMessage }) => ({
      title: name,
      content: passing,
      render: (isPassing) => (
        <div
          className={classNames({
            'text-red-500': !isPassing,
          })}
        >
          <span>{isPassing ? 'Passing' : 'Failing'}</span>
          {failureMessage && <span className="block">{failureMessage}</span>}
          {evaluationErrorMessage && (
            <span className="block">{evaluationErrorMessage}</span>
          )}
        </div>
      ),
    })
  );

  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Evaluation Results</div>
      {isError ? (
        <div className="mt-3 text-red-500">{errorMessage}</div>
      ) : (
        <ListView
          className="mt-3 text-sm"
          titleClassName="text-sm"
          orientation="horizontal"
          data={expectationsEvaluations}
        />
      )}
    </div>
  );
}

export default ExpectationsResults;
