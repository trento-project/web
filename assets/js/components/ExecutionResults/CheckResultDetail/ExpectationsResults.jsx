import React from 'react';

import ListView from '@components/ListView';
import classNames from 'classnames';

function ExpectationsResults({
  results,
  isError = false,
  errorMessage = 'An error occurred',
}) {
  const expectationsResults = results.map(({ name, return_value }) => ({
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
          data={expectationsResults}
        />
      )}
    </div>
  );
}

export default ExpectationsResults;
