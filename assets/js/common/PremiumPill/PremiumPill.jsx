// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';

import Pill from '@common/Pill';

/**
 * Marks a feature that may become premium. It does not restrict anything.
 */
function PremiumPill({ className = '' }) {
  return (
    <Pill size="xs" className={`bg-jungle-green-500 text-white ${className}`}>
      Premium
    </Pill>
  );
}

export default PremiumPill;
