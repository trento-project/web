// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import HealthIcon from '@common/HealthIcon';
import PageHeader from './PageHeader';

function DetailsViewHeader({ className, health, children }) {
  return (
    <PageHeader className={className}>
      <div className="flex items-center justify-center space-x-2">
        <HealthIcon health={health} size="xl" />
        <span>{children}</span>
      </div>
    </PageHeader>
  );
}

export default DetailsViewHeader;
