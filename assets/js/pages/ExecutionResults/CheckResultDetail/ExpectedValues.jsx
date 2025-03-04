import React from 'react';

import ListView from '@common/ListView';
import ModifiedCheckPill from '@common/ModifiedCheckPill';

function ExpectedValues({
  isTargetHost = true,
  expectedValues = [],
  isError = false,
}) {
  if (!isTargetHost) {
    return null;
  }

  if (!isError && expectedValues.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Expected Values</div>
      {isError ? (
        <div className="mt-3 text-red-500 text-sm">
          Expected Values unavailable
        </div>
      ) : (
        <ListView
          className="mt-3 text-sm"
          titleClassName="text-sm"
          orientation="horizontal"
          data={expectedValues.map(({ name, value, customized }) => ({
            title: name,
            content: (
              <>
                <span className="align-middle">
                  {typeof value !== 'string' ? JSON.stringify(value) : value}
                </span>
                <ModifiedCheckPill className="ml-2" customized={customized} />
              </>
            ),
          }))}
        />
      )}
    </div>
  );
}

export default ExpectedValues;
