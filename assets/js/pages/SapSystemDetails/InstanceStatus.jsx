// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  EOS_LENS_FILLED,
  EOS_INFO_OUTLINED,
  EOS_SCHEDULE_OUTLINED,
} from 'eos-icons-react';
import { capitalize } from 'lodash';
import { formatDateTime } from '@lib/timezones';
import Tooltip from '@common/Tooltip';

function InstanceStatus({ status, absent = false, staleAt = null, timezone }) {
  let cssClass;

  switch (status) {
    case 'green':
      cssClass = 'fill-jungle-green-500';
      break;
    case 'yellow':
      cssClass = 'fill-yellow-500';
      break;
    case 'red':
      cssClass = 'fill-red-500';
      break;
    default:
      cssClass = 'fill-gray-500';
      break;
  }

  const IconComponent = absent ? EOS_INFO_OUTLINED : EOS_LENS_FILLED;
  const iconClass = absent ? 'fill-black' : cssClass;

  const tooltipContent = (
    <span className="block text-center">
      {absent ? 'Registered instance not found.' : capitalize(status)}
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
      <Tooltip
        content={tooltipContent}
        place="top"
        isEnabled={true}
        wrap={false}
      >
        <div className="relative">
          <IconComponent size="20" className={iconClass} />
          {staleAt && (
            <EOS_SCHEDULE_OUTLINED
              size="14"
              className={`${iconClass} absolute -bottom-1 -right-1 bg-white rounded-full`}
            />
          )}
        </div>
      </Tooltip>
    </div>
  );
}

export default InstanceStatus;
