// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useSelector } from 'react-redux';

import { getUserProfile } from '@state/selectors/user';

import HomeHealthSummary from './HomeHealthSummary';

export function HomeHealthSummaryPage() {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  const { timezone } = useSelector(getUserProfile);

  return (
    <HomeHealthSummary
      sapSystemsHealth={sapSystemsHealth}
      loading={loading}
      userTimezone={timezone}
    />
  );
}
