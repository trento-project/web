import React from 'react';

import Pill from '@common/Pill';

const getStatusPill = (status) =>
  status === 'healthy' ? (
    <Pill className="bg-green-200 text-green-800 mr-2">Healthy</Pill>
  ) : (
    <Pill className="bg-red-200 text-red-800 mr-2">Unhealthy</Pill>
  );

function SBDDetails({ sbdDevices }) {
  const sbdDetailsHeader = 'SBD/Fencing';
  const emptySBDListText = 'No additional fencing details to display.';
  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">{sbdDetailsHeader}</h2>
      </div>
      {sbdDevices?.length > 0 ? (
        <div className="mt-2 bg-white shadow rounded-lg py-4 px-8 space-y-2 tn-sbd-details">
          {sbdDevices.map(({ device, status }) => (
            <div key={device}>
              {getStatusPill(status)} {device}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">{emptySBDListText}</div>
      )}
    </>
  );
}

export default SBDDetails;
