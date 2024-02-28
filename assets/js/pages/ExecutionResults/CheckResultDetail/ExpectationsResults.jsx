import React from 'react';
import { capitalize } from 'lodash';
import classNames from 'classnames';

import { WARNING, CRITICAL } from '@lib/model';
import ListView from '@common/ListView';

import { normalizeExpectationResult } from '../checksUtils';

function ExpectationsResults({
  isTargetHost = true,
  severity,
  results,
  isError = false,
  errorMessage = 'An error occurred',
}) {
  const renderedResults = isTargetHost
    ? results.map(({ name, return_value, failure_message, message }) => ({
        name,
        result: normalizeExpectationResult(return_value, severity),
        failureMessage: failure_message,
        evaluationErrorMessage: message,
      }))
    : results.map(({ name, result, failure_message, message }) => ({
        name,
        result: normalizeExpectationResult(result, severity),
        failureMessage: failure_message,
        evaluationErrorMessage: message,
      }));

  const expectationsEvaluations = renderedResults.map(
    ({ name, result, failureMessage, evaluationErrorMessage }) => ({
      title: name,
      content: result || CRITICAL,
      render: (content) => (
        <div
          className={classNames({
            'text-red-500': content === CRITICAL,
            'text-yellow-500': content === WARNING,
          })}
        >
          <span>{capitalize(content)}</span>
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
