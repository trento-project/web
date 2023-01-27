import React from 'react';
import classNames from 'classnames';

import { EOS_LENS_FILLED } from 'eos-icons-react';

import Pill from '@components/Pill';

function StatusPill({ className, children, heartbeat }) {
  switch (heartbeat) {
    case 'passing':
      return (
        <Pill
          className={classNames(
            className,
            'bg-gray-200 text-gray-500 items-center'
          )}
        >
          {children}:
          <EOS_LENS_FILLED size="base" className="fill-jungle-green-500 mx-1" />
          running
        </Pill>
      );
    case 'critical':
      return (
        <Pill
          className={classNames(
            'bg-gray-200 text-gray-500 items-center',
            className
          )}
        >
          {children}:
          <EOS_LENS_FILLED size="base" className="fill-red-500 px-2" />
          not running
        </Pill>
      );
    default:
      return (
        <Pill
          className={classNames(
            'bg-gray-200 text-gray-500 items-center',
            className
          )}
        >
          {children}: unknown
        </Pill>
      );
  }
}

export default StatusPill;
