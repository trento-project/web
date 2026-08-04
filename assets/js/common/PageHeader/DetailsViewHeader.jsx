// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import HealthIcon from '@common/HealthIcon';
import PageHeader from './PageHeader';

function DetailsViewHeader({ className, health, staleAt, timezone, children }) {
  return (
    <div
      className="flex items-center justify-center space-x-2"
      role="banner"
      aria-labelledby="page-heading"
    >
      <div className="pb-2">
        <HealthIcon
          health={health}
          size="xl"
          staleAt={staleAt}
          timezone={timezone}
        />
      </div>
      <PageHeader className={className}>
        <span>{children}</span>
      </PageHeader>
    </div>
  );
}

export default DetailsViewHeader;
