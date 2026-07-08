// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { capitalize } from 'lodash';

import { computedIconCssClass } from '@lib/icon';

import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_CHECK_CIRCLE_FILLED,
  EOS_ERROR_OUTLINED,
  EOS_WARNING_OUTLINED,
  EOS_LENS_FILLED,
  EOS_ERROR_FILLED,
  EOS_WARNING_FILLED,
  EOS_REMOVE_FILLED,
} from 'eos-icons-react';

import classNames from 'classnames';
import Spinner from '@common/Spinner';
import StaleIconWrapper from '@common/StaleIconWrapper';

const PassingIconBlank = StaleIconWrapper(EOS_CHECK_CIRCLE_OUTLINED);
const PassingIconLink = StaleIconWrapper(EOS_CHECK_CIRCLE_FILLED);
const WarningIconBlank = StaleIconWrapper(EOS_WARNING_OUTLINED);
const WarningIconLink = StaleIconWrapper(EOS_WARNING_FILLED);
const CriticalIconBlank = StaleIconWrapper(EOS_ERROR_OUTLINED);
const CriticalIconLink = StaleIconWrapper(EOS_ERROR_FILLED);
const UnknownIcon = StaleIconWrapper(EOS_LENS_FILLED);

function HealthIcon({
  health = undefined,
  centered = false,
  hoverOpacity = true,
  size = 'l',
  isLink = false,
  staleAt = null,
}) {
  const hoverOpacityClass = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };

  switch (health) {
    case 'passing': {
      const PassingIcon = isLink ? PassingIconLink : PassingIconBlank;
      return (
        <PassingIcon
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-jungle-green-500', centered)
          )}
          size={size}
          staleAt={staleAt}
          timezone={'Etc/UTC'}
          tooltipEnabled={!!staleAt}
        />
      );
    }

    case 'warning': {
      const WarningIcon = isLink ? WarningIconLink : WarningIconBlank;
      return (
        <WarningIcon
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
          size={size}
          staleAt={staleAt}
          timezone={'Etc/UTC'}
          tooltipEnabled={!!staleAt}
        />
      );
    }

    case 'critical': {
      const CriticalIcon = isLink ? CriticalIconLink : CriticalIconBlank;
      return (
        <CriticalIcon
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
          size={size}
          staleAt={staleAt}
          timezone={'Etc/UTC'}
          tooltipEnabled={!!staleAt}
        />
      );
    }

    case 'pending': {
      return <Spinner />;
    }

    case 'not_available': {
      return (
        <EOS_REMOVE_FILLED
          size={size}
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-gray-500', centered)
          )}
        />
      );
    }

    default: {
      return (
        <UnknownIcon
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-gray-500', centered)
          )}
          size={size}
          staleAt={staleAt}
          timezone={'Etc/UTC'}
          tooltipEnabled={!!staleAt}
        />
      );
    }
  }
}

export default HealthIcon;
