// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

function Arrow({ children, onClick, ...rest }) {
  return (
    <div
      aria-hidden="true"
      role="button"
      className="cursor-pointer"
      onClick={() => onClick()}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Arrow;
