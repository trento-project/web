import React from 'react';
import Spinner from '@components/Spinner';
import classNames from 'classnames';

import { EOS_LENS_FILLED } from 'eos-icons-react';

const HealthIcon = ({ health = undefined, centered = false }) => {

  const computedCssClass = (fillColor, centered) => {
    return classNames(
      fillColor,
      { 'mx-auto': centered }
    )
  }

  switch (health) {
    case 'passing':
      return <EOS_LENS_FILLED className={computedCssClass("fill-jungle-green-500", centered)} />;
    case 'warning':
      return <EOS_LENS_FILLED className={computedCssClass("fill-yellow-500", centered)} />;
    case 'critical':
      return <EOS_LENS_FILLED className={computedCssClass("fill-red-500", centered)} />;
    case 'pending':
      return <Spinner />;
    default:
      return <EOS_LENS_FILLED className={computedCssClass("fill-gray-500", centered)} />;
  }
};

export default HealthIcon;
