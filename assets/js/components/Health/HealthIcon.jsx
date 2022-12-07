import React from 'react';
import { computedIconCssClass } from '@lib/icon';

import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
  EOS_LENS_FILLED,
} from 'eos-icons-react';

import Spinner from '@components/Spinner';
import classNames from 'classnames';

function HealthIcon({
  health = undefined,
  centered = false,
  hoverOpacity = true,
}) {
  const hoverOpacityClass = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };
  switch (health) {
    case 'passing':
      return (
        <EOS_CHECK_CIRCLE_OUTLINED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-jungle-green-500', centered)
          )}
        />
      );
    case 'warning':
      return (
        <EOS_WARNING_OUTLINED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
        />
      );
    case 'critical':
      return (
        <EOS_ERROR_OUTLINED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
        />
      );
    case 'pending':
      return <Spinner />;
    default:
      return (
        <EOS_LENS_FILLED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-gray-500', centered)
          )}
        />
      );
  }
}

export default HealthIcon;
