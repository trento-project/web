import React from 'react';

import ListView from '@components/ListView';
import classNames from 'classnames';

const mapExpectResult = ({ name, return_value }) => ({
  name,
  passing: !!return_value,
});

const mapExpectSameResults = ({ name, result }) => ({
  name,
  passing: !!result,
});

function ExpectationsResults({
  isTargetHost = true,
  results,
  isError = false,
  errorMessage = 'An error occurred',
}) {
  const mappedResults = isTargetHost
    ? results.map(mapExpectResult)
    : results.map(mapExpectSameResults);

  const expectationsEvaluations = mappedResults.map(({ name, passing }) => ({
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
          className="mt-3"
          titleClassName="text-sm"
          orientation="horizontal"
          data={expectationsEvaluations}
        />
      )}
    </div>
  );
}

export default ExpectationsResults;
