import React from 'react';

import Pill from '@components/Pill';

const getStatusPill = (status) =>
  status === 'healthy' ? (
    <Pill className="bg-green-200 text-green-800 mr-2">Healthy</Pill>
  ) : (
    <Pill className="bg-red-200 text-red-800 mr-2">Unhealthy</Pill>
  );

function SBDDetails({ sbdDevices }) {
  return (
    <>
      <div className="mt-8">
        <div>
          <h2 className="text-2xl font-bold">SBD/Fencing</h2>
        </div>
      </div>
      <div className="mt-2 bg-white shadow rounded-lg py-4 px-8 space-y-2 tn-sbd-details">
        {sbdDevices.map(({ device, status }) => (
          <div key={device}>
            {getStatusPill(status)} {device}
          </div>
        ))}
      </div>
    </>
  );
}

export default SBDDetails;
