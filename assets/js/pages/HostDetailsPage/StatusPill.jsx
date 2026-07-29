// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import classNames from 'classnames';

import { EOS_LENS_FILLED } from 'eos-icons-react';

import Pill from '@common/Pill';

const pillBgClass = 'bg-gray-200 text-gray-500 items-center';

function StatusPill({ className, children, status }) {
  switch (status) {
    case 'passing':
      return (
        <Pill className={classNames(className, pillBgClass)}>
          {children}:
          <EOS_LENS_FILLED size="base" className="fill-jungle-green-500 mx-1" />
          Reporting
        </Pill>
      );
    case 'critical':
      return (
        <Pill className={classNames(className, pillBgClass)}>
          {children}:
          <EOS_LENS_FILLED size="base" className="fill-red-500 mx-1" />
          Not reporting
        </Pill>
      );
    default:
      return (
        <Pill className={classNames(className, pillBgClass)}>
          {children}: Unknown
        </Pill>
      );
  }
}

export default StatusPill;
