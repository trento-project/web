import React from 'react';
import { EOS_LENS_FILLED } from 'eos-icons-react';
import Pill from '@components/Pill/Pill';

function InstanceStatus({ health }) {
  let cssClass;
  let instanceStatus;

  switch (health) {
    case 'passing':
      cssClass = 'fill-jungle-green-500';
      instanceStatus = 'Green';
      break;
    case 'warning':
      cssClass = 'fill-yellow-500';
      instanceStatus = 'Yellow';
      break;
    case 'critical':
      cssClass = 'fill-red-500';
      instanceStatus = 'Red';
      break;
    default:
      cssClass = 'fill-gray-500';
      instanceStatus = 'Gray';
      break;
  }

  return (
    <Pill className="bg-gray-200 text-gray-500 items-center">
      SAPControl: <EOS_LENS_FILLED size="base" className={`${cssClass} mx-1`} />
      {instanceStatus}
    </Pill>
  );
}

export default InstanceStatus;
