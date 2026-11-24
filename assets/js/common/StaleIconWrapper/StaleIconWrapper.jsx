// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import classNames from 'classnames';
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
 * message needs to be provided with the `timezone` property. The
 * content before the staleness info can be configured by
 * `tooltipContent` property.
 */
function StaleIconWrapper(WrappedIcon) {
  function StaleAugmentedHealthIcon({
    staleAt,
    tooltipEnabled = true,
    tooltipContent = null,
    timezone = 'Etc/UTC',
    size = 'm',
    className = '',
    centered = false,
    ariaLabel = 'Icon',
    containerProps = {},
    ...props
  }) {
    const convertedSize = getIconSize(size);
    const fillColor =
      className.split(' ').find((cls) => cls.startsWith('fill-')) ??
      'fill-gray-500';
    const tooltipComputedContent = (
      <div>
        {tooltipContent}
        {staleAt && (
          <span className="block text-center">
            {tooltipContent && '('}
            {`Stale since ${formatDateTime(staleAt, timezone)}`}
            {tooltipContent && ')'}
          </span>
        )}
      </div>
    );

    return (
      <Tooltip
        content={tooltipComputedContent}
        place="top"
        isEnabled={tooltipEnabled}
        wrap={false}
      >
        <div
          className="flex items-center mx-1"
          role="img"
          aria-label={`${ariaLabel}${staleAt ? ' Stale' : ''}`}
          {...containerProps}
          {...(staleAt && { 'data-stale': '' })}
        >
          <div className={classNames('relative', { 'mx-auto': centered })}>
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
        </div>
      </Tooltip>
    );
  }

  return StaleAugmentedHealthIcon;
}

export default StaleIconWrapper;
