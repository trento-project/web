import React from 'react';
import classNames from 'classnames';

import Pill from '@components/Pill';

const StatusPill = ({ className, children, heartbeat}) => {
  switch (heartbeat) {
    case 'passing':
      return (
        <Pill
          className={classNames(className, 'bg-jungle-green-500 text-gray-100')}
        >
          {children}: running
        </Pill>
      );
    case 'critical':
      return (
        <Pill className={classNames('bg-red-200 text-red-800', className)}>
          {children}: not running
        </Pill>
      );
    default:
      return (
        <Pill className={classNames('bg-gray-200 text-gray-800', className)}>
          {children}: unknown
        </Pill>
      );
  }
};

export default StatusPill;
