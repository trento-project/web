import React from 'react';
import { computedIconCssClass } from '@lib/icon';

import { EOS_LENS_FILLED } from 'eos-icons-react';

import Spinner from '@components/Spinner';

const HealthIcon = ({ health = undefined, centered = false }) => {
  switch (health) {
    case 'passing':
      return (
        <EOS_LENS_FILLED
          className={computedIconCssClass('fill-jungle-green-500', centered)}
        />
      );
    case 'warning':
      return (
        <EOS_LENS_FILLED
          className={computedIconCssClass('fill-yellow-500', centered)}
        />
      );
    case 'critical':
      return (
        <EOS_LENS_FILLED
          className={computedIconCssClass('fill-red-500', centered)}
        />
      );
    case 'pending':
      return <Spinner />;
    default:
      return (
        <EOS_LENS_FILLED
          className={computedIconCssClass('fill-gray-500', centered)}
        />
      );
  }
};

export default HealthIcon;
