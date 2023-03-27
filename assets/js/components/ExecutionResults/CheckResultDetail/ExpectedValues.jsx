import React from 'react';

import ListView from '@components/ListView';

function ExpectedValues({ expectedValues = [], isCheckError = false }) {
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

export default ExpectedValues;
