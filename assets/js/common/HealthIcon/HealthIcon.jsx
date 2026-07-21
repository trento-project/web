// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

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
<<<<<<< HEAD
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-jungle-green-500', centered)
          )}
=======
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-jungle-green-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
>>>>>>> 387305d (Improve icon centering (#4524))
        />
      );
    case 'warning':
      return (
        <WarningIcon
<<<<<<< HEAD
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
=======
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-yellow-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
>>>>>>> 387305d (Improve icon centering (#4524))
        />
      );
    case 'critical':
      return (
        <CriticalIcon
<<<<<<< HEAD
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
=======
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-red-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
>>>>>>> 387305d (Improve icon centering (#4524))
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
<<<<<<< HEAD
=======
    }

    default: {
      return (
        <UnknownIcon
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-gray-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
        />
      );
    }
>>>>>>> 387305d (Improve icon centering (#4524))
  }
}

export default HealthIcon;
