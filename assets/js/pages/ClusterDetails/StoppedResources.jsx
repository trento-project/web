import React from 'react';

import Pill from '@common/Pill';

function StoppedResources({ resources }) {
  return (
    <div className="mt-8">
      <div className="flex flex-direction-row">
        <h2 className="text-2xl font-bold self-center">Stopped resources</h2>
      </div>
      <div className="mt-2 space-x-2">
        {resources.length === 0 ? (
          <p>No resources to display.</p>
        ) : (
          resources.map(({ id }) => (
            <Pill className="bg-gray-200 text-gray-800" key={id}>
              {id}
            </Pill>
          ))
        )}
      </div>
    </div>
  );
}

export default StoppedResources;
