// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

function Spinner({ className = '', size = 'm', ...props }) {
  return (
    <div role="alert" aria-label="Loading" className={className} {...props}>
      <EOS_LOADING_ANIMATED size={size} className="fill-jungle-green-500" />
    </div>
  );
}

export default Spinner;
