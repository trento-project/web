// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { EOS_SCHEDULE_OUTLINED } from 'eos-icons-react';

import { getIconSize } from '@lib/icon';
import { formatDateTime } from '@lib/timezones';
import Tooltip from '@common/Tooltip';

/**
 * Augments an Icon component with stale data capabilities.
 *
 * If `staleAt` parameter is not falsey, then an additional icon is
 * added signifying that the state indicated by the original icon is
 * stale.  In addition to that, this component adds a Tooltip showing
 * since when the state is stale. The timezone for the staleness
 * message needs to be provided with the `timezone` property. The text
 * before the staleness info can be configured by `tooltipText`
 * property.
 */
function StaleIconWrapper(WrappedIcon) {
  function StaleAugmentedHealthIcon({
    staleAt,
    timezone,
    tooltipText,
    className,
    size,
    ...props
  }) {
    const convertedSize = getIconSize(size);
    const fillColor =
      className.split(' ').find((cls) => cls.startsWith('fill-')) ??
      'fill-gray-500';
    const tooltipContent = (
      <span className="block text-center">
        {tooltipText}
        {staleAt && (
          <>
            <br />
            (Stale since {formatDateTime(staleAt, timezone)})
          </>
        )}
      </span>
    );

    return (
      <div className="flex items-center mx-1">
        <Tooltip content={tooltipContent} place="top" isEanbled wrap={false}>
          <div className="relative">
            <WrappedIcon
              size={convertedSize}
              className={className}
              {...props}
            />
            {staleAt && (
              <EOS_SCHEDULE_OUTLINED
                size={convertedSize * 0.7}
                className={`${fillColor} absolute overflow-visible bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-white rounded-full`}
              />
            )}
          </div>
        </Tooltip>
      </div>
    );
  }

  return StaleAugmentedHealthIcon;
}

export default StaleIconWrapper;
