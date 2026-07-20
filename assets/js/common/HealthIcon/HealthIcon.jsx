// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

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
import { flow } from 'lodash';
import Spinner from '@common/Spinner';
import StaleIconWrapper from '@common/StaleIconWrapper';

// Makes sure an Icon, when rendered with `centered`, has its output wrapped
// in a horizontally centering container.
const Centerable = (Icon) =>
  function CenteredIcon({ centered = false, ...props }) {
    return centered ? (
      <div className="w-fit mx-auto">
        <Icon {...props} />
      </div>
    ) : (
      <Icon {...props} />
    );
  };

const CenteredStaleIcon = flow(StaleIconWrapper, Centerable);

const PassingIconBlank = CenteredStaleIcon(EOS_CHECK_CIRCLE_OUTLINED);
const PassingIconLink = CenteredStaleIcon(EOS_CHECK_CIRCLE_FILLED);
const WarningIconBlank = CenteredStaleIcon(EOS_WARNING_OUTLINED);
const WarningIconLink = CenteredStaleIcon(EOS_WARNING_FILLED);
const CriticalIconBlank = CenteredStaleIcon(EOS_ERROR_OUTLINED);
const CriticalIconLink = CenteredStaleIcon(EOS_ERROR_FILLED);
const UnknownIcon = CenteredStaleIcon(EOS_LENS_FILLED);
const PendingIcon = Centerable(Spinner);
const NotAvailableIcon = Centerable(EOS_REMOVE_FILLED);

function HealthIcon({
  health = undefined,
  centered = false,
  hoverOpacity = true,
  size = 'l',
  isLink = false,
  staleAt = null,
  timezone = 'Etc/UTC',
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
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-jungle-green-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
        />
      );
    }

    case 'warning': {
      const WarningIcon = isLink ? WarningIconLink : WarningIconBlank;
      return (
        <WarningIcon
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-yellow-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
        />
      );
    }

    case 'critical': {
      const CriticalIcon = isLink ? CriticalIconLink : CriticalIconBlank;
      return (
        <CriticalIcon
          centered={centered}
          className={classNames(hoverOpacityClass, 'fill-red-500')}
          size={size}
          staleAt={staleAt}
          timezone={timezone}
          tooltipEnabled={!!staleAt}
        />
      );
    }

    case 'pending': {
      return <PendingIcon centered={centered} />;
    }

    case 'not_available': {
      return (
        <NotAvailableIcon
          centered={centered}
          size={size}
          className={classNames(hoverOpacityClass, 'fill-gray-500')}
        />
      );
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
  }
}

export default HealthIcon;
