// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';

import { Link } from 'react-router';

function HostLink({ hostId, children }) {
  return (
    <span
      id={`host-${hostId}`}
      className="tn-hostname text-jungle-green-500 hover:opacity-75"
    >
      <Link to={`/hosts/${hostId}`}>{children}</Link>
    </span>
  );
}

export default HostLink;
