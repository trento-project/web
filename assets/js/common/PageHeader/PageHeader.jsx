// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import classNames from 'classnames';

function PageHeader({ className, children }) {
  return (
    <h1 className={classNames('text-3xl pb-2 truncate', className)}>
      {children}
    </h1>
  );
}

export default PageHeader;
