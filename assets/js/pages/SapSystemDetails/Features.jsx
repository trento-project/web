// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Pill from '@common/Pill';

function Features({ features }) {
  return (
    <div>
      {features.split('|').map((feature) => (
        <Pill key={feature}>{feature}</Pill>
      ))}
    </div>
  );
}

export default Features;
