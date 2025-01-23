import React from 'react';
import { computedIconCssClass } from '@lib/icon';

import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_CHECK_CIRCLE_FILLED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
  EOS_LENS_FILLED,
  EOS_INFO_OUTLINED,
  EOS_ERROR_FILLED,
  EOS_WARNING_FILLED,
  EOS_INFO_FILLED,
} from 'eos-icons-react';

import Spinner from '@common/Spinner';
import classNames from 'classnames';

function HealthIcon({
  health = undefined,
  centered = false,
  hoverOpacity = true,
  size = 'l',
  isLink = false,
}) {
  const hoverOpacityClass = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };
  switch (health) {
    case 'passing':
      return isLink ? (
        <EOS_CHECK_CIRCLE_FILLED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-jungle-green-500', centered)
          )}
        />
      ) : (
        <EOS_CHECK_CIRCLE_OUTLINED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-jungle-green-500', centered)
          )}
        />
      );
    case 'warning':
      return isLink ? (
        <EOS_WARNING_FILLED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
        />
      ) : (
        <EOS_WARNING_OUTLINED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
        />
      );
    case 'critical':
      return isLink ? (
        <EOS_ERROR_FILLED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
        />
      ) : (
        <EOS_ERROR_OUTLINED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
        />
      );
    case 'absent':
      return isLink ? (
        <EOS_INFO_FILLED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-black', centered)
          )}
        />
      ) : (
        <EOS_INFO_OUTLINED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-black', centered)
          )}
        />
      );
    case 'pending':
      return <Spinner />;
    default:
      return (
        <EOS_LENS_FILLED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-gray-500', centered)
          )}
        />
      );
  }
}

export default HealthIcon;
