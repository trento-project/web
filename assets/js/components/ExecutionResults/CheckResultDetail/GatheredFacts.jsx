import React from 'react';

import ListView from '@components/ListView';
import ObjectTree from '@components/ObjectTree';

function GatheredFacts({ gatheredFacts = [] }) {
  const facts = gatheredFacts.map(({ name, value, type, message }) => {
    const isFactError = !!type;

    return {
      title: name,
      content: value,
      render: (factValue = {}) =>
        isFactError ? (
          <span className="text-red-500">{message}</span>
        ) : (
          <ObjectTree className="mt-3" data={factValue} />
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

export default GatheredFacts;
