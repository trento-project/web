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
    ? results.map(({ name, return_value }) => ({
        name,
        passing: !!return_value,
      }))
    : results.map(({ name, result }) => ({
        name,
        passing: !!result,
      }));

  const expectationsEvaluations = renderedResults.map(({ name, passing }) => ({
    title: name,
    content: passing,
    render: (isPassing) => (
      <span
        className={classNames({
          'text-red-500': !isPassing,
        })}
      >
        {isPassing ? 'Passing' : 'Failing'}
      </span>
    ),
  }));

  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Expectations</div>
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
