import React from 'react';

import { flow, lowerCase, startCase } from 'lodash';
import { EOS_LENS_FILLED } from 'eos-icons-react';

import Pill from '@common/Pill';

const getStateIcon = (state) => {
  switch (state) {
    case 'S_IDLE':
      return (
        <EOS_LENS_FILLED size="base" className="fill-jungle-green-500 mx-1" />
      );
    case 'S_TRANSITION_ENGINE':
      return <EOS_LENS_FILLED size="base" className="fill-red-500 mx-1" />;
    case 'unknown':
    case 'stopped':
      return <EOS_LENS_FILLED size="base" className="fill-gray-500 mx-1" />;
    default:
      return <EOS_LENS_FILLED size="base" className="fill-yellow-500 mx-1" />;
  }
};

// transformText removes the initial S_ prefix and title cases the text
const transformText = flow([(s) => s.replace(/^S_/, ''), lowerCase, startCase]);

function ClusterStatePill({ state = 'unknown' }) {
  return (
    <Pill className="self-center items-center shadow bg-gray-200 text-gray-500">
      State:
      {getStateIcon(state)}
      {transformText(state)}
    </Pill>
  );
}

export default ClusterStatePill;
