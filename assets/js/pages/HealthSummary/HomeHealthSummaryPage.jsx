// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useSelector } from 'react-redux';
import HomeHealthSummary from './HomeHealthSummary';

export function HomeHealthSummaryPage() {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  return (
    <HomeHealthSummary sapSystemsHealth={sapSystemsHealth} loading={loading} />
  );
}
