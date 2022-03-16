import React from 'react';
import classNames from 'classnames';

import Pill from '@components/Pill';

const HeartbeatPill = ({ className, heartbeat }) => {
  switch (heartbeat) {
    case 'passing':
      return (
        <Pill
          className={classNames(className, 'bg-jungle-green-500 text-gray-100')}
        >
          Agent: running
        </Pill>
      );
    case 'critical':
      return (
        <Pill className={classNames('bg-red-200 text-red-800', className)}>
          Agent: not running
        </Pill>
      );
    default:
      return (
        <Pill className={classNames('bg-gray-200 text-gray-800', className)}>
          Agent: unknown
        </Pill>
      );
  }
};

export default HeartbeatPill;
