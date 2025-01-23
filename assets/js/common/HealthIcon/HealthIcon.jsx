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
  const passingIcon = () =>
    isLink ? EOS_CHECK_CIRCLE_FILLED : EOS_CHECK_CIRCLE_OUTLINED;
  const PassingIcon = passingIcon();

  const warningIcon = () =>
    isLink ? EOS_WARNING_FILLED : EOS_WARNING_OUTLINED;
  const WarningIcon = warningIcon();

  const criticalIcon = () => (isLink ? EOS_ERROR_FILLED : EOS_ERROR_OUTLINED);
  const CriticalIcon = criticalIcon();

  const absentIcon = () => (isLink ? EOS_INFO_FILLED : EOS_INFO_OUTLINED);
  const AbsentIcon = absentIcon();

  const hoverOpacityClass = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };
  switch (health) {
    case 'passing':
      return (
        <PassingIcon
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-jungle-green-500', centered)
          )}
        />
      );
    case 'warning':
      return (
        <WarningIcon
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
        />
      );
    case 'critical':
      return (
        <CriticalIcon
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
        />
      );
    case 'absent':
      return (
        <AbsentIcon
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
