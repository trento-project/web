// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { EOS_LENS_FILLED, EOS_INFO_OUTLINED } from 'eos-icons-react';
import { capitalize } from 'lodash';
import Tooltip from '@common/Tooltip';

function InstanceStatus({ status, absent = false }) {
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

  return (
    <span className="flex items-center mx-1">
      <Tooltip
        content={absent ? 'Registered instance not found.' : capitalize(status)}
        place="top"
        isEnabled={true}
      >
        {absent ? (
          <EOS_INFO_OUTLINED size="20" className="fill-black" />
        ) : (
          <EOS_LENS_FILLED size="20" className={cssClass} />
        )}
      </Tooltip>
    </span>
  );
}

export default InstanceStatus;
