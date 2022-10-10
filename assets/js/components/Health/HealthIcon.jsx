import React from 'react';
import { computedIconCssClass } from '@lib/icon';
import { Link } from 'react-router-dom';

import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
  EOS_LENS_FILLED,
} from 'eos-icons-react';

import Spinner from '@components/Spinner';

const HealthIcon = ({ health = undefined, centered = false, link }) => {
  switch (health) {
    case 'passing':
      return (
        <Link to={link}>
          <EOS_CHECK_CIRCLE_OUTLINED
            className={computedIconCssClass('fill-jungle-green-500', centered)}
          />
        </Link>
      );
    case 'warning':
      return (
        <Link to={link}>
          <EOS_WARNING_OUTLINED
            className={computedIconCssClass('fill-yellow-500', centered)}
          />
        </Link>
      );
    case 'critical':
      return (
        <Link to={link}>
          <EOS_ERROR_OUTLINED
            className={computedIconCssClass('fill-red-500', centered)}
          />
        </Link>
      );
    case 'pending':
      return <Spinner />;
    default:
      return (
        <Link to={link}>
          <EOS_LENS_FILLED
            className={computedIconCssClass('fill-gray-500', centered)}
          />
        </Link>
      );
  }
};

export default HealthIcon;
