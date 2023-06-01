import React from 'react';

import Pill from '@components/Pill';

function StoppedResources({ resources }) {
  return (
    <div className="mt-16">
      <div className="flex flex-direction-row">
        <h2 className="text-2xl font-bold self-center">Stopped resources</h2>
      </div>
      <div className="mt-2 space-x-2">
        {resources.map(({ id }) => (
          <Pill className="bg-gray-200 text-gray-800" key={id}>
            {id}
          </Pill>
        ))}
      </div>
    </div>
  );
}

export default StoppedResources;
