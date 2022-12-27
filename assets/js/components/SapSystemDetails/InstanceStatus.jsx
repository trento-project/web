import React from 'react';
import Pill from '@components/Pill/Pill';

function InstanceStatus({ health }) {
  let cssClass;
  let instanceStatus;

  switch (health) {
    case 'passing':
      cssClass = 'bg-jungle-green-500';
      instanceStatus = 'SAPControl-GREEN';
      break;
    case 'warning':
      cssClass = 'bg-yellow-500';
      instanceStatus = 'SAPControl-YELLOW';
      break;
    case 'critical':
      cssClass = 'bg-red-500';
      instanceStatus = 'SAPControl-RED';
      break;
    default:
      cssClass = 'bg-gray-500';
      instanceStatus = 'SAPControl-GRAY';
      break;
  }

  return (
    <Pill roundedMode="rounded" className={`${cssClass} text-gray-50`}>
      {instanceStatus}
    </Pill>
  );
}

export default InstanceStatus;
