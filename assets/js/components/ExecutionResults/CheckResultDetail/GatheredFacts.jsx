import React from 'react';

import ListView from '@components/ListView';

import FactValue from './FactValue';

const gatheredFactsToListView = (gatheredFacts) =>
  gatheredFacts.map(({ name, value, type, message }) => ({
    title: name,
    content: value,
    render: (factValue = {}) =>
      type ? (
        <span className="text-red-500">{message}</span>
      ) : (
        <FactValue data={factValue} />
      ),
  }));

function GatheredFacts({ isTargetHost = true, gatheredFacts = [] }) {
  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <div className="text-lg font-bold">Gathered Facts</div>

      {gatheredFacts.length === 0 && (
        <div className="mt-3 text-sm text-red-500">No facts were gathered</div>
      )}
      {isTargetHost && (
        <ListView
          className="grid-flow-row mt-3 text-sm"
          titleClassName="text-sm"
          orientation="horizontal"
          data={gatheredFactsToListView(gatheredFacts)}
        />
      )}

      {!isTargetHost &&
        gatheredFacts.map(({ name, value }) => (
          <FactValue key={name} className="mt-3 text-sm" data={value} />
        ))}
    </div>
  );
}

export default GatheredFacts;
