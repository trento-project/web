import React from 'react';
import Spinner from '@components/Spinner';

import { EOS_LENS_FILLED } from 'eos-icons-react';

const HealthIcon = ({ health = undefined }) => {
  switch (health) {
    case 'passing':
      return <EOS_LENS_FILLED className="fill-jungle-green-500" />;
    case 'warning':
      return <EOS_LENS_FILLED className="fill-yellow-500" />;
    case 'critical':
      return <EOS_LENS_FILLED className="fill-red-500" />;
    case 'pending':
      return <Spinner />;
    default:
      return <EOS_LENS_FILLED className="fill-gray-500" />;
  }
};

export default HealthIcon;
